import Context from './context.ts';
import Plugin from './plugin.ts';

/**
 * ## Normalize URL
 * Strips ending `index.html`, `.html`, `/` and replaces duplicate `//`
 * options
 * - redirect `www = false`
 * - redirect `https = false`
 */

export default class Normalize extends Plugin {

    #www = false;
    #https = false;

    www(data: boolean) {
        this.#www = data;
        return this;
    }

    https(data: boolean) {
        this.#https = data;
        return this;
    }

    handle(context: Context): Response | void {
        let redirect = false;

        const { url } = context;

        let path = url.pathname.toLowerCase();

        if (path.endsWith('/index.html')) {
            path = path.slice(0, -11);
        }

        if (path.endsWith('.html')) {
            path = path.slice(0, -5);
        }

        if (path.includes('//')) {
            path = path.replace('//', '/');
        }

        if (path.startsWith('/')) {
            path = path.slice(1);
        }

        if (path.endsWith('/')) {
            path = path.slice(0, -1);
        }

        path = '/' + path;

        if (this.#https && url.protocol === 'http:') {
            redirect = true;
            url.protocol = 'https';
        }

        if (this.#www && url.hostname.startsWith('www.')) {
            redirect = true;
            url.hostname = url.hostname.slice(4);
        }

        if (path !== url.pathname) {
            redirect = true;
            url.pathname = path;
        }

        if (redirect) {
            return Response.redirect(url.href, 301);
        }
    }
    
}
