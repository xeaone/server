import { media, Status, STATUS_TEXT } from './deps.ts';
import Type from './type.ts';

type Body = BodyInit | Record<string, any> | Array<any> | null | undefined;
type Method = 'get' | 'head' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace' | 'patch';

export default class Context {
    tool: Record<string, any> = {};

    url: URL;
    method: Method;
    headers: Headers;
    request: Request;
    redirect = Response.redirect;

    #code = 200;
    #body: Body;
    #message?: string;

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
        this.request = request;
        this.headers = new Headers();
        this.url = new URL(request.url);
        this.method = (request.method.toLowerCase() as Method);
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

    code(code: Status): this {
        this.#code = code;
        return this;
    }

    message(message: string): this {
        this.#message = message;
        return this;
    }

    head(head: Record<string, string>): this {
        Object.entries(head).forEach(([name, value]) => this.headers.append(name, value));
        return this;
    }

    body(body: Body): this {
        this.#body = body;
        return this;
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
