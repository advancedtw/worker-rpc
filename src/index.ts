import superjson from "superjson";

export class WorkerRPC<T> implements DurableObject {
	state: DurableObjectState;
	storage: DurableObjectStorage;
	env: T;

	constructor(state: DurableObjectState, env: T) {
		this.state = state;
		this.storage = state.storage;
		this.env = env;
	}

	// naive parse input
	private parseInput = (params: unknown) => {
		if (Array.isArray(params)) {
			return params;
		}

		return params ? [params] : [];
	};

	fetch = async (req: Request) => {
		// this could blowup let's make it safe or use a try/catch
		try {
			const params = await req.text();

			const args = this.parseInput(superjson.parse(params));

			const method = new URL(req.url).pathname.replace("/", "");
			const fn = Reflect.get(this, method);
			if (typeof fn !== "function") throw "error fn not found";

			// data might not conform to json
			const data = await Reflect.apply(fn, this, args);

			return new Response(superjson.stringify({ data }), {
				headers: { "content-type": "application/json" },
			});
		} catch (e) {
			console.log("bad input", e);
			return new Response('{"error":"bad input"}', {
				headers: { "content-type": "application/json" },
			});
		}
	};
}

const reqBuilder = (method: string, args: unknown[]) => {
	return new Request(`https://durable-object/${method}`, {
		body: superjson.stringify(args),
		method: "POST",
	});
};

const proxyHandler: ProxyHandler<DurableObjectStub> = {
	get: (target, p) => {
		if (p !== "fetch") {
			const fetcher = Reflect.get(target, "fetch");
			return async (...args: unknown[]) => {
				const req = reqBuilder(String(p), args);
				const a = await Reflect.apply(fetcher, target, [req]);
				try {
					const dataText = await a.text();
					const dateParsed = superjson.parse(dataText) as { data: unknown };
					return dateParsed.data;
				} catch (e) {
					console.log(e);
					throw "parse failed";
				}
			};
		}
	},
};

export const rpc = <T>(durable: DurableObjectNamespace, id?: string) => {
	const realId = id ? durable.idFromName(id) : durable.newUniqueId();
	const stub = durable.get(realId);
	return new Proxy(stub, proxyHandler) as unknown as T;
};
