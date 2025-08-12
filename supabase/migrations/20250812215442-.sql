-- Inserir dados dos planos de assinatura na tabela subscription_limits
INSERT INTO public.subscription_limits (tier, max_instances, max_messages_per_month, max_webhooks) VALUES 
('free', 1, 100, 1),
('Basic', 3, 1000, 3),
('Premium', 10, 10000, 10)
ON CONFLICT (tier) DO UPDATE SET
  max_instances = EXCLUDED.max_instances,
  max_messages_per_month = EXCLUDED.max_messages_per_month,
  max_webhooks = EXCLUDED.max_webhooks;