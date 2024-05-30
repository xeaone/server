import { decodeBase64Url, encodeBase64Url, STATUS_CODE, STATUS_TEXT } from './deps.ts';
import type Context from './context.ts';
import { Plugin } from './plugin.ts';

/*
    Base64 URL: https://www.ietf.org/rfc/rfc4648.txt
    Secure Session Cookies: https://tools.ietf.org/html/rfc6896
*/

type SameSite = 'Strict' | 'Lax' | 'None';
type Forbidden = (context: Context) => Promise<Response | void> | Response | void;
type Unauthorized = (context: Context) => Promise<Response | void> | Response | void;
type Validate = (context: Context, data: any) => Promise<Response | void> | Response | void;

const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

interface Options {
    name?: string;
    realm?: string;
    parse?: boolean;

    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: SameSite;

    key?: number;
    salt?: number;
    vector?: number;
    iterations?: number;

    domain?: string;
    secret?: string;
    signature?: string;
    expiration?: number;

    validate?: Validate;
    forbidden?: Forbidden;
    unauthorized?: Unauthorized;
}

export default class Session extends Plugin<boolean> {
    scheme = 'scheme';
    name: string;
    realm: string;
    parse: boolean;

    #secure: boolean;
    #httpOnly: boolean;
    #sameSite: SameSite;

    key: number;
    salt: number;
    vector: number;
    iterations: number;

    #domain?: string;
    #secret?: string;
    #signature?: string;
    #expiration: number;

    #validate?: Validate;
    #forbidden: Forbidden;
    #unauthorized: Unauthorized;

    constructor(options?: Options) {
        super();

        this.name = options?.name ?? 'session';
        this.realm = options?.realm ?? 'secure';
        this.parse = options?.parse ?? true;

        this.#secure = options?.secure ?? true;
        this.#httpOnly = options?.httpOnly ?? true;
        this.#sameSite = options?.sameSite ?? 'Strict';

        this.key = options?.key ?? 32;
        this.salt = options?.salt ?? 16;
        this.vector = options?.vector ?? 16;
        this.iterations = options?.iterations ?? 10000;

        this.#domain = options?.domain;
        this.#secret = options?.secret;
        this.#signature = options?.signature;
        this.#expiration = options?.expiration ?? day;

        this.#validate = options?.validate;

        this.#forbidden = options?.forbidden ?? (() =>
            new Response(
                STATUS_TEXT[STATUS_CODE.Forbidden],
                { status: STATUS_CODE.Forbidden },
            ));

