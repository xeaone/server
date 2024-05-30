import { calculate, ifNoneMatch, media, STATUS_CODE, STATUS_TEXT } from './deps.ts';
import type { Body, Head, Method } from './types.ts';
import type { StatusCode } from './deps.ts';

export default class Context {
    tool: Record<string, any> = {};

    headers: Headers;

    #body: Body;
    #code?: StatusCode;
    #message?: string;

    #url: URL;
    #method: Method;
    #request: Request;

    get url(): URL {
        return this.#url;
    }
    get method(): Method {
        return this.#method;
    }
    get request(): Request {
        return this.#request;
    }

    codes = STATUS_CODE;

    redirect = Response.redirect;

    constructor(request: Request) {
        this.headers = new Headers();

        // this.#message;
        // this.#code = 200;

        this.#request = request;
        this.#url = Object.freeze(new URL(request.url));
        this.#method = request.method.toLowerCase() as Method;
    }

    continue(body?: Body, head?: Head): Promise<Response> {
        return this.end(100, body, head);
    }
    switchingProtocols(body?: Body, head?: Head): Promise<Response> {
        return this.end(101, body, head);
    }
    processing(body?: Body, head?: Head): Promise<Response> {
        return this.end(102, body, head);
    }
    earlyHints(body?: Body, head?: Head): Promise<Response> {
        return this.end(103, body, head);
    }

    ok(body?: Body, head?: Head): Promise<Response> {
        return this.end(200, body, head);
    }
    created(body?: Body, head?: Head): Promise<Response> {
        return this.end(201, body, head);
    }
    accepted(body?: Body, head?: Head): Promise<Response> {
        return this.end(202, body, head);
    }
    nonAuthoritativeInfo(body?: Body, head?: Head): Promise<Response> {
        return this.end(203, body, head);
    }
    noContent(body?: Body, head?: Head): Promise<Response> {
        return this.end(204, body, head);
    }
    resetContent(body?: Body, head?: Head): Promise<Response> {
        return this.end(205, body, head);
    }
    partialContent(body?: Body, head?: Head): Promise<Response> {
        return this.end(206, body, head);
    }
    multiStatus(body?: Body, head?: Head): Promise<Response> {
        return this.end(207, body, head);
    }
    alreadyReported(body?: Body, head?: Head): Promise<Response> {
        return this.end(208, body, head);
    }
    imUsed(body?: Body, head?: Head): Promise<Response> {
        return this.end(226, body, head);
    }

    multipleChoices(body?: Body, head?: Head): Promise<Response> {
        return this.end(300, body, head);
    }
    movedPermanently(body?: Body, head?: Head): Promise<Response> {
        return this.end(301, body, head);
    }
    found(body?: Body, head?: Head): Promise<Response> {
        return this.end(302, body, head);
    }
    seeOther(body?: Body, head?: Head): Promise<Response> {
        return this.end(303, body, head);
    }
    notModified(body?: Body, head?: Head): Promise<Response> {
        return this.end(304, body, head);
    }
    useProxy(body?: Body, head?: Head): Promise<Response> {
        return this.end(305, body, head);
    }
    temporaryRedirect(body?: Body, head?: Head): Promise<Response> {
        return this.end(307, body, head);
    }
    permanentRedirect(body?: Body, head?: Head): Promise<Response> {
        return this.end(308, body, head);
    }

    badRequest(body?: Body, head?: Head): Promise<Response> {
        return this.end(400, body, head);
    }
    unauthorized(body?: Body, head?: Head): Promise<Response> {
        return this.end(401, body, head);
    }
    paymentRequired(body?: Body, head?: Head): Promise<Response> {
        return this.end(402, body, head);
    }
    forbidden(body?: Body, head?: Head): Promise<Response> {
        return this.end(403, body, head);
    }
    notFound(body?: Body, head?: Head): Promise<Response> {
        return this.end(404, body, head);
    }
    methodNotAllowed(body?: Body, head?: Head): Promise<Response> {
        return this.end(405, body, head);
    }
    notAcceptable(body?: Body, head?: Head): Promise<Response> {
        return this.end(406, body, head);
    }
    proxyAuthRequired(body?: Body, head?: Head): Promise<Response> {
        return this.end(407, body, head);
    }
    requestTimeout(body?: Body, head?: Head): Promise<Response> {
        return this.end(408, body, head);
    }
    conflict(body?: Body, head?: Head): Promise<Response> {
        return this.end(409, body, head);
    }
    gone(body?: Body, head?: Head): Promise<Response> {
        return this.end(410, body, head);
    }
    lengthRequired(body?: Body, head?: Head): Promise<Response> {
        return this.end(411, body, head);
    }
    preconditionFailed(body?: Body, head?: Head): Promise<Response> {
        return this.end(412, body, head);
    }
    requestEntityTooLarge(body?: Body, head?: Head): Promise<Response> {
        return this.end(413, body, head);
    }
    requestURITooLong(body?: Body, head?: Head): Promise<Response> {
        return this.end(414, body, head);
    }
    unsupportedMediaType(body?: Body, head?: Head): Promise<Response> {
        return this.end(415, body, head);
    }
    requestedRangeNotSatisfiable(body?: Body, head?: Head): Promise<Response> {
        return this.end(416, body, head);
    }
    expectationFailed(body?: Body, head?: Head): Promise<Response> {
        return this.end(417, body, head);
    }
    teapot(body?: Body, head?: Head): Promise<Response> {
        return this.end(418, body, head);
    }
    misdirectedRequest(body?: Body, head?: Head): Promise<Response> {
        return this.end(421, body, head);
    }
    unprocessableEntity(body?: Body, head?: Head): Promise<Response> {
        return this.end(422, body, head);
    }
    locked(body?: Body, head?: Head): Promise<Response> {
        return this.end(423, body, head);
    }
    failedDependency(body?: Body, head?: Head): Promise<Response> {
        return this.end(424, body, head);
    }
    tooEarly(body?: Body, head?: Head): Promise<Response> {
        return this.end(425, body, head);
    }
    upgradeRequired(body?: Body, head?: Head): Promise<Response> {
        return this.end(426, body, head);
    }
    preconditionRequired(body?: Body, head?: Head): Promise<Response> {
        return this.end(428, body, head);
    }
    tooManyRequests(body?: Body, head?: Head): Promise<Response> {
        return this.end(429, body, head);
    }
    requestHeaderFieldsTooLarge(body?: Body, head?: Head): Promise<Response> {
        return this.end(431, body, head);
    }
    unavailableForLegalReasons(body?: Body, head?: Head): Promise<Response> {
        return this.end(451, body, head);
    }

