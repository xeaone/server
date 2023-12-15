import { format } from 'https://deno.land/std@0.209.0/semver/format.ts';
import { increment, parse, ReleaseType } from 'https://deno.land/std@0.209.0/semver/mod.ts';

const cmd = (cmd: string, args?: string[]) => new Deno.Command(cmd, { args }).spawn().output();

const [release] = Deno.args;
if (!release) throw new Error('release required');

const f = await cmd('git', ['fetch']);
if (!f.success) throw new Error('git auth');

const n = await cmd('npm', ['whoami']);
if (!n.success) throw new Error('npm auth');

const pkg = JSON.parse(await Deno.readTextFile('./package.json'));
pkg.version = format(increment(parse(pkg.version), release as ReleaseType));

console.log(pkg.version);

await Deno.writeTextFile('./package.json', JSON.stringify(pkg, null, '    '));

await cmd('git', ['commit', '-a', '-m', pkg.version]);
await cmd('git', ['push']);
await cmd('git', ['tag', pkg.version]);
await cmd('git', ['push', '--tag']);

await cmd('npm', ['publish', '--access', 'public']);
