import Context from './context.ts';
import Plugin from './plugin.ts';

export default class Cors extends Plugin {

    handle (context: Context, origin: string) {

        context.headers.append('Access-Control-Allow-Origin', origin);
    }

}