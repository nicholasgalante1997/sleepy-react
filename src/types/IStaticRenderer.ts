export interface StaticRendererOptions<P = object> {
  /**
   * The component to render to a static markup file
   */
  Component: React.ComponentType<P>;
  /**
   * The output path to write the markup file to.
   *
   * This string is passed to path.resolve relative to process.cwd(),
   *
   * ```js
   * // i.e. if the output path supplied was "dist/about.html",
   * // the resulting path would be obtained by calling
   *
   * path.resolve(process.cwd(), "dist/about.html");
   * ```
   */
  outpath: string;
  /**
   * The bundled client hydration scripts to load from the browser (if any)
   */
  clientJs?: string[];
  /**
   * Any static props to pass to the Component and bundle into the DOM
   */
  props?: P;
  /**
   * Delete the existing stale markup file if it exists
   */
  clobber?: boolean;
}
