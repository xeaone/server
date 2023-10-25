import { assert } from 'https://deno.land/std@0.204.0/assert/assert.ts';
import { server } from './src/mod.ts';

Deno.test('start server', () => {
    const ac = new AbortController();
    const handler = () => new Response('OK', { status: 200 });
    const onError = () => {
        ac.abort();
        assert(false);
    };
    const onListen = () => {
        ac.abort();
        assert(true);
    };
    server({ signal: ac.signal, onError, onListen, handler });
});
