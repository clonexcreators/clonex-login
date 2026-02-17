import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'index.ts',
    oauth: 'oauth.ts',
    'components/index': 'components/index.ts'
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom'],
  treeshake: true,
  splitting: false,
  sourcemap: true,
  minify: false
});
