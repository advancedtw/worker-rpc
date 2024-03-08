export { MyClass } from "@worker-rpc/example";

export default {
	fetch: async (_request, _env, _ctx) => {
		return new Response("dummy handler");
	},
} satisfies ExportedHandler<Env>;
