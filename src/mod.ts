// deno-fmt-ignore-file
import { serve as Server } from './deps.ts';

import Forwarded from './forwarded.ts';
import Normalize from './normalize.ts';
import Payload from './payload.ts';
import Context from './context.ts';
import Handler from './handler.ts';
import Session from './session.ts';
import Router from './router.ts';
import Socket from './socket.ts';
import Cors from './cors.ts';
import File from './file.ts';

import * as Handle from './handle.ts';
import * as Plugin from './plugin.ts';

export {
    Context,
    Context as context,

    Cors,
    Cors as cors,

    File,
    File as file,

    Handle,
    Handle as handle,

    Handler,
    Handler as handler,

    Forwarded,
    Forwarded as forwarded,

    Normalize,
    Normalize as normalize,

    Payload,
    Payload as payload,

    Plugin,
    Plugin as plugin,

    Router,
    Router as router,

    Server,
    Server as server,

    Session,
    Session as session,

    Socket,
    Socket as socket
};

export default Object.freeze({
    Forwarded,
    Normalize,
    Payload,
    Context,
    Handler,
    Session,
    Server,
    Router,
    Handle,
    Plugin,
    Socket,
    Cors,
    File,

    forwarded: Forwarded,
    normalize: Normalize,
    payload: Payload,
    context: Context,
    handler: Handler,
    session: Session,
    server: Server,
    router: Router,
    handle: Handle,
    plugin: Plugin,
    socket: Socket,
    cors: Cors,
    file: File,
});
