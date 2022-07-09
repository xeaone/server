[![Total alerts](https://img.shields.io/lgtm/alerts/g/xeaone/server.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/xeaone/server/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/xeaone/server.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/xeaone/server/context:javascript)

# X-Server
A Deno server module. Coming Soon.

## Use
https://deno.land/x/xserver/mod.ts

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

### Server
Wraps Deno Serve `{ serve } from 'https://deno.land/std@0.134.0/http/server.ts';`

### Handler
(handler.ts)[./handler.ts]

Constructor that stores the middleware/plugins/tools used on each request.

```ts
import { Server, Handler, Normalize } from 'https://deno.land/x/xserver/mod.ts';

const handler = new Handler();
const normalize = new Normalize();

handler.add(normalize);

Server(request => handler.handle(request));
```

### Normalize
(normalize)[./normalize.ts]

Constructor Plugin that will remove `index.html`, `.html`, and `//` from the url then redirect. Optionally you can redirect `http` to `https` and `www` to  `non-www`.

```ts
import { Normalize } from 'https://deno.land/x/xserver/mod.ts';
const normalize = new Normalize();
normalize.www(true); // redirects www to non www
normalize.https(true); // redirects http to https
normalize.any('/*', true); // normalize all methos and all paths
```
### Cors
(cors)[./cors.ts]

Constructor Plugin that will add cors header.

```ts
import { Cors } from 'https://deno.land/x/xserver/mod.ts';
const cors = new Cors();
cors.get('/foo', 'https://foo.com/'); // get method test path and CORS on only foo.com domain
cors.any('/*', '*'); // any method any path and CORS on any domain
```

### Payload
(payload)[./payload.ts]

Constructor Plugin that will

```ts
import { Payload } from 'https://deno.land/x/xserver/mod.ts';
const payload = new Payload();
payload.parse('json'); // default is json
payload.post('/*', true); // post method any path
```

### Router
(router)[./router.ts]

Constructor Plugin that will route request to Handle methods.

```ts
import { Router } from 'https://deno.land/x/xserver/mod.ts';
const router = new Router();
router.post('/*', context => context.end(200, 'hello world')); // post method any path
```

### File
(file)[./file.ts]

Constructor Plugin that will

```ts
import { File, Router } from 'https://deno.land/x/xserver/mod.ts';
const file = new File();
file.spa(true);
file.path('./web');
file.get('/*', true); // get method any path serve files from the ./web folder
```

### Session
(session)[./session.ts]

Constructor Plugin that will

```ts
```

### Socket
(socket)[./socket.ts]

Constructor Plugin that will

```ts
```