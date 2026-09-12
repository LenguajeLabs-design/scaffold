import assert from "node:assert/strict";
import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";

const temporary = await mkdtemp(path.resolve(".access-test-"));
try {
  await build({
    stdin: { contents: 'export { isValidCode } from "./src/lib/access-codes";', resolveDir: process.cwd(), loader: "ts" },
    outfile: path.join(temporary, "access.mjs"), bundle: true,
    platform: "node", format: "esm", packages: "external",
  });
  process.env.VALID_ACCESS_CODES = "SUZHOU, TEST-ONLY-CODE";
  const { isValidCode } = await import(pathToFileURL(path.join(temporary, "access.mjs")));
  for (const accessCode of [undefined, "", "wrong", 123, {}, ["SUZHOU"]]) {
    assert.equal(isValidCode(accessCode), false);
  }
  assert.equal(isValidCode(" suzhou "), true);
  assert.equal(isValidCode("test-only-code"), true);
  assert.equal(isValidCode("x".repeat(129)), false);
  console.log("PASS: server-only beta-code normalization and validation");
} finally {
  await rm(temporary, { recursive: true, force: true });
}
