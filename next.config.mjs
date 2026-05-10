import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    loadPaths: [path.join(__dirname, "styles")],
    additionalData: `@use "functions" as *; @use "typography" as *; @use "colors" as *;`,
  },
};

export default nextConfig;
