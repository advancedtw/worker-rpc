import { WorkerRPC } from "../src/";

export class MyClass extends WorkerRPC<{ KV: KVNamespace }> {
	basic = async (a: number) => {
		return a + 100;
	};

	towBasic = async (a: number, b: number) => {
		return a + b;
	};

	basicString = async (a: string) => {
		return `string is ${a.length ?? 0} in length `;
	};

	twoBasicString = async (a: string, b: string) => {
		return `combined string ${a.length + b.length} in length `;
	};

	useStorage = async (data: number) => {
		await this.storage.put("some-data", data);
	};

	readStorage = async <T>(key: string) => {
		return (await this.storage.get(key)) as T;
	};

	innerCall = async () => {
		console.log("this.innerCall");
		// this call will skip rpc
		const d = await this.readStorage("some-data");
		return d;
	};

	complextTypes = async (date: Date) => {
		date.setDate(date.getDate() + 1);
		return date;
	};

	typedArray = async (arg: Uint8Array) => {
		return arg.fill(9);
	};
}
