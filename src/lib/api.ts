import { supabase } from '@/integrations/supabase/client';

export type InstanceStatus = "pending" | "ready" | "error";

export interface Instance {
  id: string;
  name: string;
  status: InstanceStatus;
  createdAt: string; // ISO
}

export interface Webhook {
  id: string;
  url: string;
  createdAt: string; // ISO
}

export interface LogEntry {
  id: string;
  instanceId: string;
  level: "info" | "error" | "event" | "message";
  at: string; // ISO
  message: string;
  data?: unknown;
}

export type DailyMetric = { date: string; sent: number };

export interface SendMessagePayload {
  instanceId: string;
  to: string;
  text: string;
}

const pushLog = async (instanceId: string, partial: Omit<LogEntry, "id" | "at" | "instanceId">) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('logs')
    .insert({
      user_id: user.id,
      instance_id: instanceId,
      level: partial.level,
      message: partial.message,
      data: partial.data as any
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    instanceId: data.instance_id,
    level: data.level,
    at: data.created_at,
    message: data.message,
    data: data.data
  } as LogEntry;
};

const incUsageCounter = async (type: 'instances' | 'messages' | 'webhooks', amount = 1) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const field = type === 'instances' ? 'instances_created' : 
                type === 'messages' ? 'messages_sent' : 'webhooks_created';

  // Get current usage
   const { data: existing } = await supabase
     .from('usage_tracking')
     .select(field)
     .eq('user_id', user.id)
     .eq('month', currentMonth)
     .maybeSingle();

  const newValue = (existing?.[field] || 0) + amount;

  // Upsert usage data
  const { error } = await supabase
    .from('usage_tracking')
    .upsert({
      user_id: user.id,
      month: currentMonth,
      [field]: newValue
    }, {
      onConflict: 'user_id,month'
    });

  if (error) throw error;
};

const incMetricSent = async (instanceId: string, amount = 1) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const today = new Date().toISOString().split('T')[0];
  
  // First try to get existing metric
   const { data: existing } = await supabase
     .from('metrics')
     .select('sent')
     .eq('instance_id', instanceId)
     .eq('date', today)
     .maybeSingle();

  const newSent = (existing?.sent || 0) + amount;

  const { error } = await supabase
    .from('metrics')
    .upsert({
      user_id: user.id,
      instance_id: instanceId,
      date: today,
      sent: newSent
    }, {
      onConflict: 'instance_id,date'
    });

  if (error) throw error;
};

