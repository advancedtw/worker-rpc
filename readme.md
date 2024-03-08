# worker-rpc

---

improve the DX of using cloudflare durable objects and service workers.

## supported method parameters

- [x] number, string, arrays
- [x] Typed Arrays
- [x] Date

## setup for durable object

### install worker-rpc

```bash
pnpm install worker-rpc
```

### write your class and extend WorkerRPC

WorkerRPC already implements DurableObject thus taking care of initializing the state and optional bindings.

```ts
// myclass.ts
import {PersistentWorker} from "worker-rpc"

export MyClass extends PersistentWorker{

    // when called the method will be async
    // to get the correct type it is recommended to also
    // mark it as async even tough no async call is being made by someMethod()
    someMethod = async(arg1:number,arg2:string) => {
        return arg2.length * arg1
    }

    useStorage = async (data: number) => {
        await this.storage.put("user-count", data);
	};

}

```

### use it in your worker

in this example we are using hono but you can use whatever works for you.

```ts
import { rpc } from "worker-rpc";
import {Hono} from "hono"

// required by cloudflare
export {MyClass} from "myclass"

// tip: use `wrangler types` to generate your Env
interface Env = {
  MyClass: DurableObjectNamespace
}

const app = new Hono<{ Bindings: Env }>()

app.get("/",async(c)=>{
    const obj = rpc<MyClass>(c.env.MyClass,"optional name")
    const result = await obj.someMethod(10,"hello")
    return c.text(`yeah rpc: ${result}`)
})

export default app
```
