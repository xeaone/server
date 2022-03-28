import { readableStreamFromReader } from 'https://deno.land/std/streams/mod.ts';
import { Status, STATUS_TEXT, } from 'https://deno.land/std/http/http_status.ts';
import { extname, join } from 'https://deno.land/std/path/mod.ts';
import Context from './context.ts';
import Plugin from './plugin.ts';
import Mime from './mime.ts';

interface Options {
    spa?: boolean;
    path?: string;
}

export default class File implements Plugin {

    #spa?: boolean;
    #path?: string;

    constructor (options?: Options) {
        this.#spa = options?.spa;
        this.#path = options?.path;
    }

    spa (data: boolean) {
        this.#spa = data;
    }

    path (data: string) {
        this.#path = data;
    }

    async direct (context: Context, path: string): Promise<Response> {
        if (!this.#path) throw new Error('File - path required');

        path = join(this.#path, decodeURIComponent(path));
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
                return context.response(Status.NotFound, STATUS_TEXT.get(Status.NotFound), STATUS_TEXT.get(Status.NotFound));
            } else {
                throw error;
            }
        }

        if (!context.headers.has('content-type')) {
            const mime = Mime[ extension as keyof typeof Mime ] ?? Mime[ 'default' ];
            context.headers.set('content-type', `${mime};charset=utf8`);
        }

        const readableStream = readableStreamFromReader(file);
        return context.response(Status.OK, STATUS_TEXT.get(Status.OK), readableStream);
    }

    async handle (context: Context): Promise<Response> {
        if (!this.#path) throw new Error('File - path required');

        const { url } = context;
        let path = join(this.#path, decodeURIComponent(url.pathname));
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
                                    return context.response(Status.NotFound, STATUS_TEXT.get(Status.NotFound), STATUS_TEXT.get(Status.NotFound));
                                } else {
                                    throw error;
                                }
                            }

                        } else {
                            return context.response(Status.NotFound, STATUS_TEXT.get(Status.NotFound), STATUS_TEXT.get(Status.NotFound));
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
            const mime = Mime[ extension as keyof typeof Mime ] ?? Mime[ 'default' ];
            context.headers.set('content-type', `${mime};charset=utf8`);
        }

        const readableStream = readableStreamFromReader(file);
        return context.response(Status.OK, STATUS_TEXT.get(Status.OK), readableStream);
    }

}