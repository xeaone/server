import { Status, STATUS_TEXT, } from 'https://deno.land/std/http/http_status.ts';
import * as base64url from 'https://deno.land/std/encoding/base64url.ts';
import Context from './context.ts';
import Handle from './handle.ts';
import Plugin from './plugin.ts';

/*
    Base64 URL: https://www.ietf.org/rfc/rfc4648.txt
    Secure Session Cookies: https://tools.ietf.org/html/rfc6896
*/

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
    secret?: string;
    signature?: string;
    validate?: (context: Context, data: any) => void;
}

export default class Session implements Plugin {

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
    #secret?: string;
    #signature?: string;
    #validate?: (context: Context, data: any) => void;

    #get: Set<string> = new Set();
    #head: Set<string> = new Set();
    #post: Set<string> = new Set();
    #put: Set<string> = new Set();
    #delete: Set<string> = new Set();
    #connect: Set<string> = new Set();
    #options: Set<string> = new Set();
    #trace: Set<string> = new Set();
    #patch: Set<string> = new Set();
    #any: Set<string> = new Set();

    constructor (options?: Options) {

        this.maxAge = options?.maxAge;
        this.name = options?.name ?? 'session';
        this.realm = options?.realm ?? 'secure';
        this.parse = options?.parse ?? true;
        this.secure = options?.secure ?? true;
        this.httpOnly = options?.httpOnly ?? true;
        this.sameSite = options?.sameSite ?? 'strict';
        this.expiration = options?.expiration ?? EXPIRATION;

        this.#secret = options?.secret;
        this.#signature = options?.signature;
        this.#validate = options?.validate ?? undefined;

        this.key = options?.key ?? 32;
        this.salt = options?.salt ?? 16;
        this.vector = options?.vector ?? 16;
        this.iterations = options?.iterations ?? 10000;

    }

