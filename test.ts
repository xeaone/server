import { assert } from 'https://deno.land/std@0.209.0/assert/assert.ts';
import { Server, Handler, Router, Payload } from './src/mod.ts';

const url = 'http://0.0.0.0:8000';

Deno.test('start server', async () => {
    const ac = new AbortController();

    const onError = () => {
        ac.abort();
        assert(false);
    };

    const onListen = () => {
        ac.abort();
        assert(true);
    };

    const handler = () => new Response('OK', { status: 200 });

    const server = Server({ signal: ac.signal, onError, onListen, handler });

    await server.finished;
});

Deno.test('MethodNotAllowed', async () => {

    const handler = new Handler();

    const server = Server(request => handler.handle(request));

    const response = await fetch(url, { method: '405' });

    await server.shutdown();

    assert(response.status === 405);
    assert(response.statusText === 'Method Not Allowed');
    assert(await response.text() === 'Method Not Allowed');
});

Deno.test('get', async () => {

    const router = new Router();
    const handler = new Handler();

    router.get('/', context => context.ok());
    handler.add(router);

    const server = Server(request => handler.handle(request));

    const response = await fetch(url, { method: 'GET' });

    await server.shutdown();

    assert(response.status === 200);
    assert(response.statusText === 'OK');
    assert(await response.text() === 'OK');
});

Deno.test('post', async () => {
    const body = JSON.stringify({ hello: 'world' });

    const router = new Router();
    const payload = new Payload();
    const handler = new Handler();

    payload.any('/*', true);
    router.post('/', context => context.ok(context.tool.payload.data));

    handler.add(payload);
    handler.add(router);

    const server = Server(request => handler.handle(request));
    const response = await fetch(url, { method: 'POST', body });
    await server.shutdown();

    const { status, statusText } = response;
    const text = await response.text();

    assert(status === 200);
    assert(statusText === 'OK');
    assert(text === body);
});

// Deno.test('get /', async () => {

//     const router = new Router();
//     const handler = new Handler();
//     const normalize = new Normalize();

//     normalize.any('/*', true);
//     router.get('/*', (context) => context.html`<h1>Hello World</h1>`);
//     router.post('/*', (context) => context.ok({ message: 'posted' }));

//     handler.add(normalize);
//     handler.add(router);

//     const server = Server((request) => handler.handle(request));

//     const response = await fetch(url, { method: 'GET' });

//     await server.shutdown();

//     assert(response.status === 200);
//     assert(response.statusText === 'OK');
//     assert(await response.text() === 'OK');
// });
