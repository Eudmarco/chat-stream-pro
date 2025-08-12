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
    .single();

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

    return {
      id: data.id,
      url: data.url,
      createdAt: data.created_at
    };
  },
};

export type API = typeof api;
