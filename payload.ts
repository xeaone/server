import Context from './context.ts';
import Plugin from './plugin.ts';

type Parse = 'json' | 'text' | 'blob' | 'arrayBuffer';

type Options = {
    parse?: Parse;
};

export default class Payload extends Plugin {

    #parse: Parse = 'json';

    constructor (options?: Options) {
        super();
        this.#parse = options?.parse ?? this.#parse;
    }

    #initial () {
        switch (this.#parse) {
            case 'json': return {};
            case 'text': return '';
            case 'blob': return new Blob();
            case 'arrayBuffer': return new ArrayBuffer(0);
        }

    }

    parse (parse?: Parse): this | Parse {
        if (parse === undefined) {
            return this.#parse;
        } else {
            this.#parse = parse;
            return this;
        }
    }

    setup (context: Context) {
        context.set('payload', { data: this.#initial() });
    }

    async handle (context: Context) {

        try {
            context.tool.payload.data = await context.request.clone()[ this.#parse ]();
        } catch {
            context.tool.payload.data = this.#initial();
        }

    }

}