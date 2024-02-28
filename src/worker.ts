export { MyClass } from "../example/class";

export default {
	fetch: async (_request, _env, _ctx) => {
		return new Response("dummy handler");
	},
} satisfies ExportedHandler<Env>;
