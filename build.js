
require("dotenv").config();
const esbuild = require("esbuild");

if (!process.env.PRESAGE_API_KEY) {
  throw new Error("PRESAGE_API_KEY is missing from .env");
}

esbuild.buildSync({
  entryPoints: ["renderer.js"],
  bundle: true,
  outfile: "dist/renderer.bundle.js",
  platform: "browser",
  format: "iife",
  define: {
    "process.env.PRESAGE_API_KEY":
      JSON.stringify(process.env.PRESAGE_API_KEY)
  }
});

console.log("NeuroSense renderer built successfully.");