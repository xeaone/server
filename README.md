[![Total alerts](https://img.shields.io/lgtm/alerts/g/xeaone/server.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/xeaone/server/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/xeaone/server.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/xeaone/server/context:javascript)

# X Server
A Deno server module. Coming Soon.

## Use
https://deno.land/x/xserver/mod.ts

## Example
```ts
import {
    Server,
    Router,
    Handler,
    Context,
    Normalize
} from 'https://deno.land/x/xserver/mod.ts';

import routes from './routes.ts';
import validate from './validate.ts';

const port = 8080;
const secret = 'generate-your-secret';
const signanture = 'generate-your-signature';

const routes = [
   [ '/helo-world', (context: Context) => context.end(200, 'helo world')]
]

const file = new File();
const router = new Router();
const payload = new Payload();
const session = new Session();
const handler = new Handler();
const normalize = new Normalize();

file.spa(true);
file.path('./web');

session.get('/*');
session.secret(secret);
session.validate(validate);
session.signature(signature);
session.post('/sign-up', '/sign-in', '/sign-out');

routes.forEach(([ path, handle ]) => router.post(path, handle));

router.get('/*', context => file.handle(context));

handler.add(normalize);
handler.add(payload);
handler.add(session);
handler.add(router);

Server(request => handler.handle(request), { port });

console.log(`listening on port: ${port}`);
```