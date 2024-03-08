import { fetchBody, proxyHandler, stubBuilder } from "./internal";

export class Worker<T> implements ExportedHandler<T> {
	// assigned in fetch instead of constructor
	// methods can safely assume env is defined
	env!: T;

	fetch = async (req: Request, env: T): Promise<Response> => {
		this.env = env;
		return await fetchBody(req, this);
	};
}

export class PersistentWorker<T> implements DurableObject {
	state: DurableObjectState;
	storage: DurableObjectStorage;
	env: T;

	constructor(state: DurableObjectState, env: T) {
		this.state = state;
		this.storage = state.storage;
		this.env = env;
	}

	fetch = async (req: Request): Promise<Response> => await fetchBody(req, this);
}

export const rpc = <T>(
	service: DurableObjectNamespace | Fetcher,
	id?: string,
) =>
	new Proxy(
		"idFromName" in service ? stubBuilder(service, id) : service,
		proxyHandler,
	) as unknown as T;
