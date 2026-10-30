
import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/server.ts"],
    format: ["cjs"],
    platform: "node",
    target: "node22",
    outDir: "dist",
    bundle: true,
    splitting: false,
    clean: true,
    sourcemap: true,
    tsconfig: "tsconfig.build.json",
    dts: false,
    external: [
        "@repo/shared",
        "@prisma/client",
        "@prisma/adapter-pg"
    ]
});
