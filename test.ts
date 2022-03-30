import {
    Server,
    Router,
    Handler,
    Normalize
} from './mod.ts';

const port = 8080;
const router = new Router();
const handler = new Handler();
const normalize = new Normalize();

normalize.www(true);
router.any('/*', context => context.end(200, 'ok', 'hello world'));

handler.add(router);
handler.add(normalize);

Server(request => handler.handle(request), { port });

console.log('listening: 8080');
