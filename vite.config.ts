import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isLovableSandbox =
  process.env.LOVABLE_SANDBOX === "1" ||
  !!process.env.DEV_SERVER__PROJECT_PATH;

export default defineConfig({
  // Keep Lovable's normal configuration inside Lovable.
  // Outside Lovable, build the app as a static site for GitHub Pages.
  nitro: isLovableSandbox ? undefined : false,

  tanstackStart: isLovableSandbox
    ? {
        server: { entry: "server" },
      }
    : {
        prerender: {
          enabled: true,
          crawlLinks: true,
        },
        pages: [{ path: "/" }],
      },
});
