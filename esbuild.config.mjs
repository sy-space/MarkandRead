import esbuild from 'esbuild';

const production = process.argv.includes('production');

esbuild.build({
  entryPoints: ['main.ts'],
  bundle: true,
  outfile: 'main.js',
  platform: 'browser',
  target: 'es2018',
  format: 'cjs',  // ✅ 添加这个
  sourcemap: !production,
  minify: production,
  external: [
    'obsidian',
    'electron',
    // ✅ 添加 CodeMirror 相关的 external
    '@codemirror/autocomplete',
    '@codemirror/collab',
    '@codemirror/commands',
    '@codemirror/language',
    '@codemirror/lint',
    '@codemirror/search',
    '@codemirror/state',
    '@codemirror/view',
    '@lezer/common',
    '@lezer/highlight',
    '@lezer/lr',
  ],
  logLevel: 'info',
}).catch(() => process.exit(1));