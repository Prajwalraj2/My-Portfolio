import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  clean: true,
  // Bundle everything into a single executable; prepend the shebang so `npx` can run it.
  banner: { js: "#!/usr/bin/env node" },
});
