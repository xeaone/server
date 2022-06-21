import Context from './context.ts';
import Plugin from './plugin.ts';

export default class Cors implements Plugin {

    #get: Map<string, string> = new Map();
    #head: Map<string, string> = new Map();
    #post: Map<string, string> = new Map();
    #put: Map<string, string> = new Map();
    #delete: Map<string, string> = new Map();
    #connect: Map<string, string> = new Map();
    #options: Map<string, string> = new Map();
    #trace: Map<string, string> = new Map();
    #patch: Map<string, string> = new Map();
    #any: Map<string, string> = new Map();

    get (path: string, origin: string) { this.#get.set(path, origin); return this; }
    head (path: string, origin: string) { this.#head.set(path, origin); return this; }
    post (path: string, origin: string) { this.#post.set(path, origin); return this; }
    put (path: string, origin: string) { this.#put.set(path, origin); return this; }
    delete (path: string, origin: string) { this.#delete.set(path, origin); return this; }
    connect (path: string, origin: string) { this.#connect.set(path, origin); return this; }
    options (path: string, origin: string) { this.#options.set(path, origin); return this; }
    trace (path: string, origin: string) { this.#trace.set(path, origin); return this; }
    patch (path: string, origin: string) { this.#patch.set(path, origin); return this; }
    any (path: string, origin: string) { this.#any.set(path, origin); return this; }

    handle (context: Context) {
        const method = context.method;
        const path = context.url.pathname;

        let paths;
        switch (method) {
            case 'get': paths = this.#get; break;
            case 'head': paths = this.#head; break;
            case 'post': paths = this.#post; break;
            case 'put': paths = this.#put; break;
            case 'delete': paths = this.#delete; break;
            case 'connect': paths = this.#connect; break;
            case 'options': paths = this.#options; break;
            case 'trace': paths = this.#trace; break;
            case 'patch': paths = this.#patch; break;
            default: throw new Error('Cors - invalid method');
        }

        const origin =
            paths.get(path) ?? paths.get('*') ?? paths.get('/*') ??
            this.#any.get(path) ?? this.#any.get('*') ?? this.#any.get('/*');

        if (!origin) throw new Error('Cors - origin not valid');

        context.headers.append('Access-Control-Allow-Origin', origin);
    }

}