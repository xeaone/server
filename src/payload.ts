import type Context from './context.ts';
import { Plugin } from './plugin.ts';

type Parse = 'json' | 'text' | 'blob' | 'arrayBuffer';

type Options = {
    parse?: Parse;
};

export default class Payload extends Plugin<boolean> {
    #parse: Parse = 'json';

    constructor(options?: Options) {
        super();
        this.#parse = options?.parse ?? this.#parse;
    }

    #initial(): Record<any, any> | string | Blob | ArrayBuffer {
        switch (this.#parse) {
            case 'json':
                return {};
            case 'text':
                return '';
            case 'blob':
                return new Blob();
            case 'arrayBuffer':
                return new ArrayBuffer(0);
        }
    }

    parse(parse?: Parse): this | Parse {
        if (parse === undefined) {
            return this.#parse;
        } else {
            this.#parse = parse;
            return this;
        }
    }

    setup(context: Context): void {
        context.set('payload', { data: this.#initial() });
    }

    async handle(context: Context): Promise<void> {
        try {
            context.tool.payload.data = await context.request.clone()[this.#parse]();
        } catch {
            context.tool.payload.data = this.#initial();
        }
    }
}
