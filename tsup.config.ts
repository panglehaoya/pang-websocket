import { defineConfig } from "tsup";

const config = {
  dts: true,
  clean: true,
  minify: true,
  outDir: "dist",
  sourcemap: false,
  external: ["vue"],
};

export default defineConfig([
  {
    entry: ["src/utils/index.ts"],
    format: ["esm", "cjs"],
    ...config,
  },
]);
