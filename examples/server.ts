import {
    File,
    Server,
    Router,
    Payload,
    Session,
    Handler,
    Context,
    Normalize
} from '../mod.ts';

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
    }
};

const file = new File();
const router = new Router();
const payload = new Payload();
const session = new Session();
const handler = new Handler();
const normalize = new Normalize();

file.spa(true);
file.path('./web');
file.get('/*', true);

payload.post('/*', true);
normalize.any('/*', true);

session.secret(secret);
session.validate(validate);
session.signature(signature);

session.any('/*', true);
session.get('/*', false);
session.post('/sign-up', false);
session.post('/sign-in', false);

// Object.entries(routes).forEach(([ path, handle ]) => router.post(path, handle));
router.post(routes);

// router.get('/*', context => file.handle(context));

router.get('/*', context => {
    return context.head({ 'content-type': 'text/html' }).end(200, /*html*/`
    <h1>Hello World</h1>
    <script type="module">
        let result;

        result = await fetch('/sign-out', { method:'POST' });
        console.log('/sign-out','result:', result.status, 'expected:', 401, 'text:', await result.text());

        result = await fetch('/sign-in', { method:'POST', body: JSON.stringify({username:'u',password:'p'}) });
        console.log('/sign-in','result:', result.status, 'expected:', 400, 'text:', await result.text());

        result = await fetch('/sign-in', { method:'POST', body: JSON.stringify({username:'username',password:'password'}) });
        console.log('/sign-in','result:', result.status, 'expected:', 200, 'text:', await result.text());

        result = await fetch('/sign-out', { method:'POST' });
        console.log('/sign-out','result:', result.status, 'expected:', 200, 'text:', await result.text());

    </script>
    `);
});

handler.add(normalize);
handler.add(payload);
handler.add(session);
handler.add(router);
handler.add(file);

Server(request => handler.handle(request), { port });

console.log(`listening: ${port}`);