        this.#unauthorized = options?.unauthorized ?? (() =>
            new Response(
                STATUS_TEXT[STATUS_CODE.Unauthorized],
                {
                    status: STATUS_CODE.Unauthorized,
                    headers: { 'www-authenticate': `${this.scheme} realm="${this.realm}"` },
                },
            ));
    }

    /**
     * The set-cookie Secure header.
     * @param {boolean} secure
     * @returns {Session}
     */
    secure(secure: boolean): Session {
        if (typeof secure !== 'boolean') throw new Error('secure not valid');
        this.#secure = secure;
        return this;
    }

    /**
     * The set-cookie HttpOnly header.
     * @param {boolean} httpOnly
     * @returns {Session}
     */
    httpOnly(httpOnly: boolean): Session {
        if (typeof httpOnly !== 'boolean') throw new Error('httpOnly not valid');
        this.#httpOnly = httpOnly;
        return this;
    }

    /**
     * The set-cookie SameSite header.
     * @param {SameSite} sameSite
     * @returns {Session}
     */
    sameSite(sameSite: SameSite): Session {
        if (!sameSite || typeof sameSite !== 'string') throw new Error('sameSite not valid');
        this.#sameSite = sameSite;
        return this;
    }

    /**
     * The set-cookie Domain header.
     * @param {string} domain
     * @returns {Session}
     */
    domain(domain: string): Session {
        if (!domain || typeof domain !== 'string') throw new Error('domain not valid');
        this.#domain = domain;
        return this;
    }

    /**
     * The number of milliseconds the session/cookie is valid default is 1 day or 24 hours.
     * @param {number} expiration
     * @returns {Session}
     */
    expiration(expiration: number): Session {
        if (typeof expiration !== 'number') throw new Error('expiration not valid');
        this.#expiration = expiration;
        return this;
    }

    /**
     * The secret to use to encrypt/decrrypt the cookies.
     * @param {string} secret
     * @returns {Session}
     */
    secret(secret: string): Session {
        if (!secret || typeof secret !== 'string') throw new Error('secret not valid');
        this.#secret = secret;
        return this;
    }

    /**
     * The signature to use to sign/unsign the cookies.
     * @param {string} signature
     * @returns {Session}
     */
    signature(signature: string): Session {
        if (!signature || typeof signature !== 'string') throw new Error('signature not valid');
        this.#signature = signature;
        return this;
    }

    validate(validate: Validate): Session {
        this.#validate = validate;
        return this;
    }

    forbidden(forbidden: Forbidden): Session {
        this.#forbidden = forbidden;
        return this;
    }

    unauthorized(unauthorized: Unauthorized): Session {
        this.#unauthorized = unauthorized;
        return this;
    }

    async encrypt(data: string, secret?: string): Promise<string> {
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

        return encodeBase64Url(
            new Uint8Array([
                ...salt,
                ...vector,
                ...new Uint8Array(encrypted),
            ]),
        );
    }

    async decrypt(encrypted: string, secret?: string): Promise<string> {
        secret = secret || this.#secret;

        if (!encrypted) throw new Error('Session - encrypted required');
        if (!secret) throw new Error('Session - secret required');

        const decoded = decodeBase64Url(encrypted);

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

    async sign(encrypted: string, stamped: string, signature?: string): Promise<string> {
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

        return encodeBase64Url(signed);
    }

    async unsign(encrypted: string, stamped: string, signed: string, signature?: string): Promise<boolean> {
        signature = signature || this.#signature;

        if (!encrypted) throw new Error('Session - encrypted required');
        if (!stamped) throw new Error('Session - stamped required');
        if (!signed) throw new Error('Session - signed required');
        if (!signature) throw new Error('Session - signature required');

        const decoded = decodeBase64Url(signed);

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

    stamp(time: number): string {
        if (!time) throw new Error('Session - time required');
        const expiration = time + this.#expiration;
        return encodeBase64Url(`${expiration}`);
    }

    unstamp(time: string): boolean {
        if (!time) throw new Error('Session - time required');

        const decoded = decoder.decode(decodeBase64Url(time));
        const expiration = Number(decoded);

        if (!expiration) return false;

        return Date.now() < expiration;
    }

    async create(context: Context, data: string | Record<string, unknown>): Promise<void> {
        if (!data) throw new Error('Session - data required');

        const time = Date.now();
        const parse = typeof data === 'string';
        const parsed = parse ? data : JSON.stringify(data);
        const encrypted = await this.encrypt(`${parsed}|${parse ? 'f' : 't'}`);
        const stamped = await this.stamp(time);
        const signed = await this.sign(encrypted, stamped);

        let cookie = `${this.name}=${encrypted}|${stamped}|${signed}`;

        if (this.#secure) cookie += ';Secure';
        if (this.#httpOnly) cookie += ';HttpOnly';
        if (this.#domain) cookie += `;Domain=${this.#domain}`;
        if (this.#sameSite) cookie += `;SameSite=${this.#sameSite}`;

        cookie += `;Max-Age=${this.#expiration / 1000}`;

        if (encoder.encode(cookie).length > 4090) throw new Error('Session - cookie size invalid');

        context.headers.append('set-cookie', cookie);
    }

    destroy(context: Context): void {
        let cookie = '';

        if (this.#secure) cookie += ';Secure';
        if (this.#httpOnly) cookie += ';HttpOnly';
        if (this.#sameSite) cookie += `;SameSite=${this.#sameSite}`;

        cookie = `${this.name}=${cookie};Max-Age=0`;

        context.headers.append('set-cookie', cookie);
    }

    cookie(context: Context): string | null {
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

    setup(context: Context): void {
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
