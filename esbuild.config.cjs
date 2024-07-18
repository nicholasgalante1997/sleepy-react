const esbuild = require('esbuild');

function getEsbuildConfig(format, outfile) {
  return {
    entryPoints: ['src/index.ts'],
    platform: "node",
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile,
    format,
    external: ['react', 'react-dom', 'webpack', 'babel-loader', 'style-loader', 'css-loader', 'process']
  }
}

async function buildCommonJs() {

  const { Log, Attempt, AttemptState, Timer } = await import('sleepydogs');

  const {
    info,
    error
  } = Log.factory({
    service: 'sleepy-react-esbuild',
    version: '1.1'
  });

  const timer = new Timer();

  timer.start();

  const callback = async () => await esbuild.build(getEsbuildConfig('cjs', 'dist/bundle.js'));

  const $ = new Attempt({
    callback,
    retries: 3,
    onError: error
  })

  await $.run();

  timer.stop();

  if ($.state === AttemptState.FAILED) {
    error(`CommonJS build failed in ${timer.elapsed()} ms`);
    error('[[esbuild]] common js bundle failed to output.')
    throw new Error('CommonJS Failed');
  }

  info(`CommonJS build passed in ${timer.elapsed()} ms`);
  info('CommonJS was built.')
}

async function buildESMJs() {

  const { Log, Attempt, AttemptState, Timer } = await import('sleepydogs');

  const {
    info,
    error
  } = Log.factory({
    service: 'sleepy-react-esbuild-esm',
    version: '1.1'
  });

  const timer = new Timer();

  timer.start();

  const callback = async () => await esbuild.build(getEsbuildConfig('esm', 'dist/esm/bundle.mjs'));

  const $ = new Attempt({
    callback,
    retries: 3,
    onError: error
  })

  await $.run();

  timer.stop();

  if ($.state === AttemptState.FAILED) {
    error(`ESM build failed in ${timer.elapsed()} ms`);
    error('[[esbuild]] esm js bundle failed to output.')
    throw new Error('ESM Failed');
  }

  info(`ESM build passed in ${timer.elapsed()} ms`);
  info('ESM was built.')
}

Promise.all([buildCommonJs(), buildESMJs()])
  .then(() => console.log('esbuild exited successfully.'))
  .catch((e) => {
    console.error(e)
    process.exit(1);
  });
