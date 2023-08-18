import Context from './context.ts';

type Method = 'get' | 'head' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace' | 'patch' | 'any';

export default abstract class Plugin<V = any> {
    abstract handle(context: Context, value?: V): Promise<Response | void> | Response | void;

    #map(method: Method, path: string, value?: V): this {
        this.data[method].set(path, value);
        return this;
    }

    readonly data: Record<string, Map<string, any>> = {
        get: new Map(),
        head: new Map(),
        post: new Map(),
        put: new Map(),
        delete: new Map(),
        connect: new Map(),
        options: new Map(),
        trace: new Map(),
        patch: new Map(),
        any: new Map(),
    } as const;

    readonly get = this.#map.bind(this, 'get');
    readonly head = this.#map.bind(this, 'head');
    readonly post = this.#map.bind(this, 'post');
    readonly put = this.#map.bind(this, 'put');
    readonly delete = this.#map.bind(this, 'delete');
    readonly connect = this.#map.bind(this, 'connect');
    readonly options = this.#map.bind(this, 'options');
    readonly trace = this.#map.bind(this, 'trace');
    readonly patch = this.#map.bind(this, 'patch');
    readonly any = this.#map.bind(this, 'any');

}
