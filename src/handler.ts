import Context from './context.ts';
import Handle from './handle.ts';
import Plugin from './plugin.ts';
import Type from './type.ts';

export default class Handler {
    #plugins: Set<Handle | Plugin> = new Set();

    add(plugin: Handle | Plugin) {
        this.#plugins.add(plugin);
    }

    async handle(request: Request) {
        const context = new Context(request);
        const iterator = this.#plugins.values();

        const method = context.request.method.toLowerCase();
        const pathname = new URL(context.request.url).pathname;

        let result = iterator.next();

        main:
        while (!result.done) {
            const plugin = result.value as any;
            const type = Type(plugin);

            if (type === 'object') {

                if (typeof plugin.setup === 'function') {
                    await plugin.setup(context);
                }

                if (typeof plugin.handle === 'function') {
                    const paths = plugin.data[method];

                    const exact = paths.get(pathname) ?? plugin.data.any.get(pathname);
                    if (exact) {
                        const response = await plugin.handle(context, exact);
                        if (response instanceof Response) return response;
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
                            const response = await plugin.handle(context, dynamic);
                            if (response instanceof Response) return response;
                        }

                        if (dynamic !== undefined) {
                            result = iterator.next();
                            continue main;
                        }
                    }

                    const any = paths.get('/*') ?? paths.get('*') ?? plugin.data.any.get('/*') ?? plugin.data.any.get('*');

                    if (any) {
                        const response = await plugin.handle(context, any);
                        if (response instanceof Response) return response;
                    }

                    if (any !== undefined) {
                        result = iterator.next();
                        continue main;
                    }
                }
            } else if (type === 'function' || type === 'asyncfunction') {
                const response = await plugin(context);
                if (response instanceof Response) return response;
            } else {
                throw new Error('Handler - not valid requires function or object');
            }

            result = iterator.next();
        }

        return new Response('Not Found', { status: 404 });
    }
}
