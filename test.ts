import {
    // File,
    Server,
    Router,
    Payload,
    Session,
    Handler,
    Context,
    Normalize
} from 'https://deno.land/x/xserver/mod.ts';

const port = 8080;
const secret = 'generate-your-secret';
const signature = 'generate-your-signature';

const sessions: string[] = [];

const validate = (context: Context) => {
    const { session } = context.tool.session.data;
    if (!sessions.includes(session)) return context.end(401);
};

const routes = {
    '/sign-up': (context: Context) => context.end(200, 'signed up'),
    '/sign-out': (context: Context) => context.end(200, 'signed out'),
    '/sign-in': async (context: Context) => {
        const { username, password } = context.tool.payload.data;
        if (username !== 'username') return context.end(400, 'username not valid');
        if (password !== 'password') return context.end(400, 'password not valid');
        const created = Date.now();
        const expires = Date.now() + 3.6e+6;
        const session = 'generate-your-session';
        await context.tool.session.create({ expires, created, session });
        sessions.push(session);
        return context.end(200, 'signed in');
    },
};

// const file = new File();
const router = new Router();
const payload = new Payload();
const session = new Session();
const handler = new Handler();
const normalize = new Normalize();

// file.spa(true);
// file.path('./web');

session.get('/*');
session.secret(secret);
session.validate(validate);
session.signature(signature);
session.post('/sign-up', '/sign-in');

Object.entries(routes).forEach(([path, handle]) => router.post(path, handle));

// router.get('/*', context => file.handle(context));
router.get('/*', context => context.end(200, 'hello world'));

handler.add(normalize);
handler.add(payload);
handler.add(session);
handler.add(router);

Server(request => handler.handle(request), { port });

console.log(`listening: ${port}`);

/*
let result;
result = await fetch('/sign-out', { method:'POST' });
console.log(await result.text());
result = await fetch('/sign-in', { method:'POST', body: JSON.stringify({username:'u',password:'p'}) });
console.log(await result.text());
result = await fetch('/sign-in', { method:'POST', body: JSON.stringify({username:'username',password:'password'}) });
console.log(await result.text());
result = await fetch('/sign-out', { method:'POST' });
console.log(await result.text());
*/