import { Ai } from '@cloudflare/workers-types';

export type Bindings = {
  DB: D1Database;
  AI?: Ai;
  KVCACHE: KVNamespace;
  STRIPE_SECRET_KEY: string;
  MANDRILL_KEY: string;
};
