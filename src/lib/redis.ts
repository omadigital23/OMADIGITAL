// Redis (Upstash) client with graceful fallback

if (typeof window !== 'undefined') {
  throw new Error('redis.ts should never be imported on the client');
}

let upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
let upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export type RedisClient = {
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<void>;
  get: (key: string) => Promise<string | null>;
  del: (key: string) => Promise<void>;
};

class InMemoryRedis implements RedisClient {
  private store = new Map<string, { value: number; expiresAt?: number }>();

  async incr(key: string): Promise<number> {
    const now = Date.now();
    const entry = this.store.get(key);
    if (!entry || (entry.expiresAt && entry.expiresAt < now)) {
      this.store.set(key, { value: 1 });
      return 1;
    }
    entry.value += 1;
    return entry.value;
  }

  async expire(key: string, seconds: number): Promise<void> {
    const expiresAt = Date.now() + seconds * 1000;
    const entry = this.store.get(key) || { value: 0 };
    entry.expiresAt = expiresAt;
    this.store.set(key, entry);
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return String(entry.value);
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

class UpstashRedis implements RedisClient {
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  private async call<T = any>(path: string, body: any[]): Promise<T> {
    const res = await fetch(`${this.url}/${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Upstash REST API expects JSON array for commands
        // But /incr, /expire, /get, /del have dedicated endpoints accepting args
      }),
    } as RequestInit);
    return (await res.json()) as T;
  }

  async incr(key: string): Promise<number> {
    const res = await fetch(`${this.url}/incr/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    } as RequestInit);
    const data = await res.json();
    return data.result as number;
  }

  async expire(key: string, seconds: number): Promise<void> {
    await fetch(`${this.url}/expire/${encodeURIComponent(key)}/${seconds}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    } as RequestInit);
  }

  async get(key: string): Promise<string | null> {
    const res = await fetch(`${this.url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    } as RequestInit);
    const data = await res.json();
    return data.result ?? null;
  }

  async del(key: string): Promise<void> {
    await fetch(`${this.url}/del/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    } as RequestInit);
  }
}

export function getRedis(): RedisClient {
  if (upstashUrl && upstashToken) {
    return new UpstashRedis(upstashUrl, upstashToken);
  }
  return new InMemoryRedis();
}
