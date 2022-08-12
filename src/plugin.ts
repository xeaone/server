import Handle from './handle.ts';
import Context from './context.ts';

type Data = string | boolean | Handle;
type Method = 'get' | 'head' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace' | 'patch' | 'any';

export default abstract class Plugin {

    abstract handle (context: Context, data?: Data): Promise<Response | void> | Response | void;

    #map (method: Method, data: string | { [ path: string ]: string | boolean | Handle; }, value?: string | boolean | Handle): this {

        if (typeof data === 'string') {

            if (value === undefined) {
                throw new Error(`${this.constructor.name} Plugin - ${method} value required`);
            }

            this.data[ method ].set(data, value);

        } else {
            Object.entries(data).forEach(([ name, value ]) => this.data[ method ].set(name, value));
        }

        return this;
    }

    readonly data: Record<string, Map<string, Data>> = {
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