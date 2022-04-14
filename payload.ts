import Context from './context.ts';
import Plugin from './plugin.ts';

type Parse = 'json' | 'text' | 'blob' | 'arrayBuffer';

type Options = {
    parse: Parse;
};

export default class Payload implements Plugin {

    #parse: Parse = 'json';

    #get: Set<string> = new Set();
    #head: Set<string> = new Set();
    #post: Set<string> = new Set();
    #put: Set<string> = new Set();
    #delete: Set<string> = new Set();
    #connect: Set<string> = new Set();
    #options: Set<string> = new Set();
    #trace: Set<string> = new Set();
    #patch: Set<string> = new Set();
    #any: Set<string> = new Set();

    constructor (options?: Options) {
        this.#parse = options?.parse ?? this.#parse;
    }

    parse (parse: Parse) {
        this.#parse = parse ?? this.#parse;
        return this;
    }

    // ingore payload requirements
    get (...path: string[]) { path.forEach(path => this.#get.add(path)); return this; }
    head (...path: string[]) { path.forEach(path => this.#head.add(path)); return this; }
    post (...path: string[]) { path.forEach(path => this.#post.add(path)); return this; }
    put (...path: string[]) { path.forEach(path => this.#put.add(path)); return this; }
    delete (...path: string[]) { path.forEach(path => this.#delete.add(path)); return this; }
    connect (...path: string[]) { path.forEach(path => this.#connect.add(path)); return this; }
    options (...path: string[]) { path.forEach(path => this.#options.add(path)); return this; }
    trace (...path: string[]) { path.forEach(path => this.#trace.add(path)); return this; }
    patch (...path: string[]) { path.forEach(path => this.#patch.add(path)); return this; }
    any (...path: string[]) { path.forEach(path => this.#any.add(path)); return this; }

    async handle (context: Context): Promise<Response | void> {
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
            default: throw new Error('Payload - invalid method');
        }

        if (paths.has(path) || paths.has('*') || paths.has('/*')) return;
        if (this.#any.has(path) || this.#any.has('*') || this.#any.has('/*')) return;

        context.tool.payload = {};

        try {
            context.tool.payload.data = await context.request[ this.#parse ]();
        } catch {
            context.tool.payload.data = undefined;
        }

    }

}