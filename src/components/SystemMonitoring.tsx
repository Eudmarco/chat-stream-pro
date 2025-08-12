import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemStatus {
  database: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
  stripe: 'healthy' | 'warning' | 'error';
  evolution: 'healthy' | 'warning' | 'error';
  lastCheck: Date;
  responseTime: number;
}

interface SystemMetrics {
  totalUsers: number;
  activeInstances: number;
  messagesSent24h: number;
  errorRate: number;
  avgResponseTime: number;
}

export function SystemMonitoring() {
  const [status, setStatus] = useState<SystemStatus>({
    database: 'healthy',
    api: 'healthy',
    stripe: 'healthy',
    evolution: 'healthy',
    lastCheck: new Date(),
    responseTime: 0
  });
  
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    activeInstances: 0,
    messagesSent24h: 0,
    errorRate: 0,
    avgResponseTime: 0
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkSystemHealth = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      // Test database connectivity
      const { error: dbError } = await supabase.from('instances').select('count', { count: 'exact', head: true });
      const dbStatus = dbError ? 'error' : 'healthy';

      // Test Stripe integration
      let stripeStatus: 'healthy' | 'warning' | 'error' = 'healthy';
      try {
        const { error: stripeError } = await supabase.functions.invoke('check-subscription');
        stripeStatus = stripeError ? 'warning' : 'healthy';
      } catch {
        stripeStatus = 'error';
      }

      // Test Evolution API
      let evolutionStatus: 'healthy' | 'warning' | 'error' = 'healthy';
      try {
        const { error: evolutionError } = await supabase.functions.invoke('evolution-get-qr', {
          body: { instanceId: 'test' }
        });
        evolutionStatus = evolutionError ? 'warning' : 'healthy';
      } catch {
        evolutionStatus = 'error';
      }

      const responseTime = Date.now() - startTime;

      setStatus({
        database: dbStatus,
        api: 'healthy',
        stripe: stripeStatus,
        evolution: evolutionStatus,
        lastCheck: new Date(),
        responseTime
      });

      // Get system metrics
      await fetchMetrics();

    } catch (error) {
      console.error('Health check failed:', error);
      toast({
        title: "Erro no monitoramento",
        description: "Falha ao verificar status do sistema",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      // Get total users (subscribers)
      const { count: userCount } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true });

      // Get active instances
      const { count: instanceCount } = await supabase
        .from('instances')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Get messages sent in last 24h from logs
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: messageCount } = await supabase
        .from('logs')
        .select('*', { count: 'exact', head: true })
        .eq('level', 'info')
        .ilike('message', '%message sent%')
        .gte('created_at', yesterday.toISOString());

      // Get error rate from logs
      const { count: totalLogs } = await supabase
        .from('logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());

      const { count: errorLogs } = await supabase
        .from('logs')
        .select('*', { count: 'exact', head: true })
        .eq('level', 'error')
        .gte('created_at', yesterday.toISOString());

      const errorRate = totalLogs ? (errorLogs || 0) / totalLogs * 100 : 0;

      setMetrics({
        totalUsers: userCount || 0,
        activeInstances: instanceCount || 0,
        messagesSent24h: messageCount || 0,
        errorRate: Math.round(errorRate * 100) / 100,
        avgResponseTime: status.responseTime
      });

    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  useEffect(() => {
    checkSystemHealth();
    // Auto refresh every 5 minutes
    const interval = setInterval(checkSystemHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (statusType: 'healthy' | 'warning' | 'error') => {
    switch (statusType) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (statusType: 'healthy' | 'warning' | 'error') => {
    switch (statusType) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
    }
  };

  const overallStatus = Object.values(status).some(s => s === 'error') ? 'error' :
                       Object.values(status).some(s => s === 'warning') ? 'warning' : 'healthy';

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            {getStatusIcon(overallStatus)}
            Status do Sistema
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={checkSystemHealth}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Última verificação: {status.lastCheck.toLocaleString('pt-BR')}
            <span className="ml-2">• Tempo de resposta: {status.responseTime}ms</span>
          </div>
        </CardContent>
      </Card>

      {/* System Components Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banco de Dados</CardTitle>
            {getStatusIcon(status.database)}
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(status.database)}>
              {status.database === 'healthy' ? 'Online' : 
               status.database === 'warning' ? 'Atenção' : 'Offline'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Principal</CardTitle>
            {getStatusIcon(status.api)}
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(status.api)}>
              {status.api === 'healthy' ? 'Online' : 
               status.api === 'warning' ? 'Atenção' : 'Offline'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stripe</CardTitle>
            {getStatusIcon(status.stripe)}
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(status.stripe)}>
              {status.stripe === 'healthy' ? 'Online' : 
               status.stripe === 'warning' ? 'Atenção' : 'Offline'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evolution API</CardTitle>
            {getStatusIcon(status.evolution)}
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(status.evolution)}>
              {status.evolution === 'healthy' ? 'Online' : 
               status.evolution === 'warning' ? 'Atenção' : 'Offline'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instâncias Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeInstances}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens 24h</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.messagesSent24h}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resp. Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResponseTime}ms</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {overallStatus !== 'healthy' && (
        <Alert variant={overallStatus === 'error' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {overallStatus === 'error' 
              ? 'Detectados problemas críticos no sistema. Verifique os componentes marcados em vermelho.'
              : 'Alguns componentes requerem atenção. Monitore os serviços marcados em amarelo.'
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}