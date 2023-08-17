import { extname, join, media, ByteSliceStream, calculate, ifNoneMatch } from './deps.ts';
import Context from './context.ts';
import Plugin from './plugin.ts';

interface Options {
    spa?: boolean;
    path?: string;
}

const rangeRegex = /bytes=(?<start>\d+)?-(?<end>\d+)?$/u;
const parseRangeHeader = function (rangeValue: string, fileSize: number) {
    if (!rangeValue) return null;

    const parsed = rangeValue.match(rangeRegex);

    if (!parsed || !parsed.groups) {
        // failed to parse range header
        return null;
    }

    const { start, end } = parsed.groups;
    if (start !== undefined) {
        if (end !== undefined) {
            return { start: +start, end: +end };
        } else {
            return { start: +start, end: fileSize - 1 };
        }
    } else {
        if (end !== undefined) {
            // example: `bytes=-100` means the last 100 bytes.
            return { start: fileSize - +end, end: fileSize - 1 };
        } else {
            // failed to parse range header
            return null;
        }
    }
};

// const parseAcceptEncodingHeaders = function (data: string | null) {
//     return data?.split(/\s*,\s*/) ?? [];
// };

export default class File extends Plugin {
    #path = '';
    #spa = false;

    constructor(options?: Options) {
        super();
        this.#spa = options?.spa ?? this.#spa;
        this.#path = options?.path ?? this.#path;
    }

    spa(data: boolean): this {
        this.#spa = data;
        return this;
    }

    path(data: string): this {
        this.#path = data;
        return this;
    }

    async #send(context: Context, path: string, extension: string, stat: Deno.FileInfo) {
        const range = context.request.headers.get('range');
        const parsed = range && stat.size > 0 ? parseRangeHeader(range, stat.size) : null;
        const contentType = media.contentType(extension) ?? media.contentType('application/octet-stream');

        const ifNoneMatchValue = context.request.headers.get('if-none-match');
        const ifModifiedSinceValue = context.request.headers.get('if-modified-since');

        // date header if access timestamp is available
        if (stat.atime) context.headers.set('date', stat.atime.toUTCString());

        // last modified header if last modification timestamp is available
        if (stat.mtime) context.headers.set('last-modified', stat.mtime.toUTCString());

        if (
            !ifNoneMatchValue && ifModifiedSinceValue && stat.mtime &&
            stat.mtime.getTime() < new Date(ifModifiedSinceValue).getTime() + 1000
        ) {
            return context.notModified();
        }

        const etag = stat.mtime ? await calculate(stat) : undefined;
        if (etag) {
            context.headers.set('etag', etag);
            if (!ifNoneMatch(ifNoneMatchValue, etag)) return context.notModified();
        }

        if (!parsed) {
            context.headers.set('content-type', contentType);
            context.headers.set('content-length', `${stat.size}`);
            const file = await Deno.open(path, { read: true });

            // const responseEncodings = ['gzip', 'deflate'];
            // const requestEncodings = parseAcceptEncodingHeaders(context.request.headers.get('accept-encoding'));
            // const responseEncoding = requestEncodings.find(requestEncoding => responseEncodings.includes(requestEncoding));

            // if (responseEncoding) {
            //     context.headers.set('content-encoding', responseEncoding);
            //     const compression = new CompressionStream(responseEncoding);
            //     return context.ok(file.readable.pipeThrough(compression));
            // } else {
            // return context.ok(file.readable);
            // }

            return context.ok(file.readable);
        }

        // return 416 Range Not Satisfiable if invalid range header value
        if (
            parsed.end < 0 ||
            parsed.end < parsed.start ||
            stat.size <= parsed.start
        ) {
            context.headers.set('content-range', `bytes */${stat.size}`);
            return context.requestedRangeNotSatisfiable();
        }

        // clamps the range header value
        const start = Math.max(0, parsed.start);
        const end = Math.min(parsed.end, stat.size - 1);
        const contentLength = end - start + 1;

        context.headers.set('accept-ranges', 'bytes');
        context.headers.set('content-range', `bytes ${start}-${end}/${stat.size}`);
        context.headers.set('content-type', contentType);
        context.headers.set('content-length', `${contentLength}`);

        // return 206 Partial Content
        const file = await Deno.open(path, { read: true });
        await file.seek(start, Deno.SeekMode.Start);
        const body = file.readable.pipeThrough(new ByteSliceStream(0, contentLength - 1));

        return context.partialContent(body);
    }

    async direct(context: Context, path: string): Promise<Response> {
        if (!this.#path) throw new Error('File - path required');

        path = decodeURIComponent(path);
        path = path.endsWith('/') ? `${path}index.html` : path;
        path = join(this.#path, path);

        let extension = extname(path).slice(1);

        if (!extension) {
            extension = 'html';
            path = `${path}.html`;
        }

        let stat;

        try {
            stat = await Deno.stat(path);
        } catch (error) {
            if (error instanceof Deno.errors.NotFound) {
                return context.notFound();
            } else {
                throw error;
            }
        }

        return this.#send(context, path, extension, stat);
    }

    async handle(context: Context): Promise<Response> {
        if (!this.#path) throw new Error('File - path required');

        let path = decodeURIComponent(context.url.pathname);
        path = path.endsWith('/') ? `${path}index.html` : path;
        path = join(this.#path, path);

        let extension = extname(path).slice(1);

        if (!extension) {
            extension = 'html';
            path = `${path}.html`;
        }

        let stat;

        try {
            stat = await Deno.stat(path);
        } catch (error) {
            if (error instanceof Deno.errors.NotFound) {
                if (!path.endsWith('.html') && path.includes('.')) {
                    return context.notFound();
                }

                try {
                    path = join(path.slice(0, -5), 'index.html');
                    stat = await Deno.stat(path);
                } catch (error) {
                    if (error instanceof Deno.errors.NotFound) {
                        if (this.#spa) {
                            try {
                                path = join(this.#path, 'index.html');
                                stat = await Deno.stat(path);
                            } catch (error) {
                                if (error instanceof Deno.errors.NotFound) {
                                    return context.notFound();
                                } else {
                                    throw error;
                                }
                            }
                        } else {
                            return context.notFound();
                        }
                    } else {
                        throw error;
                    }
                }
            } else {
                throw error;
            }
        }

        return this.#send(context, path, extension, stat);
    }

}
