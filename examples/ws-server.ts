import { serve } from 'https://deno.land/std/http/mod.ts';

function open (e: Event) {
    // const w = e.target as WebSocket;
    console.log('open');
}

function close (e: Event) {
    // const w = e.target as WebSocket;
    console.log('close');
}

function error (e: Event) {
    // const w = e.target as WebSocket;
    console.log('error');
}

function message (e: MessageEvent) {
    const w = e.target as WebSocket;
    console.log('server message: ', e.data);
    w.send(new Date().toString());
}

function request (req: Request) {

    if (req.headers.get('upgrade')) {

        if (req.headers.get("upgrade") !== "websocket") {
            return new Response(null, { status: 501 });
        }

        const { socket: ws, response } = Deno.upgradeWebSocket(req);

        ws.onopen = open;
        ws.onclose = close;
        ws.onerror = error;
        ws.onmessage = message;

        return response;
    }

    return new Response('hello world');
}

serve(request, { port: 8000 });

console.log('listening: 8000');