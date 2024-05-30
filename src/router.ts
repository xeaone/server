import type Context from './context.ts';
import type { Handle } from './handle.ts';
import { Plugin } from './plugin.ts';

export default class Router extends Plugin<Handle> {
    handle(context: Context, route?: Handle): Promise<Response | void> | Response | void {
        return route?.(context) || new Response('Not Found', { status: 404 });
    }
}
