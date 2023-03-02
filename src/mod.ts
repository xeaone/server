// deno-fmt-ignore-file
import { serve as Server } from './deps.ts';

import Forwarded from './forwarded.ts';
import Defenders from './defenders.ts';
import Normalize from './normalize.ts';
import Payload from './payload.ts';
import Context from './context.ts';
import Handler from './handler.ts';
import Session from './session.ts';
import Router from './router.ts';
import Socket from './socket.ts';
import Cache from './cache.ts';
import Cors from './cors.ts';
import File from './file.ts';

import * as Handle from './handle.ts';
import * as Plugin from './plugin.ts';

export {
    Handle,
    Handle as handle,

    Forwarded,
    Forwarded as forwarded,

    Defenders,
    Defenders as defenders,

    Normalize,
    Normalize as normalize,

    Payload,
    Payload as payload,

    Context,
    Context as context,

    Handler,
    Handler as handler,

    Plugin,
    Plugin as plugin,

    Router,
    Router as router,

    Server,
    Server as server,

    Session,
    Session as session,

    Socket,
    Socket as socket,

    Cache,
    Cache as cache,

    File,
    File as file,

    Cors,
    Cors as cors,
};

export default Object.freeze({

    Forwarded,
    forwarded: Forwarded,

    Defenders,
    defenders: Defenders,

    Normalize,
    normalize: Normalize,

    Payload,
    payload: Payload,

    Context,
    context: Context,

    Handler,
    handler: Handler,

    Session,
    session: Session,

    Server,
    server: Server,

    Router,
    router: Router,

    Handle,
    handle: Handle,

    Plugin,
    plugin: Plugin,

    Socket,
    socket: Socket,

    Cache,
    cache: Cache,

    File,
    file: File,

    Cors,
    cors: Cors,
});
