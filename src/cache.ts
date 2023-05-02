import Context from './context.ts';
import Plugin from './plugin.ts';

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
 */

interface Options {

    noStore?: boolean;
    noCache?: boolean;
    maxAge?: number;

    public?: boolean;
    private?: boolean;
}

export default class Cache extends Plugin {

    #noStore = false;
    #noCache = false;
    #maxAge = 300;

    #public = false;
    #private = true;

    constructor(options?: Options) {
        super();

        this.#noStore = options?.noStore ?? this.#noStore;
        this.#noCache = options?.noCache ?? this.#noCache;
        this.#maxAge = options?.maxAge ?? this.#maxAge;

        this.#public = options?.public ?? this.#public;
        this.#private = options?.private ?? this.#private;
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

    handle(context: Context) {
        const value = [];

        if (this.#noStore) {

            value.push('no-store');

        } else {

            if (this.#private) value.push('private');
            else if (this.#public) value.push('public');

            if (this.#noCache) {
                value.push(`no-cache`);
            } else {
                value.push(`max-age=${this.#maxAge}`);
            }

        }

        context.headers.append('cache-control', value.join(', '));
    }

}
