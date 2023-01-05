import { readableStreamFromReader, extname, join, media } from './deps.ts';
import Context from './context.ts';
import Plugin from './plugin.ts';

interface Options {
    spa?: boolean;
    path?: string;
}

export default class File extends Plugin {

    #path = '';
    #spa = false;

    constructor (options?: Options) {
        super();
        this.#spa = options?.spa ?? this.#spa;
        this.#path = options?.path ?? this.#path;
    }

    spa (data?: boolean): this | boolean {
        if (data === undefined) {
            return this.#spa;
        } else {
            this.#spa = data;
            return this;
        }
    }

    path (data?: string): this | string {
        if (data === undefined) {
            return this.#path;
        } else {
            this.#path = data;
            return this;
        }
    }

    async direct (context: Context, path: string): Promise<Response> {
        if (!this.#path) throw new Error('File - path required');

        path = decodeURIComponent(path);
        path = path.endsWith('/') ? `${path}index.html` : path;
        path = join(this.#path, path);

        let extension = extname(path).slice(1);

        if (!extension) {
            extension = 'html';
            path = `${path}.html`;
        }

        let file;

        try {
            file = await Deno.open(path, { read: true });
        } catch (error) {
            if (error.name === 'NotFound') {
                return context.end(404);
            } else {
                throw error;
            }
        }

        if (!context.headers.has('content-type')) {
            const contentType = media.contentType(extension) ?? media.contentType('txt');
            context.headers.set('content-type', contentType);
        }

        const readableStream = readableStreamFromReader(file);
        return context.end(200, readableStream);
    }

    async handle (context: Context): Promise<Response> {
        if (!this.#path) throw new Error('File - path required');

        let path = decodeURIComponent(context.url.pathname);
        path = path.endsWith('/') ? `${path}index.html` : path;
        path = join(this.#path, path);

        let extension = extname(path).slice(1);

        if (!extension) {
            extension = 'html';
            path = `${path}.html`;
        }

        let file;

        try {
            file = await Deno.open(path, { read: true });

        } catch (error) {

            if (error.name === 'NotFound') {

                if (!path.endsWith('.html') && path.includes('.')) {
                    return context.end(404);
                }

                try {
                    path = join(path.slice(0, -5), 'index.html');
                    file = await Deno.open(path, { read: true });
                } catch (error) {

                    if (error.name === 'NotFound') {

                        if (this.#spa) {

                            try {
                                file = await Deno.open(join(this.#path, 'index.html'), { read: true });
                            } catch (error) {

                                if (error.name === 'NotFound') {
                                    return context.end(404);
                                } else {
                                    throw error;
                                }

                            }

                        } else {
                            return context.end(404);
                        }

                    } else {
                        throw error;
                    }

                }

            } else {
                throw error;
            }

        }

        if (!context.headers.has('content-type')) {
            const contentType = media.contentType(extension) ?? media.contentType('txt');
            context.headers.set('content-type', contentType);
        }

        const readableStream = readableStreamFromReader(file);
        return context.end(200, readableStream);
    }

}