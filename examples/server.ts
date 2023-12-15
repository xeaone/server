import { File, Handler, Normalize, Payload, Router, Server, Session } from '../src/mod.ts';

import Secret from "https://deno.land/x/xtool@3.0.1/secret/mod.ts";

const secret = Secret(64);
const signature = Secret(64);

const users: Map<string, Record<string, number | string>> = new Map();
const sessions: Map<string, Record<string, number | string>> = new Map();

const file = new File();
const router = new Router();
const payload = new Payload();
const session = new Session();
const handler = new Handler();
const normalize = new Normalize();

file.spa(true);
file.get('/*', true);
file.path('./examples/public');

payload.post('/*', true);
normalize.any('/*', true);

session.secret(secret);
session.signature(signature);

session.validate((context) => {
    const { id } = context.tool.session.data;
    if (!sessions.has(id)) return context.unauthorized();
});

session.any('/*', true);
session.get('/*', false);
session.post('/sign-up', false);
session.post('/sign-in', false);

router.get('/error', () => {
    throw new Error('error');
});

router.post('/sign-up', context => {
    const { username, password } = context.tool.payload.data;
    if (!username) return context.badRequest('username required');
    if (!password) return context.badRequest('password required');
    const id = `${username}${password}`;
    users.set(id, { id, username, password });
    return context.ok('signed up');
});

router.post('/sign-out', async (context) => {
    const { id } = context.tool.session.data;
    sessions.delete(id);
    await context.tool.session.destroy();
    return context.ok('signed out');
});

router.post('/sign-in', async (context) => {
    const { username, password } = context.tool.payload.data;
    if (!users.has(`${username}${password}`)) return context.forbidden('credentials not valid');
    const created = Date.now();
    const expires = Date.now() + 3.6e+6;
    const id = crypto.randomUUID();
    const session = { id, expires, created };
    sessions.set(id, session);
    await context.tool.session.create(session);
    return context.ok('signed in');
});

handler.add(normalize);
handler.add(payload);
handler.add(session);
handler.add(router);
handler.add(file);

Server(request => handler.handle(request));

// console.log(`listening: ${port}`);
