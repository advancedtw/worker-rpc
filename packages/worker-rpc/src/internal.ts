import { SerovalJSON, fromJSON, toJSON } from "seroval";
import queryString from "query-string";

const getParams = async (req: Request) => {
	const m = req.method;

	if (m === "GET") return queryString.parse(new URL(req.url).search) as Params;

	if (m === "POST") return fromJSON(await req.json()) as Params;

	throw "only get and post are currently supported";
};

export const fetchBody = async (req: Request, target: object) => {
	const args = await getParams(req);
	const method = new URL(req.url).pathname.replace("/", "");
	const fn = Reflect.get(target, method);
	if (typeof fn !== "function")
		// maybe return 404?
		throw "error fn not found";

	const data = await Reflect.apply(fn, this, Object.values(args));

	if (data instanceof ReadableStream)
		// if the data is a stream skip serialization
		return new Response(data, {
			headers: { "content-type": "application/octet-stream" },
		});

	return new Response(JSON.stringify(toJSON(data)), {
		headers: {
			"content-type": "application/json",
		},
	});
};

const reqBuilder = (method: string, args: unknown[]) => {
	return new Request(`https://woker-rpc/${method}`, {
		body: JSON.stringify(toJSON(args)),
		method: "POST",
	});
};

export const stubBuilder = (service: DurableObjectNamespace, id?: string) => {
	const realId = id ? service.idFromName(id) : service.newUniqueId();
	return service.get(realId);
};

export const proxyHandler: ProxyHandler<DurableObjectStub | Fetcher> = {
	get: (target, p) => {
		if (p !== "fetch") {
			const fetcher = Reflect.get(target, "fetch");
			return async (...args: unknown[]) => {
				const req = reqBuilder(String(p), args);
				const a = await Reflect.apply(fetcher, target, [req]);
				const h = a.headers.get("content-type");
				if (h !== "application/json") {
					return a.body;
				}
				const data = (await a.json()) as SerovalJSON;
				return fromJSON(data);
			};
		}
	},
};
