import React from "react";
import {
  RenderToPipeableStreamOptions,
  renderToPipeableStream,
} from "react-dom/server";
import { Log } from "sleepydogs";
import { Writable } from "node:stream";

export interface ReactRenderIntoPipeOptions<
  P extends React.JSX.IntrinsicAttributes = object,
  W extends Writable = Writable,
> {
  component: React.ComponentType<P>;
  props?: P;
  pipeableStreamOptions?: RenderToPipeableStreamOptions;
  stream: W;
}

function renderIntoPipe(options: ReactRenderIntoPipeOptions) {
  const {
    component: Component,
    stream,
    pipeableStreamOptions = undefined,
    props = {},
  } = options;

  const rfl = Log.factory({
    level: "info",
    service: "react-sleepy/pipe",
    version: "0.1",
  });

  const onAllReady = pipeableStreamOptions?.onAllReady;
  const onShellError = pipeableStreamOptions?.onShellError;

  const { pipe } = renderToPipeableStream(<Component {...props} />, {
    ...(pipeableStreamOptions ? pipeableStreamOptions : {}),
    onAllReady() {
      if (onAllReady) {
        onAllReady();
      }

      rfl.info("Piping component to stream...");
      pipe(stream);
      stream.end();
    },
    onShellError(error) {
      rfl.error(error);
      if (onShellError) {
        onShellError(error);
      }
      stream.end(() => rfl.warn("write stream closed."));
    },
  });
}

export default renderIntoPipe;
