import { describe, expect, it } from "vitest";
import { env } from "cloudflare:test";
import { rpc } from "../src";
import { MyClass } from "@worker-rpc/example";

describe("Worker RPC", () => {
	it("basic", async () => {
		const p = rpc<MyClass>(env.MyClass);
		expect(await p.basic(1)).toBe(101);
	});

	it("2 params", async () => {
		const p = rpc<MyClass>(env.MyClass);
		expect(await p.towBasic(1, 10)).toBe(11);
	});

	it("write to storage", async () => {
		const p = rpc<MyClass>(env.MyClass);
		await p.useStorage(10);
		expect(await p.readStorage<number>("some-data")).toBe(10);
	});

	it("take a Date as args", async () => {
		const p = rpc<MyClass>(env.MyClass);
		const date = new Date("2024-02-29T19:43:11.509Z");
		const result = await p.complextTypes(date);
		date.setDate(date.getDate() + 1);
		expect(result.toDateString()).toBe(date.toDateString());
	});

	it("typed Arrays", async () => {
		const p = rpc<MyClass>(env.MyClass);
		const array = new Uint8Array(8);
		const r = await p.typedArray(array);
		expect(r).toStrictEqual(array.fill(9));
	});
});
