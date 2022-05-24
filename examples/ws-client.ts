//chat_client.ts

function logError (msg: string) {
    console.log(msg);
    Deno.exit(1);
}

function handleConnected (ws: WebSocket) {
    console.log("Connected to server ...");
    handleMessage(ws, "Welcome!");
}

function handleMessage (ws: WebSocket, data: string) {
    console.log("SERVER >> " + data);
    const reply = prompt("Client >> ") || "No reply";
    if (reply === "exit") return ws.close();
    ws.send(reply as string);
}

function handleError (e: Event | ErrorEvent) {
    console.log(e instanceof ErrorEvent ? e.message : e.type);
}

console.log("Connecting to server ...");

try {
    const ws = new WebSocket("ws://localhost:8000");
    ws.onopen = () => handleConnected(ws);
    ws.onmessage = (m) => handleMessage(ws, m.data);
    ws.onclose = () => logError("Disconnected from server ...");
    ws.onerror = (e) => handleError(e);
} catch (err) {
    logError("Failed to connect to server ... exiting");
}