import Context from './context.ts';
import Plugin from './plugin.ts';

interface Options {
    maxAge?: number;
}

export default class Cache extends Plugin {

    #maxAge = 3600;

    constructor (options?: Options) {
        super();
        this.#maxAge = options?.maxAge ?? this.#maxAge;
    }

    maxAge(data: number) {
        this.#maxAge = data;
        return this;
    }

    handle(context: Context) {
        context.headers.append('cache-control', `max-age=${this.#maxAge}`);
    }

}
