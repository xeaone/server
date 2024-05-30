import type Context from './context.ts';

export type Handle = (context: Context) => Promise<Response | void> | Response | void;
