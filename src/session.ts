import { base64url, Status, STATUS_TEXT } from './deps.ts';
import Context from './context.ts';
import Plugin from './plugin.ts';

/*
    Base64 URL: https://www.ietf.org/rfc/rfc4648.txt
    Secure Session Cookies: https://tools.ietf.org/html/rfc6896
*/

type Validate = (context: Context, data: any) => Promise<Response | void> | Response | void;
type Forbidden = (context: Context) => Promise<Response | void> | Response | void;
type Unauthorized = (context: Context) => Promise<Response | void> | Response | void;

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const EXPIRATION = 1000 * 60 * 60 * 24; // 24 hours

interface Options {
    name?: string;
    realm?: string;
    expiration?: number;
    parse?: boolean;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: string;
    key?: number;
    salt?: number;
    vector?: number;
    iterations?: number;
    maxAge?: number;

    domain?: string;

    secret?: string;
    signature?: string;

    validate?: Validate;
    forbidden?: Forbidden;
    unauthorized?: Unauthorized;
}

export default class Session extends Plugin<boolean> {
    scheme = 'scheme';
    name: string;
    realm: string;
    expiration: number;
    parse: boolean;

    secure: boolean;
    httpOnly: boolean;
    sameSite: string;

    key: number;
    salt: number;
    vector: number;
    iterations: number;

    maxAge?: number;

    #domain?: string;

    #secret?: string;
    #signature?: string;

    #validate?: Validate;
    #forbidden?: Forbidden;
    #unauthorized?: Unauthorized;

