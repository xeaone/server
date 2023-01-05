import { media, Status, STATUS_TEXT } from './deps.ts';
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
    #message?: string;

    constructor(request: Request) {
        this.request = request;
        this.headers = new Headers();
        this.url = new URL(request.url);
        this.method = request.method.toLowerCase();
    }

    get(name: string) {
        return this.tool[name];
    }

    set(name: string, value: any) {
        if (name in this.tool) return;
        const enumerable = true;
        const property = { enumerable, value };
        Object.defineProperty(this.tool, name, property);
    }

    code(code?: Status): this | Status | any {
        if (code) {
            this.#code = code;
            return this;
        } else {
            return this.#code;
        }
    }

    message(message?: string): this | string | undefined | any {
        if (message) {
            this.#message = message;
            return this;
        } else {
            return this.#message;
        }
    }

    head(head?: Record<string, string>): this | Record<string, string> | any {
        if (head) {
            Object.entries(head).forEach(([name, value]) => this.headers.append(name, value));
            return this;
        } else {
            return Object.fromEntries(this.headers);
        }
    }

    body(body?: Body): this | Body | any {
        if (body) {
            this.#body = body;
            return this;
        } else {
            return this.#body;
        }
    }

    end(code?: Status, body?: Body): Response {
        this.#code = code ?? this.#code;
        this.#message = this.#message ?? STATUS_TEXT[this.#code as Status] ?? '';
        this.#body = body ?? this.#body ?? this.#message ?? '';

        const type = Type(this.#body);

        if (type === 'object' || type === 'array' || type === 'null') {
            this.#body = JSON.stringify(this.#body);

            if (!this.headers.has('content-type')) {
                this.headers.set('content-type', media.contentType('json'));
            }
        }

        return new Response(this.#body as BodyInit, { status: this.#code, statusText: this.#message, headers: this.headers });
    }
}
