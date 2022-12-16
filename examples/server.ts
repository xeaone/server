import {
    File,
    Server,
    Router,
    Payload,
    Session,
    Handler,
    Context,
    Normalize
} from '../src/mod.ts';

import Secret from 'https://deno.land/x/xtool@0.0.6/secret/mod.ts';

const port = 8080;
const secret = Secret(64);
const signature = Secret(64);

const users: Map<string, Record<string, number | string>> = new Map();
const sessions: Map<string, Record<string, number | string>> = new Map();

const validate = (context: Context) => {
    const { id } = context.tool.session.data;
    if (!sessions.has(id)) return context.end(401);
};

const routes = {
    '/sign-up': (context: Context) => {
        const { username, password } = context.tool.payload.data;
        if (!username) return context.end(400, 'username required');
        if (!password) return context.end(400, 'password required');
        const id = `${username}${password}`;
        users.set(id, { id, username, password });
        return context.end(200, 'signed up');
    },
    '/sign-out': async (context: Context) => {
        const { id } = context.tool.session.data;
        sessions.delete(id);
        await context.tool.session.destroy();
        return context.end(200, 'signed out');
    },
    '/sign-in': async (context: Context) => {
        const { username, password } = context.tool.payload.data;
        if (!users.has(`${username}${password}`)) return context.end(400, 'credentials not valid');
        const created = Date.now();
        const expires = Date.now() + 3.6e+6;
        const id = crypto.randomUUID();
        const data = { id, expires, created };
        await context.tool.session.create(data);
        sessions.set(id, data);
        return context.end(200, 'signed in');
    }
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

router.post(routes);

handler.add(normalize);
handler.add(payload);
handler.add(session);
handler.add(router);
handler.add(file);

await Server((request:Request) => handler.handle(request), { port });

// console.log(`listening: ${port}`);