import { defineConfig } from 'tsup';

export default defineConfig((options) => {
  return {
    entry: ['./src/index.ts'],
    outDir: './bin',
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: !options.watch,
  };
});
