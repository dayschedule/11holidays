import { Ai } from '@cloudflare/workers-types';
import { User } from '../schema/authSchema';

export type Bindings = {
  DB: D1Database;
  AI?: Ai;
  KVCACHE: KVNamespace;
  STRIPE_SECRET_KEY: string;
  MANDRILL_KEY: string;
};

export type HonoContext = {
  Bindings: Bindings
}