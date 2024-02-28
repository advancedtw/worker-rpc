interface Env {
	MyClass: DurableObjectNamespace;
}

declare module "cloudflare:test" {
	interface ProvidedEnv extends Env {}
}
