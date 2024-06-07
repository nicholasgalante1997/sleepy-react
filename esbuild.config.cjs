const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    platform: "node",
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: 'dist/bundle.js',
    format: 'cjs',
    external: ['react', 'react-dom']
  })
  .then(() => console.log('Created "dist" output folder.'))
  .catch((e) => { console.error(e); process.exit(2); });