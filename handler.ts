import Context from './context.ts';
import Handle from './handle.ts';
import Plugin from './plugin.ts';

// interface Options {
//     plugins: [];
// }

export default class Handler {

    #plugins = new Set();

    // constructor (options?: Options) {
    //     super(options?.plugins);
    // }

    add (plugin: Handle | Plugin) {
        // if (!plugin || typeof plugin === 'object') {
        //     throw new Error('Handler - not valid requires function or object');
        // }
        this.#plugins.add(plugin);
    }

    async handle (request: Request) {
        const context = new Context(request);
        const iterator = this.#plugins.values();

        let result = iterator.next();
        while (!result.done) {
            const plugin = result.value as any;

            let response;
            if (plugin && typeof plugin === 'object') {
                if (typeof plugin.handle !== 'function') throw new Error('Handler - plugin requires handle method');
                response = await plugin.handle(context);
            } else if (typeof plugin === 'function') {
                response = await plugin(context);
            } else {
                throw new Error('Handler - not valid requires function or object');
            }

            if (response instanceof Response) return response;

            result = iterator.next();
        }

        return new Response('Not Found', { status: 404 });
    }

}