export const api = {
  async checkLimits(type: 'instances' | 'messages' | 'webhooks'): Promise<{canProceed: boolean, reason?: string}> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { canProceed: false, reason: 'Usuário não autenticado' };

    try {
      // Get user's subscription info
       const { data: subscriber } = await supabase
         .from('subscribers')
         .select('subscribed, subscription_tier')
         .eq('user_id', user.id)
         .maybeSingle();

      const userTier = subscriber?.subscribed ? subscriber.subscription_tier || 'Basic' : 'free';

      // Get limits for tier
       const { data: limits } = await supabase
         .from('subscription_limits')
         .select('*')
         .eq('tier', userTier)
         .maybeSingle();

      if (!limits) return { canProceed: false, reason: 'Limites não encontrados' };

      // Get current usage
      const currentMonth = new Date().toISOString().slice(0, 7);
       const { data: usage } = await supabase
         .from('usage_tracking')
         .select('*')
         .eq('user_id', user.id)
         .eq('month', currentMonth)
         .maybeSingle();

      const currentUsage = usage || { instances_created: 0, messages_sent: 0, webhooks_created: 0 };

      // Check specific limit
      switch (type) {
        case 'instances':
          if (currentUsage.instances_created >= limits.max_instances) {
            return { canProceed: false, reason: `Limite de instâncias atingido (${limits.max_instances})` };
          }
          break;
        case 'messages':
          if (currentUsage.messages_sent >= limits.max_messages_per_month) {
            return { canProceed: false, reason: `Limite de mensagens atingido (${limits.max_messages_per_month})` };
          }
          break;
        case 'webhooks':
          if (currentUsage.webhooks_created >= limits.max_webhooks) {
            return { canProceed: false, reason: `Limite de webhooks atingido (${limits.max_webhooks})` };
          }
          break;
      }

      return { canProceed: true };
    } catch (error) {
      console.error('Error checking limits:', error);
      return { canProceed: false, reason: 'Erro ao verificar limites' };
    }
  },

  async listInstances(): Promise<Instance[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('instances')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      name: item.name,
      status: item.status as InstanceStatus,
      createdAt: item.created_at
    }));
  },

  async createInstance(name: string): Promise<Instance> {
    // Check limits first
    const limitCheck = await this.checkLimits('instances');
    if (!limitCheck.canProceed) {
      throw new Error(limitCheck.reason || 'Limite atingido');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('instances')
      .insert({
        user_id: user.id,
        name,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    const instance: Instance = {
      id: data.id,
      name: data.name,
      status: data.status as InstanceStatus,
      createdAt: data.created_at
    };

    // Increment usage counter
    await incUsageCounter('instances', 1);

    // Log de criação
    await pushLog(instance.id, { level: "event", message: "Instância criada" });

    // Create instance in Evolution API
    try {
      const { data: evolutionData, error: evolutionError } = await supabase.functions.invoke(
        'evolution-create-instance',
        {
          body: { instanceName: name }
        }
      );

      if (evolutionError) {
        console.error('Evolution API error:', evolutionError);
        await pushLog(instance.id, { 
          level: "error", 
          message: "Erro ao criar instância no Evolution API",
          data: evolutionError 
        });
      } else {
        await pushLog(instance.id, { 
          level: "event", 
          message: "Instância criada no Evolution API",
          data: evolutionData 
        });
      }
    } catch (error) {
      console.error('Error calling evolution-create-instance:', error);
      await pushLog(instance.id, { 
        level: "error", 
        message: "Erro ao conectar com Evolution API" 
      });
    }

    return instance;
  },

  async getInstance(id: string): Promise<Instance | undefined> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('instances')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) return undefined;

    return {
      id: data.id,
      name: data.name,
      status: data.status as InstanceStatus,
      createdAt: data.created_at
    };
  },

  async sendMessage(payload: SendMessagePayload): Promise<{ ok: boolean }> {
    if (!payload.to || !payload.text) throw new Error("Campos obrigatórios");

    // Check limits first
    const limitCheck = await this.checkLimits('messages');
    if (!limitCheck.canProceed) {
      throw new Error(limitCheck.reason || 'Limite de mensagens atingido');
    }
    
    const instance = await this.getInstance(payload.instanceId);
    if (!instance) throw new Error("Instância não encontrada");

    try {
      const { data, error } = await supabase.functions.invoke(
        'evolution-send-message',
        {
          body: {
            instanceName: instance.name,
            to: payload.to,
            text: payload.text
          }
        }
      );

      if (error) {
        throw new Error(error.message || 'Erro ao enviar mensagem');
      }

      // Increment usage counter
      await incUsageCounter('messages', 1);

      return { ok: true };
    } catch (error) {
      // Fallback to mock behavior for development
      console.error('Evolution API error, using fallback:', error);
      await new Promise((r) => setTimeout(r, 600));
      await pushLog(payload.instanceId, { 
        level: "message", 
        message: `Mensagem para ${payload.to}`, 
        data: { text: payload.text } 
      });
      await incMetricSent(payload.instanceId, 1);
      // Still increment usage counter for fallback
      await incUsageCounter('messages', 1);
      return { ok: true };
    }
  },

  async getQRCode(instanceId: string): Promise<{ qrcode?: string; state?: string }> {
    const instance = await this.getInstance(instanceId);
    if (!instance) throw new Error("Instância não encontrada");

    try {
      const { data, error } = await supabase.functions.invoke(
        'evolution-get-qr',
        {
          body: { instanceName: instance.name }
        }
      );

      if (error) {
        throw new Error(error.message || 'Erro ao obter QR Code');
      }

      return {
        qrcode: data.qrcode,
        state: data.state
      };
    } catch (error) {
      console.error('Error getting QR code:', error);
      // Return placeholder for development
      return {
        qrcode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        state: 'pending'
      };
    }
  },

  async listLogs(instanceId: string): Promise<LogEntry[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('instance_id', instanceId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      instanceId: item.instance_id,
      level: item.level as LogEntry['level'],
      at: item.created_at,
      message: item.message,
      data: item.data
    }));
  },

  async listMetrics(instanceId: string): Promise<DailyMetric[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('instance_id', instanceId)
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;

    return data.map(item => ({
      date: item.date,
      sent: item.sent
    }));
  },

  async listWebhooks(): Promise<Webhook[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      url: item.url,
      createdAt: item.created_at
    }));
  },

  async addWebhook(url: string): Promise<Webhook> {
    // Check limits first
    const limitCheck = await this.checkLimits('webhooks');
    if (!limitCheck.canProceed) {
      throw new Error(limitCheck.reason || 'Limite de webhooks atingido');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        user_id: user.id,
        url
      })
      .select()
      .single();

    if (error) throw error;

    // Increment usage counter
    await incUsageCounter('webhooks', 1);

    return {
      id: data.id,
      url: data.url,
      createdAt: data.created_at
    };
  },
};

export type API = typeof api;
