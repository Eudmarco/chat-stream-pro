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

const KEYS = {
  instances: "mock.instances",
  webhooks: "mock.webhooks",
  logs: "mock.logs",
  metrics: "mock.metrics",
};

const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const save = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const nowIso = () => new Date().toISOString();

const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

type LogsMap = Record<string, LogEntry[]>;
type MetricsMap = Record<string, DailyMetric[]>;

const pushLog = (instanceId: string, partial: Omit<LogEntry, "id" | "at" | "instanceId">) => {
  const map = load<LogsMap>(KEYS.logs, {});
  const arr = map[instanceId] ?? [];
  const entry: LogEntry = { id: uid(), instanceId, at: nowIso(), ...partial };
  map[instanceId] = [entry, ...arr].slice(0, 200);
  save(KEYS.logs, map);
  return entry;
};

const incMetricSent = (instanceId: string, amount = 1) => {
  const map = load<MetricsMap>(KEYS.metrics, {});
  const today = new Date().toISOString().slice(0, 10);
  const arr = map[instanceId] ?? [];
  const idx = arr.findIndex((d) => d.date === today);
  if (idx >= 0) arr[idx] = { ...arr[idx], sent: arr[idx].sent + amount };
  else arr.unshift({ date: today, sent: amount });
  map[instanceId] = arr.slice(0, 30);
  save(KEYS.metrics, map);
};

export const api = {
  async listInstances(): Promise<Instance[]> {
    return load<Instance[]>(KEYS.instances, []);
  },

  async createInstance(name: string): Promise<Instance> {
    const items = load<Instance[]>(KEYS.instances, []);
    const instance: Instance = {
      id: uid(),
      name,
      status: "pending",
      createdAt: nowIso(),
    };
    const next = [instance, ...items];
    save(KEYS.instances, next);

    // Log de criação
    pushLog(instance.id, { level: "event", message: "Instância criada" });

    // Simular provisionamento: após 1.5s, status "ready" (best-effort, não aguardamos)
    setTimeout(() => {
      const curr = load<Instance[]>(KEYS.instances, []);
      const updated = curr.map((i) => (i.id === instance.id ? { ...i, status: "ready" } : i));
      save(KEYS.instances, updated);
      pushLog(instance.id, { level: "event", message: "Instância pronta" });
    }, 1500);

    return instance;
  },

  async getInstance(id: string): Promise<Instance | undefined> {
    const items = load<Instance[]>(KEYS.instances, []);
    return items.find((i) => i.id === id);
  },

  async sendMessage(payload: SendMessagePayload): Promise<{ ok: boolean }> {
    if (!payload.to || !payload.text) throw new Error("Campos obrigatórios");
    await new Promise((r) => setTimeout(r, 600));
    pushLog(payload.instanceId, { level: "message", message: `Mensagem para ${payload.to}`, data: { text: payload.text } });
    incMetricSent(payload.instanceId, 1);
    return { ok: true };
  },

  async listLogs(instanceId: string): Promise<LogEntry[]> {
    const map = load<Record<string, LogEntry[]>>(KEYS.logs, {});
    return map[instanceId] ?? [];
  },

  async listMetrics(instanceId: string): Promise<DailyMetric[]> {
    const map = load<Record<string, DailyMetric[]>>(KEYS.metrics, {});
    return map[instanceId] ?? [];
  },

  async listWebhooks(): Promise<Webhook[]> {
    return load<Webhook[]>(KEYS.webhooks, []);
  },

  async addWebhook(url: string): Promise<Webhook> {
    const items = load<Webhook[]>(KEYS.webhooks, []);
    const webhook: Webhook = { id: uid(), url, createdAt: nowIso() };
    const next = [webhook, ...items];
    save(KEYS.webhooks, next);
    return webhook;
  },
};

export type API = typeof api;
