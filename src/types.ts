import Context from './context.ts';
// import { Normalize, Payload, Router, Session } from './mod.ts';

export type Handle = (context: Context) => Promise<Response | void> | Response | void;

export type Head = Record<string, string>;

export type Body = BodyInit | null | undefined | Record<string, any> | Array<any>;

export type Method = 'get' | 'head' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace' | 'patch';

// export interface Tool {
//     router: Router,
//     payload: Payload,
//     session: Session,
//     normalize: Normalize,
// }
