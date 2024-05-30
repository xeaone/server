import { format, increment, parse } from './deps.ts';
import type { ReleaseType } from './deps.ts';

import p from '../package.json' with { type: 'json' };
import d from '../deno.json' with { type: 'json' };

const cmd = (cmd: string, args?: string[]) => new Deno.Command(cmd, { args }).spawn().output();

const [release] = Deno.args;
if (!release) throw new Error('release required');

const f = await cmd('git', ['fetch']);
if (!f.success) throw new Error('git auth');

const n = await cmd('npm', ['whoami']);
if (!n.success) throw new Error('npm auth');

const dp = await cmd('deno', ['publish', '--dry-run']);
if (!dp.success) throw new Error('deno publish');

const version = format(increment(parse(d.version), release as ReleaseType));

p.version = `${version}`;
d.version = `${version}`;

await Deno.writeTextFile('package.json', JSON.stringify(p, null, '    '));
await Deno.writeTextFile('deno.json', JSON.stringify(d, null, '    '));

await cmd('deno', [ 'fmt' ]);

await cmd('git', ['commit', '-a', '-m', version]);
await cmd('git', ['push']);
await cmd('git', ['tag', version]);
await cmd('git', ['push', '--tag']);

await cmd('npm', ['publish', '--access', 'public']);
await cmd('deno', ['publish', '--allow-slow-types']);
