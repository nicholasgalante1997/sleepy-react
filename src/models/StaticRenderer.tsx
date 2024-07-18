import React from "react";
import { RenderToPipeableStreamOptions } from "react-dom/server";

import { Attempt, Log } from "sleepydogs";

import fs from "fs";
import path from "path";

import _pipe, { PipeOptions } from "../lib/pipe";
import { StaticRendererOptions } from "../types/IStaticRenderer";

class StaticPageBuilder<P extends React.JSX.IntrinsicAttributes = {}> {
  private logger = Log.factory({ service: "sleepyreact", version: "0.1" });
  private Component: React.ComponentType<P> | null = null;
  private outpath: string | null = null;
  private props: P | undefined = undefined;
  private browserModules: string[] | undefined = undefined;
  private clobber: boolean = true;
  private onAfterPipeCallback: ((...args: any[]) => void) | null = null;

  constructor() {}

  build() {
    if (!this.instanceIsValid()) {
      throw new Error("Sleepy::StaticRenderer::InvalidInstanceException");
    }

    const resolvedPath = path.resolve(process.cwd(), this.outpath!);

    this.removeOutpathIfExists(resolvedPath);
    this.createOutDirIfNotExists(resolvedPath);
    const pipeOptions = this.createPipeOptions(resolvedPath);

    _pipe(pipeOptions as any);
  }

  setComponent(Component: StaticRendererOptions<P>["Component"]) {
    this.Component = Component;
    return this;
  }

  setPath(outpath: StaticRendererOptions<P>["outpath"]) {
    this.outpath = outpath;
    return this;
  }

  setBrowserModules(browserModules: StaticRendererOptions<P>["clientJs"]) {
    this.browserModules = browserModules;
    return this;
  }

  setProps(props: StaticRendererOptions<P>["props"]) {
    this.props = props;
    return this;
  }

  setClobber(clobber: StaticRendererOptions<P>["clobber"]) {
    this.clobber = !!clobber;
    return this;
  }

  setOnAfterPipeCallback(callback: typeof this.onAfterPipeCallback) {
    this.onAfterPipeCallback = callback;
    return this;
  }

  private remove(target: string) {
    new Attempt({
      callback: () => fs.rmSync(target, { force: true, recursive: true }),
      immediate: true,
      retries: 3,
      onError: console.error,
    });
  }

  private mkdirOut(dir: string) {
    new Attempt({
      callback: () => {
        fs.mkdirSync(dir, { recursive: true });
      },
      immediate: true,
      onError(e) {
        throw e;
      },
    });
  }

  private instanceIsValid() {
    if (this.Component == null) return false;
    if (this.outpath == null) return false;
    return true;
  }

  private removeOutpathIfExists(outpath: string) {
    const fileExists = fs.existsSync(outpath);
    if (this.clobber && fileExists) this.remove(outpath);
    if (!this.clobber && fileExists) {
      throw new Error(
        "File exists. If the intention is to delete the existing file, set `clobber` to true.",
      );
    }
  }

  private createOutDirIfNotExists(outpath: string) {
    const parentDir = path.basename(path.dirname(outpath));
    const parentDirExists = fs.existsSync(parentDir);
    if (!parentDirExists) this.mkdirOut(parentDir);
  }

  private createPipeOptions(outpath: string) {
    const abortController = new AbortController();
    const fsWriteStream = fs.createWriteStream(outpath, {
      encoding: "utf-8",
      flags: "w",
      signal: abortController.signal,
    });

    const options: RenderToPipeableStreamOptions = {
      bootstrapModules: this.browserModules || [],
      onShellError: (error) => {
        this.logger.error(error);
        throw error;
      },
      onError: (error) => {
        this.logger.info(error);
        abortController.abort();
        throw error;
      },
    };

    const callback = this.onAfterPipeCallback;

    const pipeOptions: PipeOptions<
      typeof fsWriteStream,
      any,
      typeof this.Component
    > = {
      Component: this.Component as React.ComponentType<P>,
      stream: fsWriteStream,
      type: "static",
      onAfterPipe() {
        fsWriteStream.end();
        if (callback) callback();
      },
      renderToPipeableStreamOptions: options,
      props: this.props,
    };

    return pipeOptions;
  }
}

export default StaticPageBuilder;
