import { extname, join, media, Status, ByteSliceStream } from './deps.ts';
import Context from './context.ts';
import Plugin from './plugin.ts';

interface Options {
    spa?: boolean;
    path?: string;
}

// const rangeRegex = /bytes=(?<start>\d+)?-(?<end>\d+)?$/u;
// const parseRangeHeader = function (rangeValue: string, fileSize: number) {
//     if (!rangeValue) return null;

//     const parsed = rangeValue.match(rangeRegex);

//     if (!parsed || !parsed.groups) {
//         // failed to parse range header
//         return null;
//     }

//     const { start, end } = parsed.groups;
//     if (start !== undefined) {
//         if (end !== undefined) {
//             return { start: +start, end: +end };
//         } else {
//             return { start: +start, end: fileSize - 1 };
//         }
//     } else {
//         if (end !== undefined) {
//             // example: `bytes=-100` means the last 100 bytes.
//             return { start: fileSize - +end, end: fileSize - 1 };
//         } else {
//             // failed to parse range header
//             return null;
//         }
//     }
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
                return context.end(Status.NotFound);
            } else {
                throw error;
            }
        }

        const contentType = media.contentType(extension) ?? media.contentType('txt');
        context.headers.set('content-type', contentType);

        const contentLength = `${stat.size}`;
        context.headers.set('content-length', contentLength);

        const file = await Deno.open(path, { read: true });
        return context.end(Status.OK, file.readable);
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
                    return context.end(Status.NotFound);
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
                                    return context.end(Status.NotFound);
                                } else {
                                    throw error;
                                }
                            }
                        } else {
                            return context.end(Status.NotFound);
                        }
                    } else {
                        throw error;
                    }
                }
            } else {
                throw error;
            }
        }

        // const range = context.request.headers.get('range');
        // const parsed = range && stat.size > 0 ? parseRangeHeader(range, stat.size) : null;

        // if (parsed) {
        //     // Return 416 Range Not Satisfiable if invalid range header value
        //     if (
        //         parsed.end < 0 ||
        //         parsed.end < parsed.start ||
        //         stat.size <= parsed.start
        //     ) {
        //         context.headers.set('content-range', `bytes */${stat.size}`);
        //         return context.end(Status.RequestedRangeNotSatisfiable, undefined);
        //     }

        //     // clamps the range header value
        //     const start = Math.max(0, parsed.start);
        //     const end = Math.min(parsed.end, stat.size - 1);

        //     context.headers.set('accept-ranges', 'bytes');
        //     context.headers.set('content-range', `bytes ${start}-${end}/${stat.size}`);

        //     const contentLength = end - start + 1;
        //     context.headers.set('content-length', `${contentLength}`);

        //     const contentType = media.contentType(extension) ?? media.contentType('txt');
        //     context.headers.set('content-type', contentType);

        //     // Return 206 Partial Content
        //     const file = await Deno.open(path);
        //     await file.seek(start, Deno.SeekMode.Start);
        //     const sliced = file.readable.pipeThrough(new ByteSliceStream(0, contentLength - 1));
        //     return context.end(Status.PartialContent, sliced);
        // }

        // context.headers.set('accept-ranges', 'bytes');

        const contentType = media.contentType(extension) ?? media.contentType('txt');
        context.headers.set('content-type', contentType);

        const contentLength = `${stat.size}`;
        context.headers.set('content-length', contentLength);

        const file = await Deno.open(path);
        return context.end(Status.OK, file.readable);
    }
}
