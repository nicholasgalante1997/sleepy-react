import React from "react";
import {
  renderToPipeableStream,
  RenderToPipeableStreamOptions,
} from "react-dom/server";

import { Writable } from "stream";

export type PipeOptions<
  W extends Writable = Writable,
  P extends React.JSX.IntrinsicAttributes = object,
  C = React.ComponentType<P>,
> = {
  stream: W;
  Component: C;
  type: "static" | "server";
  props?: P;
  renderToPipeableStreamOptions?: RenderToPipeableStreamOptions;
  onAfterPipe?: () => void | Promise<void>;
};

export default function pipe(config: PipeOptions) {
  const {
    Component,
    props = {},
    type,
    stream,
    onAfterPipe,
    renderToPipeableStreamOptions,
  } = config;

  const { pipe } = renderToPipeableStream(<Component {...props} />, {
    ...renderToPipeableStreamOptions,
    [type === "static" ? "onAllReady" : "onShellReady"]: function () {
      pipe(stream);
      if (onAfterPipe) onAfterPipe();
    },
  });
}