    constructor(options?: Options) {
        super();

        this.maxAge = options?.maxAge;
        this.name = options?.name ?? 'session';
        this.realm = options?.realm ?? 'secure';
        this.parse = options?.parse ?? true;
        this.secure = options?.secure ?? true;
        this.httpOnly = options?.httpOnly ?? true;
        this.sameSite = options?.sameSite ?? 'strict';
        this.expiration = options?.expiration ?? EXPIRATION;

        this.key = options?.key ?? 32;
        this.salt = options?.salt ?? 16;
        this.vector = options?.vector ?? 16;
        this.iterations = options?.iterations ?? 10000;

        this.#domain = options?.domain;

        this.#secret = options?.secret;
        this.#signature = options?.signature;

        this.#validate = options?.validate ?? undefined;

        this.#forbidden = options?.forbidden ?? (() => new Response(
            STATUS_TEXT[Status.Forbidden],
            { status: Status.Forbidden }
        ));

        this.#unauthorized = options?.unauthorized ?? (() => new Response(
            STATUS_TEXT[Status.Unauthorized],
            { status: Status.Unauthorized, headers: { 'www-authenticate': `${this.scheme} realm="${this.realm}"` } }
        ));

    }

    domain(domain: string) {
        this.#domain = domain;
        return this;
    }

    secret(secret: string) {
        this.#secret = secret;
        return this;
    }

    validate(validate: Validate) {
        this.#validate = validate;
        return this;
    }

    signature(signature: string) {
        this.#signature = signature;
        return this;
    }

    forbidden(forbidden: Forbidden) {
        this.#forbidden = forbidden;
        return this;
    }

    unauthorized(unauthorized: Unauthorized) {
        this.#unauthorized = unauthorized;
        return this;
    }

    async encrypt(data: string, secret?: string) {
        secret = secret || this.#secret;

        if (!data) throw new Error('Session - data required');
        if (!secret) throw new Error('Session - secret required');

        const salt = crypto.getRandomValues(new Uint8Array(this.salt));
        const vector = crypto.getRandomValues(new Uint8Array(this.vector));

        const material = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey'],
        );

        const key = await crypto.subtle.deriveKey(
            {
                salt,
                name: 'PBKDF2',
                hash: 'SHA-256',
                iterations: this.iterations,
            },
            material,
            { name: 'AES-CBC', length: 256 },
            false,
            ['encrypt', 'decrypt'],
        );

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-CBC', iv: vector },
            key,
            encoder.encode(data),
        );

        return base64url.encode(
            new Uint8Array([
                ...salt,
                ...vector,
                ...new Uint8Array(encrypted),
            ]),
        );
    }

    async decrypt(encrypted: string, secret?: string) {
        secret = secret || this.#secret;

        if (!encrypted) throw new Error('Session - encrypted required');
        if (!secret) throw new Error('Session - secret required');

        const decoded = base64url.decode(encrypted);

        const vector = decoded.slice(0 + this.salt, this.salt + this.vector);
        const salt = decoded.slice(0, this.salt);
        const data = decoded.slice(this.salt + this.vector);

        const material = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey'],
        );

        const key = await crypto.subtle.deriveKey(
            {
                salt,
                name: 'PBKDF2',
                hash: 'SHA-256',
                iterations: this.iterations,
            },
            material,
            { name: 'AES-CBC', length: 256 },
            true,
            ['encrypt', 'decrypt'],
        );

        const decrypted = decoder.decode(
            await crypto.subtle.decrypt(
                { name: 'AES-CBC', iv: vector },
                key,
                data,
            ),
        );

        const [content, parse] = decrypted.split('|');

        return parse === 't' ? JSON.parse(content) : content;
    }

    async sign(encrypted: string, stamped: string, signature?: string) {
        signature = signature || this.#signature;

        if (!encrypted) throw new Error('Session - encrypted required');
        if (!stamped) throw new Error('Session - stamped required');
        if (!signature) throw new Error('Session - signature required');

        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(signature),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign', 'verify'],
        );

        const signed = await crypto.subtle.sign(
            'HMAC',
            key,
            encoder.encode(`${encrypted}|${stamped}`),
        );

        return base64url.encode(signed);
    }

    async unsign(encrypted: string, stamped: string, signed: string, signature?: string) {
        signature = signature || this.#signature;

        if (!encrypted) throw new Error('Session - encrypted required');
        if (!stamped) throw new Error('Session - stamped required');
        if (!signed) throw new Error('Session - signed required');
        if (!signature) throw new Error('Session - signature required');

        const decoded = base64url.decode(signed);

        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(signature),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign', 'verify'],
        );

        const computed = new Uint8Array(
            await crypto.subtle.sign(
                'HMAC',
                key,
                encoder.encode(`${encrypted}|${stamped}`),
            ),
        );

        if (computed.byteLength !== decoded.byteLength) return false;

        return decoder.decode(computed) === decoder.decode(decoded);
    }

    stamp(time: number) {
        if (!time) throw new Error('Session - time required');
        const expiration = time + this.expiration;
        return base64url.encode(`${expiration}`);
    }

    unstamp(time: string) {
        if (!time) throw new Error('Session - time required');

        const decoded = decoder.decode(base64url.decode(time));
        const expiration = Number(decoded);

        if (!expiration) return false;

        return Date.now() < expiration;
    }

    async create(context: Context, data: string | Record<string, unknown>) {
        if (!data) throw new Error('Session - data required');

        const time = Date.now();
        const parse = typeof data === 'string';
        const parsed = parse ? data : JSON.stringify(data);
        const encrypted = await this.encrypt(`${parsed}|${parse ? 'f' : 't'}`);
        const stamped = await this.stamp(time);
        const signed = await this.sign(encrypted, stamped);

        let cookie = `${this.name}=${encrypted}|${stamped}|${signed}`;

        if (this.secure) cookie += ';Secure';
        if (this.httpOnly) cookie += ';HttpOnly';
        if (this.#domain) cookie += `;Domain=${this.#domain}`;
        if (this.sameSite) cookie += `;SameSite=${this.sameSite}`;

        if (this.maxAge) cookie += `;Max-Age=${this.maxAge}`;
        else cookie += `;Expires=${new Date(time + this.expiration).toUTCString()}`;

        if (encoder.encode(cookie).length > 4090) throw new Error('Session - cookie size invalid');

        context.headers.append('set-cookie', cookie);
    }

    destroy(context: Context) {
        let cookie = '';

        if (this.secure) cookie += ';Secure';
        if (this.httpOnly) cookie += ';HttpOnly';
        if (this.sameSite) cookie += `;SameSite=${this.sameSite}`;

        cookie = `${this.name}=${cookie};Max-Age=0`;

        context.headers.append('set-cookie', cookie);
    }

    cookie(context: Context) {
        const header = context.request.headers.get('cookie') || '';
        const cookies = header.split(/\s*;\s*/);

        for (const cookie of cookies) {
            const [name, value] = cookie.split(/\s*=\s*/);
            if (name === this.name) {
                return decodeURIComponent(value);
            }
        }

        return null;
    }

    setup(context: Context) {
        context.set('session', {
            data: null,
            create: this.create.bind(this, context),
            destroy: this.destroy.bind(this, context),
        });
    }

    async handle(context: Context, use: boolean): Promise<Response | void> {
        if (use === false) return;

        if (typeof this.#validate !== 'function') throw new Error('Session - validate required');
        if (typeof this.#forbidden !== 'function') throw new Error('Session - forbidden required');
        if (typeof this.#unauthorized !== 'function') throw new Error('Session - unauthorized required');

        const cookie = await this.cookie(context);
        if (!cookie) return this.#unauthorized(context);

        const unboxed = cookie.split('|');
        if (unboxed.length !== 3) return this.#unauthorized(context);

        const [encrypted, stamped, signed] = unboxed;

        const unsigned = await this.unsign(encrypted, stamped, signed);
        if (!unsigned) return this.#unauthorized(context);

        const unstamped = await this.unstamp(stamped);
        if (!unstamped) return this.#unauthorized(context);

        const decrypted = await this.decrypt(encrypted);
        if (!decrypted) return this.#unauthorized(context);

        context.tool.session.data = decrypted;
        const validate = await this.#validate(context, decrypted);

        return validate;
    }

}

// const secret = 'secret';
// const signature = 'signature';
// const session = new Session({ secret, signature });

// const e = await session.encrypt('hello world');
// console.log(e);

// const d = await session.decrypt(e);
// console.log(d);

// const now = Date.now();

// const s = await session.sign(e, `${now}`);
// console.log(s);

// const u = await session.unsign(e, `${now}`, s);
// console.log(u);
