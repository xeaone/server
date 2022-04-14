import { STATUS_TEXT, } from './deps.ts';
import Mime from './mime.ts';
import Type from './type.ts';

export default class Context {

    tool: Record<string, any> = {};

    url: URL;
    method: string;
    headers: Headers;
    request: Request;
    redirect = Response.redirect;

    #code = 200;
    #ended = false;
    #message?: string;
    #body?: BodyInit | Record<string, unknown> | Array<unknown>;

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

    body (body: BodyInit | Record<string, unknown> | Array<unknown>): Context | BodyInit | Record<string, unknown> | Array<unknown> | undefined {
        if (body) {
            this.#body = body;
            return this;
        } else {
            return this.#body;
        }
    }

    end (code?: number, message?: string, body?: BodyInit | Record<string, unknown> | Array<unknown>): Response {

        this.#ended = true;
        code = code ?? this.#code;
        message = message ?? this.#message ?? STATUS_TEXT.get(code) ?? '';
        body = body ?? this.#body ?? message ?? '';

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
        const type = Type(body);
        if (type === 'object' || type === 'array'
            // typeof body === 'object' &&
            // !(body === null || typeof body === 'string' || body instanceof Blob || body instanceof ArrayBuffer
            //     || body instanceof FormData || body instanceof ReadableStream || body instanceof URLSearchParams)
        ) {
            body = JSON.stringify(body);

            if (!this.headers.has('content-type')) {
                this.headers.set('content-type', `${Mime[ 'json' ]};charset=utf8`);
            }

        }

        // this.headers.set('content-length', Buffer.byteLength(body))
        return new Response(body as BodyInit, { status: code, statusText: message, headers: this.headers });
    }

    // set (name: string, data: object) {
    //     if (name in this) throw new Error('Context - can not overwrite');
    //     else this[ name ] = data;
    // }


}