import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode: builds static HTML/JS — served directly by nginx on EC2
  ssr: false,
} satisfies Config;
