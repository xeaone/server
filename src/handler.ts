import { Status, STATUS_TEXT } from './deps.ts';
import Context from './context.ts';
import Handle from './handle.ts';
import Plugin from './plugin.ts';

export default class Handler {
    #plugins: Set<Handle | Plugin> = new Set();

    add(plugin: Handle | Plugin) {
        this.#plugins.add(plugin);
    }

    async handle(request: Request) {
        try {
            const context = new Context(request);
            const iterator = this.#plugins.values();

            const method = request.method.toLowerCase();
            const pathname = new URL(request.url).pathname;

            let result = iterator.next();

            main:
            while (!result.done) {
                const plugin = result.value;

                if (plugin instanceof Plugin) {
                    if (typeof plugin.setup === 'function') {
                        await plugin.setup(context);
                    }

                    if (typeof plugin.handle === 'function') {
                        const paths = plugin.data[method];

                        const exact = paths.get(pathname) ?? plugin.data.any.get(pathname);
                        if (exact) {
                            const result = await plugin.handle(context, exact);
                            if (result instanceof Response) return result;
                        }

                        if (exact !== undefined) {
                            result = iterator.next();
                            continue main;
                        }

                        let path = '';
                        const parts = pathname.replace(/\/[^./]+\.[^./]+$|^\/+|\/+$/g, '').split('/');
                        for (const part of parts) {
                            path += part ? `/${part}` : part;

                            const dynamic = paths.get(`${path}/*`) ?? plugin.data.any.get(`${path}/*`);

                            if (dynamic) {
                                const result = await plugin.handle(context, dynamic);
                                if (result instanceof Response) return result;
                            }

                            if (dynamic !== undefined) {
                                result = iterator.next();
                                continue main;
                            }
                        }

                        const any = paths.get('/*') ?? paths.get('*') ?? plugin.data.any.get('/*') ?? plugin.data.any.get('*');

                        if (any) {
                            const result = await plugin.handle(context, any);
                            if (result instanceof Response) return result;
                        }

                        if (any !== undefined) {
                            result = iterator.next();
                            continue main;
                        }
                    }
                } else if (typeof plugin === 'function') {
                    const result = await plugin(context);
                    if (result instanceof Response) return result;
                } else {
                    throw new Error('Handler - not valid requires function or object');
                }

                result = iterator.next();
            }

            return new Response(STATUS_TEXT[Status.NotFound], { status: Status.NotFound, statusText: STATUS_TEXT[Status.NotFound] });
        } catch (error) {
            console.error(error);
            return new Response(STATUS_TEXT[Status.InternalServerError], { status: Status.InternalServerError, statusText: STATUS_TEXT[Status.InternalServerError] });
        }
    }
}
