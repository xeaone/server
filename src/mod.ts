import Normalize from './normalize.ts';
import Payload from './payload.ts';
import Context from './context.ts';
import Handler from './handler.ts';
import Session from './session.ts';
import Router from './router.ts';
import Socket from './socket.ts';
import Cors from './cors.ts';
import File from './file.ts';
import Mime from './mime.ts';

import { serve as Server } from './deps.ts';

import * as Handle from './handle.ts';
import * as Plugin from './plugin.ts';

export {

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
    Mime,

    Normalize as normalize,
    Payload as payload,
    Context as context,
    Handler as handler,
    Session as session,
    Server as server,
    Router as router,
    Handle as handle,
    Plugin as plugin,
    Socket as socket,
    Cors as cors,
    File as file,
    Mime as mime,

};

export default Object.freeze({

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
    Mime,

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
    mime: Mime,

});