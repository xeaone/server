import { Context, File, Handler, Normalize, Payload, Router, Server, Session } from '../src/mod.ts';

import Secret from "https://deno.land/x/xtool@3.0.1/secret/mod.ts";

const port = 8080;
const secret = Secret(64);
const signature = Secret(64);

const users: Map<string, Record<string, number | string>> = new Map();
const sessions: Map<string, Record<string, number | string>> = new Map();

const validate = (context: Context) => {
    const { id } = context.tool.session.data;
    if (!sessions.has(id)) return context.end(401);
};

const file = new File();
const router = new Router();
const payload = new Payload();
const session = new Session();
const handler = new Handler();
const normalize = new Normalize();

file.spa(true);
file.get('/*', true);
file.path('./examples/web');

payload.post('/*', true);
normalize.any('/*', true);

session.secret(secret);
session.validate(validate);
session.signature(signature);

session.any('/*', true);
session.get('/*', false);
session.post('/sign-up', false);
session.post('/sign-in', false);

router.get('/error', () => {
    throw new Error('error');
});

router.post('/sign-up', (context) => {
    const { username, password } = context.tool.payload.data;
    if (!username) return context.end(400, 'username required');
    if (!password) return context.end(400, 'password required');
    const id = `${username}${password}`;
    users.set(id, { id, username, password });
    return context.end(200, 'signed up');
});

router.post('/sign-out', async (context) => {
    const { id } = context.tool.session.data;
    sessions.delete(id);
    await context.tool.session.destroy();
    return context.end(200, 'signed out');
});

router.post('/sign-in', async (context) => {
    const { username, password } = context.tool.payload.data;
    if (!users.has(`${username}${password}`)) return context.end(400, 'credentials not valid');
    const created = Date.now();
    const expires = Date.now() + 3.6e+6;
    const id = crypto.randomUUID();
    const data = { id, expires, created };
    await context.tool.session.create(data);
    sessions.set(id, data);
    return context.end(200, 'signed in');
});

handler.add(normalize);
handler.add(payload);
handler.add(session);
handler.add(router);
handler.add(file);

Server({ port }, request => handler.handle(request));

// console.log(`listening: ${port}`);
