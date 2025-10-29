import alchemy from "alchemy";
import { launch } from "stremio-rewired";
import { Worker } from "alchemy/cloudflare";
import { CloudflareStateStore } from "alchemy/state";

const app = await alchemy("unity", {
  stateStore: (scope) => new CloudflareStateStore(scope),
});

await Worker("worker", {
  entrypoint: "./src/worker.ts",
});

await app.finalize();

if (!process.env.CI) {
  await launch(1337);
}
