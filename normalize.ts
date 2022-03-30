import Context from './context.ts';
import Plugin from './plugin.ts';

export default class Normalize implements Plugin {

    #www = false;
    #https = false;

    www (data: boolean) {
        this.#www = data;
        return this;
    }

    https (data: boolean) {
        this.#https = data;
        return this;
    }

    handle (context: Context): Response | void {
        let redirect = false;

        const { url } = context;

        const path = '/' + url.pathname
            .replace(/\/index\.html$/, '') // remove .html
            .replace(/\/(.*?)\.html$/, '$1') // remove .html
            .replace(/\/+/g, '/')
            .replace(/^\/|\/$/g, '')
            .toLowerCase();

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