import React from "react";
import merge from "lodash.merge";
import { Log, Timer } from "sleepydogs";
import { Configuration } from "webpack";

import StaticPageBuilder from "@/models/StaticRenderer";
import createWebpackConfig from "@/lib/webpack/createWebpackConfig";
import runWebpackCompiler from "@/lib/webpack/runWebpackCompilation";

const { info, error } = Log.factory({
  service: "reactsleepy",
  version: "0.0.1",
});

export type PageConfiguration<P extends React.JSX.IntrinsicAttributes = {}> = {
  name: string;
  Component: React.ComponentType<P>;
  outpath: string;
  getProps?: () => P | Promise<P>;
  hydration?: {
    scripts: Array<{ src: string }>;
  };
};

export default async function build(
  pages: PageConfiguration[],
  webpack: Configuration = {},
) {
  const buildInfo = [];

  for (const page of pages) {
    if (page.hydration?.scripts && page.hydration.scripts.length) {
      const entry = {};
      for (const { src } of page.hydration.scripts) {
        Object.assign(entry, { [page.name]: src });
        const config = createWebpackConfig({ entry });
        const buildJson = await runWebpackCompiler(merge(config, webpack));
        buildInfo.push(buildJson);
      }
    }

    let props = null;
    if (page.getProps) {
      const promise = Promise.resolve<any>(page.getProps());
      props = await promise;
    }

    const builder = new StaticPageBuilder();

    builder
      .setComponent(page.Component)
      .setProps(props)
      .setClobber(true)
      .setPath(page.outpath)
      .setBrowserModules([])
      .build();
  }

  return {
    status: "OK",
    react: {},
    webpack: buildInfo,
  };
}
