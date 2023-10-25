import Context from './context.ts';
import Plugin from './plugin.ts';

/**
 * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
 */

interface Options {
    noStore?: boolean;
    noCache?: boolean;
    mustRevalidate?: boolean;
    maxAge?: number;
    public?: boolean;
    private?: boolean;
}

export default class Cache extends Plugin<Options> {
    #noStore = false;
    #noCache = false;
    #mustRevalidate = false;
    #maxAge = 0;
    #public = false;
    #private = false;

    constructor(options?: Options) {
        super();

        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#no-store
        this.#noStore = options?.noStore ?? this.#noStore;
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#no-cache
        this.#noCache = options?.noCache ?? this.#noCache;
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#must-revalidate
        this.#mustRevalidate = options?.mustRevalidate ?? this.#mustRevalidate;
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#max-age
        this.#maxAge = options?.maxAge ?? this.#maxAge;
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#public
        this.#public = options?.public ?? this.#public;
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#private
        this.#private = options?.private ?? this.#private;
    }

    noStore(data: boolean) {
        this.#noStore = data;
        return this;
    }

    noCache(data: boolean) {
        this.#noCache = data;
        return this;
    }

    mustRevalidate(data: boolean) {
        this.#mustRevalidate = data;
        return this;
    }

    maxAge(data: number) {
        this.#maxAge = data;
        return this;
    }

    public(data: boolean) {
        this.#public = data;
        return this;
    }

    private(data: boolean) {
        this.#private = data;
        return this;
    }

    handle(context: Context, options?: Options) {
        const value = [];

        options = {
            mustRevalidate: this.#mustRevalidate,
            noStore: this.#noStore,
            noCache: this.#noCache,
            private: this.#private,
            public: this.#public,
            maxAge: this.#maxAge,
            ...(options ?? {}),
        };

        if (options.noStore) {
            value.push('no-store');
        } else {
            if (options.private) {
                value.push('private');
            } else if (options.public) {
                value.push('public');
            }

            if (options.noCache) {
                value.push(`no-cache`);
            } else {
                if (options.maxAge) {
                    value.push(`max-age=${options.maxAge}`);
                }

                if (options.mustRevalidate) {
                    value.push(`must-revalidate`);
                }
            }
        }

        context.headers.append('cache-control', value.join(', '));
    }
}
