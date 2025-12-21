import { Ai } from '@cloudflare/workers-types';

export type Bindings = {
  DB: D1Database;
  AI?: Ai;
};
