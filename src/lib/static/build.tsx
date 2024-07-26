import React from "react";
import { Log, Timer } from "sleepydogs";

import StaticPageBuilder from "@/models/StaticRenderer";

const { info, error } = Log.factory({
  service: "reactsleepy",
  version: "0.0.1",
});

export type PageConfiguration<
  P extends React.JSX.IntrinsicAttributes = object,
> = {
  name: string;
  Component: React.ComponentType<P>;
  outpath: string;
  getProps?: () => P | Promise<P>;
  hydration?: {
    scripts: Array<{ src: string }>;
  };
};

export default async function build(pages: PageConfiguration[]) {
  const timer = new Timer();
  info("Starting toStatic()");
  try {
    for (const page of pages) {
      info(`Creating Page: ${page.name}`);
      let props = {};
      if (page.getProps) {
        const promise = Promise.resolve(page.getProps());
        props = await promise;
      }

      const browserModules =
        page.hydration?.scripts.map(({ src }) => src) || [];

      const builder = new StaticPageBuilder();

      builder
        .setComponent(page.Component)
        .setProps(props)
        .setClobber(true)
        .setPath(page.outpath)
        .setBrowserModules(browserModules)
        .build();

      timer.stop();
    }
  } catch (e) {
    error(e);
    error("[reactsleepy/static] toStatic() threw an error");
    timer.stop();
    throw e;
  }

  info(`Run completed successfully after ${timer.elapsed()} ms`);
}
