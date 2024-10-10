import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // By default, Vite will assume we are serving from the root of the domain
  // (i.e. /); however, because we are serving the application from a
  // subdirectory of my projects domain (e.g.
  // https://projects.calebevans.me/connect-four-multidimensional/), we must
  // specify . as the base directory to serve from
  base: './',
  // Enable JSX processing
  esbuild: {
    // We need to use _m as the imported name so that it doesn't collide with
    // explicitly importing _m, while still allowing us to have organizeImports
    // strip out "unused" mithril imports
    jsxInject: "import _m from 'mithril'",
    jsxFactory: '_m',
    jsxFragment: '_m.Fragment'
  }
});