    get (...path: string[]) { path.forEach(path => this.#get.add(path)); return this; }
    head (...path: string[]) { path.forEach(path => this.#head.add(path)); return this; }
    post (...path: string[]) { path.forEach(path => this.#post.add(path)); return this; }
    put (...path: string[]) { path.forEach(path => this.#put.add(path)); return this; }
    delete (...path: string[]) { path.forEach(path => this.#delete.add(path)); return this; }
    connect (...path: string[]) { path.forEach(path => this.#connect.add(path)); return this; }
    options (...path: string[]) { path.forEach(path => this.#options.add(path)); return this; }
    trace (...path: string[]) { path.forEach(path => this.#trace.add(path)); return this; }
    patch (...path: string[]) { path.forEach(path => this.#patch.add(path)); return this; }
    any (...path: string[]) { path.forEach(path => this.#any.add(path)); return this; }

    secret (secret: string) { this.#secret = secret; return this; }
    validate (validate: Handle) { this.#validate = validate; return this; }
    signature (signature: string) { this.#signature = signature; return this; }

    // encode (data: ArrayBuffer) { return base64url.encode(data); }
    // decode (data: string) { return base64url.decode(data); }

    async encrypt (data: string, secret?: string) {
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
            [ 'deriveBits', 'deriveKey' ]
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
            [ 'encrypt', 'decrypt' ]
        );

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-CBC', iv: vector },
            key,
            encoder.encode(data)
        );

        return base64url.encode(new Uint8Array([
            ...salt,
            ...vector,
            ...new Uint8Array(encrypted)
        ]));
    }

    async decrypt (encrypted: string, secret?: string) {
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
            [ 'deriveBits', 'deriveKey' ]
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
            [ 'encrypt', 'decrypt' ]
        );

        const decrypted = decoder.decode(await crypto.subtle.decrypt(
            { name: 'AES-CBC', iv: vector },
            key, data
        ));

        const [ content, parse ] = decrypted.split('|');

        return parse === 't' ? JSON.parse(content) : content;
    }

    async sign (encrypted: string, stamped: string, signature?: string) {
        signature = signature || this.#signature;

        if (!encrypted) throw new Error('Session - encrypted required');
        if (!stamped) throw new Error('Session - stamped required');
        if (!signature) throw new Error('Session - signature required');

        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(signature),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            [ 'sign', 'verify' ]
        );

        const signed = await crypto.subtle.sign(
            'HMAC',
            key,
            encoder.encode(`${encrypted}|${stamped}`)
        );

        return base64url.encode(signed);
    }

    async unsign (encrypted: string, stamped: string, signed: string, signature?: string) {
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
            [ 'sign', 'verify' ]
        );

        const computed = new Uint8Array(await crypto.subtle.sign(
            'HMAC',
            key,
            encoder.encode(`${encrypted}|${stamped}`)
        ));

        if (computed.byteLength !== decoded.byteLength) return false;

        return decoder.decode(computed) === decoder.decode(decoded);
    }

    stamp (time: number) {
        if (!time) throw new Error('Session - time required');
        const expiration = time + this.expiration;
        return base64url.encode(`${expiration}`);
    }

    unstamp (time: string) {
        if (!time) throw new Error('Session - time required');

        const decoded = decoder.decode(base64url.decode(time));
        const expiration = Number(decoded);

        if (!expiration) return false;

        return Date.now() < expiration;
    }

    async create (context: Context, data: string | Record<string, unknown>) {
        if (!data) throw new Error('Session - data required');

        const time = Date.now();
        const parse = typeof data === 'string';
        const parsed = parse ? data : JSON.stringify(data);
        // const parsed = this.parse ? JSON.stringify(data) : data;
        const encrypted = await this.encrypt(`${parsed}|${parse ? 'f' : 't'}`);
        const stamped = await this.stamp(time);
        const signed = await this.sign(encrypted, stamped);

        let cookie = `${this.name}=${encrypted}|${stamped}|${signed}`;

        if (this.secure) cookie += ';Secure';
        if (this.httpOnly) cookie += ';HttpOnly';
        if (this.sameSite) cookie += `;SameSite=${this.sameSite}`;

        if (this.maxAge) cookie += `;Max-Age=${this.maxAge}`;
        else cookie += `;Max-Age=${time + this.expiration}`;

        if (encoder.encode(cookie).length > 4090) throw new Error('Session - cookie size invalid');

        context.headers.append('set-cookie', cookie);
    }

    destroy (context: Context) {
        let cookie = '';

        if (this.secure) cookie += ';Secure';
        if (this.httpOnly) cookie += ';HttpOnly';
        if (this.sameSite) cookie += `;SameSite=${this.sameSite}`;

        cookie = `${this.name}=${cookie};Max-Age=0`;

        context.headers.append('set-cookie', cookie);
    }

    forbidden () {
        return new Response(STATUS_TEXT.get(Status.Forbidden), { status: Status.Forbidden });
    }

    unauthorized () {
        const headers = { 'www-authenticate': `${this.scheme} realm="${this.realm}"` };
        return new Response(STATUS_TEXT.get(Status.Unauthorized), { status: Status.Unauthorized, headers });
    }

    cookie (context: Context) {
        const header = context.request.headers.get('cookie') || '';
        const cookies = header.split(/\s*;\s*/);

        for (const cookie of cookies) {
            const [ name, value ] = cookie.split(/\s*=\s*/);
            if (name === this.name) {
                return decodeURIComponent(value);
            }
        }

        return null;
    }

    async handle (context: Context) {
        const method = context.method;
        const path = context.url.pathname;

        let paths;
        switch (method) {
            case 'get': paths = this.#get; break;
            case 'head': paths = this.#head; break;
            case 'post': paths = this.#post; break;
            case 'put': paths = this.#put; break;
            case 'delete': paths = this.#delete; break;
            case 'connect': paths = this.#connect; break;
            case 'options': paths = this.#options; break;
            case 'trace': paths = this.#trace; break;
            case 'patch': paths = this.#patch; break;
            default: throw new Error('Session - invalid method');
        }

        if (typeof this.#validate !== 'function') {
            throw new Error('Session - validate required');
        }

        context.set('session', {
            data: null,
            create: this.create.bind(this, context),
            destroy: this.destroy.bind(this, context)
        });

        if (paths.has(path) || paths.has('*') || paths.has('/*')) return;
        if (this.#any.has(path) || this.#any.has('*') || this.#any.has('/*')) return;

        const cookie = await this.cookie(context);
        if (!cookie) return this.unauthorized();

        const unboxed = cookie.split('|');
        if (unboxed.length !== 3) return this.unauthorized();

        const [ encrypted, stamped, signed ] = unboxed;

        const unsigned = await this.unsign(encrypted, stamped, signed);
        if (!unsigned) return this.unauthorized();

        const unstamped = await this.unstamp(stamped);
        if (!unstamped) return this.unauthorized();

        const decrypted = await this.decrypt(encrypted);
        if (!decrypted) return this.unauthorized();

        // const data = this.parse ? JSON.parse(decrypted) : decrypted;
        // context.tool.session.data = data;
        // const validate = await this.#validate?.(context, data);

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

