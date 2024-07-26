import React from "react";
import {
  RenderToPipeableStreamOptions,
  renderToPipeableStream,
} from "react-dom/server";
import { Log } from "sleepydogs";
import { createWriteStream, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

export interface ReactRenderToFileOptions<
  P extends React.JSX.IntrinsicAttributes = object,
> {
  filename: string;
  path?: string;
  component: React.ComponentType<P>;
  props?: P;
  clobber?: boolean;
  debug?: boolean;
  pipeableStreamOptions?: RenderToPipeableStreamOptions;
}

function renderToFile(options: ReactRenderToFileOptions) {
  const {
    component: Component,
    filename,
    clobber = false,
    debug = false,
    path: outdir = null,
    pipeableStreamOptions = undefined,
    props = {},
  } = options;

  const rfl = Log.factory({
    level: debug ? "info" : "silent",
    service: "react-sleepy/file",
    version: "0.1",
  });

  let out = process.cwd();

  if (outdir) {
    if (existsSync(path.resolve(out, outdir))) {
      out = path.resolve(out, outdir);
    } else {
      try {
        mkdirSync(path.resolve(out, outdir), { recursive: true });
        out = path.resolve(out, outdir);
      } catch (e) {
        rfl.error("Unable to create out directory: " + outdir);
        rfl.error(e);
        throw e;
      }
    }
  }

  out = path.resolve(out, filename);

  if (existsSync(out)) {
    if (clobber) {
      rfl.warn(`Trying to remove ${out}`);
      try {
        rmSync(out, {
          force: true,
          recursive: true,
          retryDelay: 300,
          maxRetries: 5,
        });
      } catch (e) {
        rfl.error("Unable to remove file at " + out);
        throw e;
      }
      rfl.info(`Removed ${out}`);
    } else {
      throw new Error(
        "File exists at supplied destination but option `clobber` is set to false. Try switching `clobber` to true if the desired behavior is to overwrite existing files.",
      );
    }
  }

  const controller = new AbortController();

  const stream = createWriteStream(out, {
    encoding: "utf-8",
    flags: "w",
    signal: controller.signal,
  });

  const onAllReady = pipeableStreamOptions?.onAllReady;
  const onShellError = pipeableStreamOptions?.onShellError;

  const { pipe } = renderToPipeableStream(<Component {...props} />, {
    ...(pipeableStreamOptions ? pipeableStreamOptions : {}),
    onAllReady() {
      if (onAllReady) {
        onAllReady();
      }

      rfl.info(`Piping ${Component.displayName ?? "Component"} to stream...`);
      pipe(stream);
      stream.end();
      stream.close(() => rfl.warn("write stream closed."));
      rfl.info("Operation complete.");
    },
    onShellError(error) {
      rfl.error(error);
      if (onShellError) {
        onShellError(error);
      }
      controller.abort();
      stream.close(() => rfl.warn("write stream closed."));
    },
  });
}

export default renderToFile;
