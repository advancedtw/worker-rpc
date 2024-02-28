export { MyClass } from "./class";
import { rpc } from "../src";
import { MyClass } from "./class";

export default {
	fetch: async (_request, env, _ctx) => {
		const r = rpc<MyClass>(env.MyClass, "any");
		console.log((await r.complextTypes(new Date())).toDateString());
		return new Response("dummy handler");
	},
} satisfies ExportedHandler<Env>;
