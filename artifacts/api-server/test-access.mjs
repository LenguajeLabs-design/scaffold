import assert from "node:assert/strict";
import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";
import express from "express";

const temporary = await mkdtemp(path.resolve(".access-test-"));
let server;
try {
  await build({
    stdin: { contents: 'export { default as router } from "./src/routes/access"; export { remainingToday } from "./src/lib/access-codes";', resolveDir: process.cwd(), loader: "ts" },
    outfile: path.join(temporary, "routes.mjs"), bundle: true,
    platform: "node", format: "esm", packages: "external",
  });
  process.env.VALID_ACCESS_CODES = "TEST-ONLY-CODE";
  const { router, remainingToday } = await import(pathToFileURL(path.join(temporary, "routes.mjs")));
  const app = express();
  app.use(express.json());
  app.use("/api", router);
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => { server.once("listening", resolve); server.once("error", reject); });
  const endpoint = `http://127.0.0.1:${server.address().port}/api/access/validate`;
  const validate = body => fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  for (const accessCode of [undefined, "", "wrong", 123, {}, ["TEST-ONLY-CODE"]]) {
    assert.equal((await validate({ accessCode })).status, 401);
  }
  for (let attempt = 0; attempt < 7; attempt++) {
    const result = await validate({ accessCode: " test-only-code " });
    assert.equal(result.status, 200);
    assert.deepEqual(await result.json(), { valid: true });
    assert.equal(result.headers.get("cache-control"), "no-store");
  }
  assert.equal(remainingToday("TEST-ONLY-CODE", "lesson-plan"), 5);
  assert.equal(remainingToday("TEST-ONLY-CODE", "classroom-copilot"), 5);
  process.env.VALID_ACCESS_CODES = "";
  assert.equal((await validate({ accessCode: "TEST-ONLY-CODE" })).status, 401);
  console.log("PASS: valid/invalid codes, normalization, missing configuration, no quota consumed, no OpenAI required");
} finally {
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(temporary, { recursive: true, force: true });
}
