import { fetchBody, proxyHandler, stubBuilder } from "./internal";

type Promisify<T> = T extends Promise<unknown> ? T : Promise<T>;

type WorkerMirror<T extends PersistentWorker<Env> | Worker<Env>, Env> = {
	[Key in keyof T]: T[Key] extends (...args: infer TArguments) => infer TReturn
		? (
				...args: { [I in keyof TArguments]: TArguments[I] }
		  ) => Promisify<TReturn>
		: Promisify<T[Key]>;
};

type InstanceMirror<C extends PersistentWorker<Env> | Worker<Env>, Env> = (
	| DurableObjectStub
	| Fetcher
) &
	WorkerMirror<C, Env>;

export class Worker<T> implements ExportedHandler<T> {
	// assigned in fetch instead of constructor
	// methods can safely assume env is defined
	env!: T;

	fetch = async (req: Request, env: T): Promise<Response> => {
		this.env = env;
		return fetchBody(req, this);
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

export const rpc = <T extends PersistentWorker<Env> | Worker<Env>, Env>(
	service: DurableObjectNamespace,
) => {
	const stub = stubBuilder(service) as InstanceMirror<T, Env>;

	return new Proxy<InstanceMirror<T, Env>>(stub, proxyHandler);
};
