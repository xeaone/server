import type { Method } from './types.ts';
import type Context from './context.ts';

type PluginMethod = Method | 'any';

interface PluginData {
    get: Map<string, any>;
    head: Map<string, any>;
    post: Map<string, any>;
    put: Map<string, any>;
    delete: Map<string, any>;
    connect: Map<string, any>;
    options: Map<string, any>;
    trace: Map<string, any>;
    patch: Map<string, any>;
    any: Map<string, any>;
}

export abstract class Plugin<V = any> {
    setup?(context: Context): Promise<Response | void> | Response | void;

    handle?(context: Context, value?: V): Promise<Response | void> | Response | void;

    #map(method: PluginMethod, path: string, value?: V): this {
        this.data[method].set(path, value);
        return this;
    }

    readonly data: PluginData = {
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

    readonly get: (path: string, value?: V) => this = this.#map.bind(this, 'get');
    readonly head: (path: string, value?: V) => this = this.#map.bind(this, 'head');
    readonly post: (path: string, value?: V) => this = this.#map.bind(this, 'post');
    readonly put: (path: string, value?: V) => this = this.#map.bind(this, 'put');
    readonly delete: (path: string, value?: V) => this = this.#map.bind(this, 'delete');
    readonly connect: (path: string, value?: V) => this = this.#map.bind(this, 'connect');
    readonly options: (path: string, value?: V) => this = this.#map.bind(this, 'options');
    readonly trace: (path: string, value?: V) => this = this.#map.bind(this, 'trace');
    readonly patch: (path: string, value?: V) => this = this.#map.bind(this, 'patch');
    readonly any: (path: string, value?: V) => this = this.#map.bind(this, 'any');
}
