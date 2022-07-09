import Context from './context.ts';
import Handle from './handle.ts';
import Plugin from './plugin.ts';

export default class Router extends Plugin {

    handle (context: Context, route?: Handle) {

        // let routes: Map<string, Handle>;
        // switch (method) {
        //     case 'get': routes = this.#get; break;
        //     case 'head': routes = this.#head; break;
        //     case 'post': routes = this.#post; break;
        //     case 'put': routes = this.#put; break;
        //     case 'delete': routes = this.#delete; break;
        //     case 'connect': routes = this.#connect; break;
        //     case 'options': routes = this.#options; break;
        //     case 'trace': routes = this.#trace; break;
        //     case 'patch': routes = this.#patch; break;
        //     default: throw new Error('Router - method not valid');
        // }

        // const route = routes.get(pathname) || this.#any.get(pathname) ||
        //     this.paths(pathname, path => routes.get(`${path}/*`) || this.#any.get(`${path}/*`)) ||
        //     routes.get('/*') || routes.get('*') || this.#any.get('/*') || this.#any.get('*');

        // const route = this.find(context) as Handle | undefined;

        return route?.(context) || new Response('Not Found', { status: 404 });
    }

}