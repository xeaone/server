import Context from './context.ts';
import Handle from './handle.ts';
import Plugin from './plugin.ts';

export default class Router implements Plugin {

    #get: Map<string, Handle> = new Map();
    #head: Map<string, Handle> = new Map();
    #post: Map<string, Handle> = new Map();
    #put: Map<string, Handle> = new Map();
    #delete: Map<string, Handle> = new Map();
    #connect: Map<string, Handle> = new Map();
    #options: Map<string, Handle> = new Map();
    #trace: Map<string, Handle> = new Map();
    #patch: Map<string, Handle> = new Map();
    #any: Map<string, Handle> = new Map();

    get (path: string, handle: Handle) { this.#get.set(path, handle); }
    head (path: string, handle: Handle) { this.#head.set(path, handle); }
    post (path: string, handle: Handle) { this.#post.set(path, handle); }
    put (path: string, handle: Handle) { this.#put.set(path, handle); }
    delete (path: string, handle: Handle) { this.#delete.set(path, handle); }
    connect (path: string, handle: Handle) { this.#connect.set(path, handle); }
    options (path: string, handle: Handle) { this.#options.set(path, handle); }
    trace (path: string, handle: Handle) { this.#trace.set(path, handle); }
    patch (path: string, handle: Handle) { this.#patch.set(path, handle); }
    any (path: string, handle: Handle) { this.#any.set(path, handle); }

    async handle (context: Context) {
        const method = context.request.method.toLowerCase();
        const pathname = new URL(context.request.url).pathname;

        let routes;
        switch (method) {
            case 'get': routes = this.#get; break;
            case 'head': routes = this.#head; break;
            case 'post': routes = this.#post; break;
            case 'put': routes = this.#put; break;
            case 'delete': routes = this.#delete; break;
            case 'connect': routes = this.#connect; break;
            case 'options': routes = this.#options; break;
            case 'trace': routes = this.#trace; break;
            case 'patch': routes = this.#patch; break;
            default: throw new Error('Router - invalid method');
        }

        let route = routes.get(pathname) || this.#any.get(pathname);

        if (!route) {
            let path = '';
            const parts = pathname.replace(/\/[^./]+\.[^./]+$|^\/+|\/+$/g, '').split('/');
            for (const part of parts) {
                path += part ? `/${part}` : part;
                route = routes.get(`${path}/*`) || this.#any.get(`${path}/*`);
                if (route) break;
            }
        }

        route = route || routes.get('/*') || routes.get('*') || this.#any.get('/*') || this.#any.get('*');

        return await route?.(context) || new Response('Not Found', { status: 404 });
    }

}