import { promisify } from "node:util";
import { Log } from "sleepydogs";
import webpack from "webpack";

const { info, error } = Log.factory({
  service: "sleepycompiler",
  version: "0.0.1",
  level: "info",
});

export default async function runWebpackCompilation(
  config: webpack.Configuration,
) {
  const compiler = webpack(config);
  const run = promisify(compiler.run.bind(compiler));

  try {
    const stats = await run();
    if (stats) {
      const json = stats.toJson();
      info("Webpack Compilation Succeeded", json);
      return json;
    }
  } catch (e) {
    error("Webpack Compilation Failed");
    error(e);
  }
}
