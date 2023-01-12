/**
 * Resource: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Forwarded
 */

import Context from './context.ts';
import Plugin from './plugin.ts';

type ForwardedData = {
    by: Array<string>;
    for: Array<string>;
    host: Array<string>;
    proto: Array<string>;
};

export default class Forwarded extends Plugin {

    setup(context: Context) {
        const data: ForwardedData = {
            by: [],
            for: [],
            host: [],
            proto: [],
        };

        context.set('forwarded', { data });
    }

    handle(context: Context) {
        const forwarded = context.request.headers.get('forwarded') ?? context.request.headers.get('Forwarded') ?? '';

        const parts = forwarded.toLowerCase().split(';');

        for (const part of parts) {
            const items = part.split(', ');

            for (const item of items) {
                const [name, itemValue] = item.split('=');

                if (
                    name !== 'by' &&
                    name !== 'for' &&
                    name !== 'host' &&
                    name !== 'proto'
                ) continue;

                const value = itemValue.startsWith('"') && itemValue.endsWith('"') ? itemValue.slice(1, -1) : itemValue;

                context.tool.forwarded.data[name].push(value);
            }
        }

    }
}
