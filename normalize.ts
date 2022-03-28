import Context from './context.ts';

export default class Normalize {

    handle (context: Context): Response | void {

        const { url } = context;

        const path = '/' + url.pathname
            .replace(/\/index\.html$/, '') // remove .html
            .replace(/\/(.*?)\.html$/, '$1') // remove .html
            .replace(/\/+/g, '/')
            .replace(/^\/|\/$/g, '')
            .toLowerCase();

        if (path !== url.pathname) {
            url.pathname = path;
            return Response.redirect(url.href, 301);
        }

    }

}