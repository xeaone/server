import { media, Status, STATUS_TEXT } from './deps.ts';
import { calculate, ifNoneMatch } from './deps.ts';
// import Type from './type.ts';

type Head = Record<string, string>;
type Body = BodyInit | null | undefined | Record<string, any> | Array<any>;
type Method = 'get' | 'head' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace' | 'patch';

export default class Context {
    tool: Record<string, any> = {};

    headers: Headers;

    #body: Body;
    #code: Status;
    #message: string;

    #url: URL;
    #method: Method;
    #request: Request;

    get url() { return this.#url; }
    get method() { return this.#method; }
    get request() { return this.#request; }

    codes = Status;

    redirect = Response.redirect;

    continue = this.end.bind(this, 100);
    switchingProtocols = this.end.bind(this, 101);
    processing = this.end.bind(this, 102);
    earlyHints = this.end.bind(this, 103);

    ok = this.end.bind(this, 200);
    created = this.end.bind(this, 201);
    accepted = this.end.bind(this, 202);
    nonAuthoritativeInfo = this.end.bind(this, 203);
    noContent = this.end.bind(this, 204);
    resetContent = this.end.bind(this, 205);
    partialContent = this.end.bind(this, 206);
    multiStatus = this.end.bind(this, 207);
    alreadyReported = this.end.bind(this, 208);
    imUsed = this.end.bind(this, 226);

    multipleChoices = this.end.bind(this, 300);
    movedPermanently = this.end.bind(this, 301);
    found = this.end.bind(this, 302);
    seeOther = this.end.bind(this, 303);
    notModified = this.end.bind(this, 304);
    useProxy = this.end.bind(this, 305);
    temporaryRedirect = this.end.bind(this, 307);
    permanentRedirect = this.end.bind(this, 308);

    badRequest = this.end.bind(this, 400);
    unauthorized = this.end.bind(this, 401);
    paymentRequired = this.end.bind(this, 402);
    forbidden = this.end.bind(this, 403);
    notFound = this.end.bind(this, 404);
    methodNotAllowed = this.end.bind(this, 405);
    notAcceptable = this.end.bind(this, 406);
    proxyAuthRequired = this.end.bind(this, 407);
    requestTimeout = this.end.bind(this, 408);
    conflict = this.end.bind(this, 409);
    gone = this.end.bind(this, 410);
    lengthRequired = this.end.bind(this, 411);
    preconditionFailed = this.end.bind(this, 412);
    requestEntityTooLarge = this.end.bind(this, 413);
    requestURITooLong = this.end.bind(this, 414);
    unsupportedMediaType = this.end.bind(this, 415);
    requestedRangeNotSatisfiable = this.end.bind(this, 416);
    expectationFailed = this.end.bind(this, 417);
    teapot = this.end.bind(this, 418);
    misdirectedRequest = this.end.bind(this, 421);
    unprocessableEntity = this.end.bind(this, 422);
    locked = this.end.bind(this, 423);
    failedDependency = this.end.bind(this, 424);
    tooEarly = this.end.bind(this, 425);
    upgradeRequired = this.end.bind(this, 426);
    preconditionRequired = this.end.bind(this, 428);
    tooManyRequests = this.end.bind(this, 429);
    requestHeaderFieldsTooLarge = this.end.bind(this, 431);
    unavailableForLegalReasons = this.end.bind(this, 451);

    internalServerError = this.end.bind(this, 500);
    notImplemented = this.end.bind(this, 501);
    badGateway = this.end.bind(this, 502);
    serviceUnavailable = this.end.bind(this, 503);
    gatewayTimeout = this.end.bind(this, 504);
    httpVersionNotSupported = this.end.bind(this, 505);
    variantAlsoNegotiates = this.end.bind(this, 506);
    insufficientStorage = this.end.bind(this, 507);
    loopDetected = this.end.bind(this, 508);
    notExtended = this.end.bind(this, 510);
    networkAuthenticationRequired = this.end.bind(this, 511);

    constructor(request: Request) {
        this.headers = new Headers();

        this.#code = 200;
        this.#message = STATUS_TEXT[200];
        this.#request = request;
        this.#url = Object.freeze(new URL(request.url));
        this.#method = (request.method.toLowerCase() as Method);
    }

    get(name: string) {
        return this.tool[name];
    }

    set(name: string, value: unknown) {
        if (name in this.tool) return;
        const enumerable = true;
        const property = { enumerable, value };
        Object.defineProperty(this.tool, name, property);
    }

    code(code: Status): this {
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

    async end(code?: Status, body?: Body, head?: Head): Promise<Response> {

        this.#code = code ?? this.#code;
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
                    this.#code = Status.NotModified;
                    this.#message = STATUS_TEXT[Status.NotModified];
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

        return this.end(this.#code ?? 200, body, { 'content-type': media.contentType('html') });
    }

}
