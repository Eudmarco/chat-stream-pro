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

export interface SendMessagePayload {
  instanceId: string;
  to: string;
  text: string;
}

const KEYS = {
  instances: "mock.instances",
  webhooks: "mock.webhooks",
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

    // Simular provisionamento: após 1.5s, status "ready" (best-effort, não aguardamos)
    setTimeout(() => {
      const curr = load<Instance[]>(KEYS.instances, []);
      const updated = curr.map((i) => (i.id === instance.id ? { ...i, status: "ready" } : i));
      save(KEYS.instances, updated);
    }, 1500);

    return instance;
  },

  async getInstance(id: string): Promise<Instance | undefined> {
    const items = load<Instance[]>(KEYS.instances, []);
    return items.find((i) => i.id === id);
  },

  async sendMessage(payload: SendMessagePayload): Promise<{ ok: boolean }> {
    // Mock: apenas validação superficial
    if (!payload.to || !payload.text) throw new Error("Campos obrigatórios");
    await new Promise((r) => setTimeout(r, 600));
    return { ok: true };
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