    internalServerError(body?: Body, head?: Head): Promise<Response> {
        return this.end(500, body, head);
    }
    notImplemented(body?: Body, head?: Head): Promise<Response> {
        return this.end(501, body, head);
    }
    badGateway(body?: Body, head?: Head): Promise<Response> {
        return this.end(502, body, head);
    }
    serviceUnavailable(body?: Body, head?: Head): Promise<Response> {
        return this.end(503, body, head);
    }
    gatewayTimeout(body?: Body, head?: Head): Promise<Response> {
        return this.end(504, body, head);
    }
    httpVersionNotSupported(body?: Body, head?: Head): Promise<Response> {
        return this.end(505, body, head);
    }
    variantAlsoNegotiates(body?: Body, head?: Head): Promise<Response> {
        return this.end(506, body, head);
    }
    insufficientStorage(body?: Body, head?: Head): Promise<Response> {
        return this.end(507, body, head);
    }
    loopDetected(body?: Body, head?: Head): Promise<Response> {
        return this.end(508, body, head);
    }
    notExtended(body?: Body, head?: Head): Promise<Response> {
        return this.end(510, body, head);
    }
    networkAuthenticationRequired(body?: Body, head?: Head): Promise<Response> {
        return this.end(511, body, head);
    }

    get(name: string): Record<string, any> {
        return this.tool[name];
    }

    set(name: string, value: unknown): void {
        if (name in this.tool) return;
        const enumerable = true;
        const property = { enumerable, value };
        Object.defineProperty(this.tool, name, property);
    }

    code(code: StatusCode): this {
        this.#code = code;
        return this;
    }

    message(message: string): this {
        this.#message = message;
        return this;
    }

    // status(status: Status): this {
    //     this.#code = status;
    //     this.#message = STATUS_TEXT[this.#code]
    //     return this;
    // }

    head(head: Head): this {
        Object.entries(head).forEach(([name, value]) => this.headers.set(name, value));
        return this;
    }

    body(body: Body): this {
        this.#body = body;
        return this;
    }

    async end(code?: StatusCode, body?: Body, head?: Head): Promise<Response> {
        this.#code = code ?? this.#code ?? 200;
        this.#message = this.#message ?? STATUS_TEXT[this.#code];
        this.#body = body ?? this.#body ?? this.#message;

        if (head) this.head(head);

        if (this.#body?.constructor === Object || this.#body instanceof Array) {
            this.#body = JSON.stringify(this.#body);
            this.headers.set('content-type', media.contentType('json'));
        }

        if (
            !this.headers.has('etag') &&
            (typeof this.#body === 'string' || this.#body instanceof Uint8Array)
            // || (this.#body && this.#body.mtime && 'size' in this.#body.size))
        ) {
            const etag = await calculate(this.#body);
            if (etag) {
                this.headers.set('etag', etag);
                const ifNoneMatchValue = this.#request.headers.get('if-none-match');
                if (!ifNoneMatch(ifNoneMatchValue, etag)) {
                    this.#body = null;
                    this.#code = STATUS_CODE.NotModified;
                    this.#message = STATUS_TEXT[STATUS_CODE.NotModified];
                }
            }
        }

        // https://fetch.spec.whatwg.org/#statuses
        // status codes that require null body
        if (
            this.#code === 101 ||
            this.#code === 103 ||
            this.#code === 204 ||
            this.#code === 205 ||
            this.#code === 304
        ) this.#body = null;

        return new Response(this.#body as BodyInit, { status: this.#code, statusText: this.#message, headers: this.headers });
    }

    /**
     * @description A template tag for returning an html Response.
     * @param strings
     * @param variables
     * @returns Response
     */
    html(strings: TemplateStringsArray, ...variables: unknown[]): Promise<Response> {
        let body = '';

        const length = strings.length;
        for (let index = 0; index < length; index++) {
            body += strings[index] ?? '';
            body += variables[index] ?? '';
        }

        return this.end(this.#code, body, { 'content-type': media.contentType('html') });
    }
}
