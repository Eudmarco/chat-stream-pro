import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { useSubscription } from '@/hooks/useSubscription';
import { RefreshCw, Crown, Zap } from 'lucide-react';

const UsageLimitsCard: React.FC = () => {
  const { limits, usage, loading, error, refreshUsage } = useUsageLimits();
  const { subscribed, subscription_tier, createCheckout, openCustomerPortal } = useSubscription();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Uso e Limites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Uso e Limites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">{error}</p>
          <Button onClick={refreshUsage} variant="outline" size="sm" className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!limits || !usage) {
    return null;
  }

  const currentTier = subscribed ? subscription_tier || 'Basic' : 'free';
  const getUsagePercentage = (used: number, max: number) => {
    return max > 0 ? Math.min((used / max) * 100, 100) : 0;
  };

  const getProgressVariant = (percentage: number) => {
    if (percentage >= 90) return 'destructive';
    if (percentage >= 70) return 'warning';
    return 'default';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Uso e Limites
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={subscribed ? 'default' : 'secondary'} className="capitalize">
              {currentTier === 'free' ? 'Gratuito' : currentTier}
            </Badge>
            <Button onClick={refreshUsage} variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instâncias */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Instâncias</span>
            <span className="text-muted-foreground">
              {usage.instances_created} / {limits.max_instances}
            </span>
          </div>
          <Progress 
            value={getUsagePercentage(usage.instances_created, limits.max_instances)}
            className="h-2"
          />
          {usage.instances_created >= limits.max_instances && (
            <p className="text-xs text-destructive">
              Limite de instâncias atingido
            </p>
          )}
        </div>

        {/* Mensagens */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Mensagens (mês atual)</span>
            <span className="text-muted-foreground">
              {usage.messages_sent} / {limits.max_messages_per_month}
            </span>
          </div>
          <Progress 
            value={getUsagePercentage(usage.messages_sent, limits.max_messages_per_month)}
            className="h-2"
          />
          {usage.messages_sent >= limits.max_messages_per_month && (
            <p className="text-xs text-destructive">
              Limite de mensagens atingido
            </p>
          )}
        </div>

        {/* Webhooks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Webhooks</span>
            <span className="text-muted-foreground">
              {usage.webhooks_created} / {limits.max_webhooks}
            </span>
          </div>
          <Progress 
            value={getUsagePercentage(usage.webhooks_created, limits.max_webhooks)}
            className="h-2"
          />
          {usage.webhooks_created >= limits.max_webhooks && (
            <p className="text-xs text-destructive">
              Limite de webhooks atingido
            </p>
          )}
        </div>

        {/* Upgrade/Manage buttons */}
        <div className="pt-4 border-t">
          {!subscribed ? (
            <Button 
              onClick={() => createCheckout('Premium')} 
              className="w-full"
              variant="default"
            >
              <Crown className="h-4 w-4 mr-2" />
              Fazer Upgrade
            </Button>
          ) : (
            <Button 
              onClick={openCustomerPortal} 
              variant="outline" 
              className="w-full"
            >
              Gerenciar Assinatura
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageLimitsCard;