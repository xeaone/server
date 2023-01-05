import Context from './context.ts';
import Handle from './handle.ts';
import Plugin from './plugin.ts';

export default class Router extends Plugin {
    handle(context: Context, route?: Handle) {
        return route?.(context) || new Response('Not Found', { status: 404 });
    }
}
