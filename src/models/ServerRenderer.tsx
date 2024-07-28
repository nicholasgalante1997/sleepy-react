import React from 'react';
import { RenderToPipeableStreamOptions, renderToPipeableStream } from 'react-dom/server';

import PropsInjector from './PropsInjector';

class ServerRender<Props = any> {
  constructor(
    public Component: React.ComponentType<Props>,
    public props?: Props,
    public options: RenderToPipeableStreamOptions = {}
  ) {}

  pipeTo<W extends NodeJS.WritableStream>(writable: W) {
    const Component: React.ComponentType<Props> = this.Component;
    const props = this.props || ({} as Props);

    if (props) {
      Object.assign(this.options, {
        bootstrapScriptContent: new PropsInjector(props).toJS()
      } as RenderToPipeableStreamOptions)
    }

    const { pipe } = renderToPipeableStream(
      <Component {...(props as React.JSX.IntrinsicAttributes & Props)} />,
      {
        ...(this.options || {}),
        onShellReady: () => {
          if (this.options?.onShellReady) {
            this.options.onShellReady();
          }
          pipe(writable);
        }
      }
    );
  }
}

export default ServerRender;