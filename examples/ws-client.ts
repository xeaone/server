
// function logError (msg: string) {
//     console.log(msg);
//     Deno.exit(1);
// }

// function handleConnected (ws: WebSocket) {
//     console.log('Connected to server ...');
//     handleMessage(ws, 'Welcome!');
// }

// function handleMessage (ws: WebSocket, data: string) {
//     console.log('SERVER >> ' + data);
//     const reply = prompt('Client >> ') || 'No reply';
//     if (reply === 'exit') return ws.close();
//     ws.send(reply as string);
// }

// function handleError (e: Event | ErrorEvent) {
//     console.log(e instanceof ErrorEvent ? e.message : e.type);
// }

function open (e: Event) {
    const w = e.target as WebSocket;
    console.log('open');
    w.send('foo');
}

function close (e: Event) {
    const w = e.target as WebSocket;
    console.log('close');
}

function error (e: Event) {
    const w = e.target as WebSocket;
    console.log('error');
}

function message (e: MessageEvent) {
    const w = e.target as WebSocket;
    console.log('client message: ', e.data);
    // w.send(new Date().toString());
}

try {

    const ws = new WebSocket('ws://localhost:8000');

    ws.onopen = open;
    ws.onclose = close;
    ws.onerror = error;
    ws.onmessage = message;

    // ws.send('client: open');
} catch (e) {
    console.log(e);
}