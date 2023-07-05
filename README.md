[![deno module](https://shield.deno.dev/x/xserver)](https://deno.land/x/xserver)
![deno compatibility](https://shield.deno.dev/deno/1.33.3)
[![CodeQL](https://github.com/xeaone/server/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/xeaone/server/actions/workflows/codeql-analysis.yml)
![GitHub](https://img.shields.io/github/license/xeaone/server)

# X-Server

Deno server module with built in middleware.

## Use

https://deno.land/x/xserver/src/mod.ts

```ts
import { Normalize, Router } from 'https://deno.land/x/xserver/src/mod.ts';
import { Handler, Server } from 'https://deno.land/x/xserver/src/mod.ts';

const router = new Router();
const handler = new Handler();
const normalize = new Normalize();

normalize.any('/*', true);

router.get('/*', (context) => context.ok('get'));
router.post('/post', (context) => context.end(200, 'post'));

handler.add(normalize);
handler.add(router);

Server({ port: 8080 }, (request) => handler.handle(request));
```

### Server

Wraps Deno Serve

### Handler

Constructor that stores the middleware/plugins/tools used on each request.

```ts
import { Handler, Normalize, Server } from 'https://deno.land/x/xserver/src/mod.ts';

const handler = new Handler();
const normalize = new Normalize();

handler.add(normalize);

Server((request) => handler.handle(request));
```

### Normalize

Constructor Plugin that will remove `index.html`, `.html`, and `//` from the url then redirect. Optionally you can redirect `http` to `https` and `www` to `non-www`.

```ts
import { Normalize } from 'https://deno.land/x/xserver/src/mod.ts';
const normalize = new Normalize();
normalize.www(true); // redirects www to non www
normalize.https(true); // redirects http to https
normalize.any('/*', true); // any method and any path Normalize
```

### Cors

Constructor Plugin that will add cors header.

```ts
import { Cors } from 'https://deno.land/x/xserver/src/mod.ts';
const cors = new Cors();
cors.get('/foo', 'https://foo.com/'); // get method test path and CORS on only foo.com domain
cors.any('/*', '*'); // any method any path and CORS on any domain
```

### Payload

Constructor Plugin that will parse the request body.

```ts
import { Payload } from 'https://deno.land/x/xserver/src/mod.ts';
const payload = new Payload();
payload.parse('json'); // default is json
payload.post('/*', true); // post method any path
```

### Router

Constructor Plugin that will route request to a handle method.

```ts
import { Router } from 'https://deno.land/x/xserver/src/mod.ts';
const router = new Router();
router.post('/*', (context) => context.end(200, 'hello world')); // post method any path
```

### File

Constructor Plugin that will serve files. SPA mode will route all non existent files in the path folder to the `/index.html`.

```ts
import { File } from 'https://deno.land/x/xserver/src/mod.ts';
const file = new File();
file.spa(true);
file.path('./web');
file.get('/*', true); // get method any path serve files from the ./web folder
```

### Session

Constructor Plugin that will provide session using Secure Session Cookies https://tools.ietf.org/html/rfc6896.

```ts
import { Session } from 'https://deno.land/x/xserver/src/mod.ts';

const sessions = new Map();
const session = new Session();

session.validate((context) => {
    const { session } = context.tool.session.data;
    if (!sessions.has(session)) return context.end(401); // return a response to prevent access
});

session.secret('secret'); // unique secret
session.signature('signature'); // unique signature

session.any('/*', true); // any method and any path is protected
session.get('/*', false); // get method any path disable session protection
session.post('/sign-up', false); // post method specific path disable session protection
session.post('/sign-in', false); // post method specific path disable session protection
```

### Forwarded

Constructor Plugin that will parse the `forwarded` header.
This is good for getting client/remote IP address behind a proxy/loadbalancer.

```ts
import { Forwarded } from 'https://deno.land/x/xserver/src/mod.ts';
import { Handler, Server } from 'https://deno.land/x/xserver/src/mod.ts';

const forwarded = new Forwarded();
const handler = new Handler();

forwarded.any('/*', true); // any method and any path parse forwarded header

handler.add(forwarded);

/*
    type ForwardedData = {
        by: Array<string>;
        for: Array<string>;
        host: Array<string>;
        proto: Array<string>;
    };
*/
handler.add(function (context) {
    const { for: [client] } = context.tool.forwarded.data;
    return context.end(200, client);
});

Server((request) => handler.handle(request), { port: 8080 });
```

### Socket

Constructor Plugin that will

```ts
```
