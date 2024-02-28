import { defineWorkersPoolOptions } from "@cloudflare/vitest-pool-workers/config";

import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		pool: "@cloudflare/vitest-pool-workers",
		poolOptions: {
			workers: defineWorkersPoolOptions({
				isolatedStorage: true,
				wrangler: {
					configPath: "./wrangler.toml",
				},
			}),
		},
	},
});