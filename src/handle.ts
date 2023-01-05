import Context from './context.ts';

type Handle = (context: Context) => Promise<Response | void> | Response | void;

export default Handle;
