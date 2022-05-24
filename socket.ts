import Context from './context.ts';
import Plugin from './plugin.ts';

type Open = (ws: WebSocket, ev: Event) => any;
type Close = (ws: WebSocket, ev: CloseEvent) => any;
type Message = (ws: WebSocket, ev: MessageEvent) => any;
type Error = (ws: WebSocket, ev: Event | ErrorEvent) => any;

export default class Socket implements Plugin {

    #open?: Open;
    #close?: Close;
    #message?: Message;
    #error?: Error;

    constructor () {

    }

    open (open: Open) { this.#open = open; }
    close (close: Close) { this.#close = close; }
    error (error: Error) { this.#error = error; }
    message (message: Message) { this.#message = message; }

    handle (context: Context) {
        const { request } = context;
        const { headers } = request;

        if (headers.get('upgrade')) {

            if (headers.get('upgrade') !== 'websocket') {
                return new Response('unsupported upgrade header', { status: 500 });
            }

            const { socket: ws, response } = Deno.upgradeWebSocket(request);

            if (this.#open) ws.onopen = this.#open?.bind(null, ws);
            if (this.#close) ws.onclose = this.#close?.bind(null, ws);
            if (this.#error) ws.onerror = this.#error?.bind(null, ws);
            if (this.#message) ws.onmessage = this.#message?.bind(null, ws);

            return response;
        }

    }

}