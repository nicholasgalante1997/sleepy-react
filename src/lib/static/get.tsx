import fs from "fs";
import path from "path";

export async function getStaticBundle(
  base: string,
  out: string,
  publicPath: string = "",
) {
  out = path.resolve(process.cwd(), out);
  const dirEnts = fs.readdirSync(out, {
    encoding: "utf8",
    withFileTypes: true,
  });
  const dirEnt = dirEnts.find(
    (d) => d.isFile() && d.name.startsWith(`${base}.`),
  );
  if (dirEnt) {
    return `${publicPath}/${dirEnt.name}`;
  }
  throw new Error("[reactsleepy/static]:::Asset does not exist.");
}
