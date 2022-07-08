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
    Normalize
} from 'https://deno.land/x/xserver/mod.ts';

const port = 8080;

const router = new Router();
const handler = new Handler();
const normalize = new Normalize();

router.get('/post', context => context.end(200, 'post'));
router.get('/*', context => context.end(200, 'get'));

handler.add(normalize);
handler.add(router);

Server(request => handler.handle(request), { port });

console.log(`listening: ${port}`);
```