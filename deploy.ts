import { increment, ReleaseType } from 'https://deno.land/std@0.188.0/semver/mod.ts';

const [release] = Deno.args;
if (!release) throw new Error('release required');

const f = await (new Deno.Command('git', { args: ['fetch'] }).spawn()).output();
if (!f.success) throw new Error('git auth');

const n = await (new Deno.Command('npm', { args: ['whoami'] }).spawn()).output();
if (!n.success) throw new Error('npm auth');

const pkg = JSON.parse(await Deno.readTextFile('./package.json'));
pkg.version = increment(pkg.version, release as ReleaseType);

await Deno.writeTextFile('./package.json', JSON.stringify(pkg, null, '    '));
await (new Deno.Command('git', { args: ['commit', '-a', '-m', pkg.version] }).spawn()).output();
await (new Deno.Command('git', { args: ['push'] }).spawn()).output();
await (new Deno.Command('git', { args: ['tag', pkg.version] }).spawn()).output();
await (new Deno.Command('git', { args: ['push', '--tag'] }).spawn()).output();
await (new Deno.Command('npm', { args: ['publish', '--access', 'public'] }).spawn()).output();
