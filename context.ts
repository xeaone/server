import { STATUS_TEXT, } from './deps.ts';
import Mime from './mime.ts';
import Type from './type.ts';

type Body = BodyInit | Record<string, any> | Array<any> | null | undefined;

export default class Context {

    tool: Record<string, any> = {};

    url: URL;
    method: string;
    headers: Headers;
    request: Request;
    redirect = Response.redirect;

    #code = 200;
    #body: Body;
    #ended = false;
    #message?: string;

    constructor (request: Request) {
        this.request = request;
        this.headers = new Headers();
        this.url = new URL(request.url);
        this.method = request.method.toLowerCase();
    }

    get (name: string) {
        return this.tool[ name ];
    }

    set (name: string, value: any) {
        if (name in this.tool) return;
        const enumerable = true;
        const property = { enumerable, value };
        Object.defineProperty(this.tool, name, property);
    }

    code (code?: number): Context | number {
        if (code) {
            this.#code = code;
            return this;
        } else {
            return this.#code;
        }
    }

    message (message?: string): Context | string | undefined {
        if (message) {
            this.#message = message;
            return this;
        } else {
            return this.#message;
        }
    }

    body (body: Body): Context | Body {
        if (body) {
            this.#body = body;
            return this;
        } else {
            return this.#body;
        }
    }

    end (code?: number, body?: Body): Response {
        // if (this.#ended) return;

        this.#ended = true;
        this.#code = code ?? this.#code;
        this.#message = this.#message ?? STATUS_TEXT.get(this.#code) ?? '';
        this.#body = body ?? this.#body ?? this.#message ?? '';

        // if (!this.headers.get('content-type')) {
        //     const path = this.url.pathname;
        //     const extension = extname(path).slice(1) as keyof typeof Mime;

        //     if (extension) {
        //         const mime = Mime[ extension ] ?? Mime[ 'default' ];
        //         this.headers.set('content-type', `${mime};charset=utf8`);
        //     }

        // }

        // if (
        //     typeof body === 'string' || body instanceof Blob || body instanceof ArrayBuffer
        //     || body instanceof FormData || body instanceof ReadableStream || body instanceof URLSearchParams
        // ) {

        //     if (!this.headers.has('content-type')) {
        //         this.headers.set('content-type', `${Mime[ 'default' ]};charset=utf8`);
        //     }

        // } else

        const type = Type(this.#body);
        if (type === 'object' || type === 'array' || type === 'null') {
            this.#body = JSON.stringify(this.#body);

            if (!this.headers.has('content-type')) {
                this.headers.set('content-type', `${Mime[ 'json' ]};charset=utf8`);
            }

        }

        // this.headers.set('content-length', Buffer.byteLength(body))
        return new Response(this.#body as BodyInit, { status: this.#code, statusText: this.#message, headers: this.headers });
    }

    // set (name: string, data: object) {
    //     if (name in this) throw new Error('Context - can not overwrite');
    //     else this[ name ] = data;
    // }


}