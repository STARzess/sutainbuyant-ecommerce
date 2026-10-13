import { test } from "vitest";
import assert from "node:assert/strict";
import { createAuthApiClient, mapSessionUser } from "../../src/lib/auth-api-client.ts";
import { validateAuthValues, authFieldErrors, safeReturnTo } from "../../src/lib/auth-validation.ts";
import { verifyMutationOrigin, readJsonBody, sessionCookieOptions } from "../../src/lib/request-security.ts";

const base = "https://api.example/api/v1";
const user = { id: 1, name: "Бат", email: "bat@example.test", is_admin: true, private_data: "never send" };
const credentials = { email: "bat@example.test", password: " abc123 ", name: "Бат", password_confirmation: " abc123 " };
test("login and registration use the documented endpoints and responses", async () => {
  const requests = [];
  const client = createAuthApiClient(base, async (url, options) => {
    requests.push({ url: String(url), options });
    return Response.json({ token: "1|test-only-token", token_type: "Bearer", user }, { status: requests.length === 1 ? 200 : 201 });
  });
  for (const mode of ["login", "register"]) {
    const result = await client.authenticate(mode, credentials);
    assert.equal(requests.at(-1).url, `${base}/${mode}`);
    assert.equal(requests.at(-1).options.method, "POST");
    assert.deepEqual(result.user, { id: "1", name: "Бат", email: "bat@example.test" });
  }
});
test("malformed auth success responses never become a usable session", async () => {
  for (const body of [{ user }, { user, token: "a\nb", token_type: "Bearer" }, { user, token: "abc", token_type: "Basic" }, { user: { ...user, id: -1 }, token: "abc", token_type: "Bearer" }]) {
    await assert.rejects(createAuthApiClient(base, async () => Response.json(body)).authenticate("login", credentials), { status: 502 });
  }
});
test("profile verifies the bearer token and exposes only the safe user fields", async () => {
  const client = createAuthApiClient(base, async (url, options) => {
    assert.equal(String(url), `${base}/shop/profile`);
    assert.equal(options.headers.Authorization, "Bearer 1|test-only");
    assert.equal(options.cache, "no-store");
    return Response.json({ data: user });
  });
  assert.deepEqual(await client.getUser("1|test-only"), { id: "1", name: "Бат", email: "bat@example.test" });
  assert.deepEqual(mapSessionUser({ id: 2, name: null, email: null }), { id: "2", name: "Хэрэглэгч", email: "" });
});
test("expired logout is idempotent; failed token revocation remains an error", async () => {
  for (const status of [200, 401, 503]) {
    const client = createAuthApiClient(base, async (url, options) => {
      assert.equal(String(url), `${base}/logout`);
      assert.equal(options.method, "POST");
      return Response.json({}, { status });
    });
    if (status === 503) await assert.rejects(client.logout("1|test-only"), { status: 503 });
    else await client.logout("1|test-only");
  }
});
test("validation trims name/email, preserves password bytes, and discards extra input", () => {
  const result = validateAuthValues("register", { ...credentials, name: " Бат ", email: " bat@example.test ", is_admin: true, token: "injected" });
  assert.equal(result.valid, true);
  assert.equal(result.values.name, "Бат");
  assert.equal(result.values.password, " abc123 ");
  assert.equal(result.values.token, undefined);
  assert.equal(result.values.is_admin, undefined);
  assert.deepEqual(Object.keys(validateAuthValues("login", credentials).values), ["email", "password"]);
});
test("empty forms and mismatched passwords have field-level errors", () => {
  assert.deepEqual(Object.keys(validateAuthValues("register", {}).errors).sort(), ["email", "name", "password", "password_confirmation"]);
  assert.ok(validateAuthValues("register", { ...credentials, password_confirmation: "different" }).errors.password_confirmation);
  assert.ok(validateAuthValues("login", { email: "invalid", password: "short" }).errors.email);
});
test("API validation errors become Mongolian without echoing passwords or internal fields", () => {
  const errors = authFieldErrors("register", { email: ["Email bat@example.test is already taken"], password: ["secret password abc"], internal: ["private"] });
  assert.equal(errors.email[0], "Энэ имэйл хаяг бүртгэлтэй байна.");
  assert.equal(JSON.stringify(errors).includes("secret"), false);
  assert.equal(errors.internal, undefined);
});
test("return URLs retain local filters while rejecting open redirects", () => {
  assert.equal(safeReturnTo("/products?q=цай&sort=newest"), "/products?q=%D1%86%D0%B0%D0%B9&sort=newest");
  for (const input of ["//evil.example", "https://evil.example", "/\\evil.example", "/login?next=/login", "/api/auth/logout", "/\n/evil", ["/cart"], "/products/../../evil"]) assert.equal(safeReturnTo(input), "/account");
  assert.equal(safeReturnTo("/cart"), "/cart");
});
test("mutation origin rejects CSRF, missing Origin, and cross-site requests", () => {
  const make = (headers) => new Request("https://store.example/api/auth/login", { method: "POST", headers });
  verifyMutationOrigin(make({ Origin: "https://store.example", "Sec-Fetch-Site": "same-origin" }));
  for (const headers of [{}, { Origin: "https://evil.example" }, { Origin: "null" }, { Origin: "https://store.example", "Sec-Fetch-Site": "cross-site" }]) assert.throws(() => verifyMutationOrigin(make(headers)), { status: 403 });
  verifyMutationOrigin(new Request("http://localhost:3101/api/auth/login", { headers: { Host: "127.0.0.1:3101", Origin: "http://127.0.0.1:3101" } }));
  assert.throws(() => verifyMutationOrigin(make({ Host: "store.example", Origin: "https://evil.example", "X-Forwarded-Host": "evil.example" })), { status: 403 });
});
test("session cookie is HttpOnly, host-scoped, and Secure outside local HTTP preview", () => {
  const options = sessionCookieOptions(new Request("https://store.example/api/auth/login"));
  assert.equal(options.httpOnly, true);
  assert.equal(options.secure, true);
  assert.equal(options.sameSite, "lax");
  assert.equal(options.path, "/");
  assert.equal(options.domain, undefined);
  assert.equal(sessionCookieOptions(new Request("http://127.0.0.1:3100/api/auth/login")).secure, false);
  assert.throws(() => sessionCookieOptions(new Request("http://store.example/api/auth/login")), { status: 400 });
});
test("body reader rejects wrong types, broken JSON, and oversized payloads", async () => {
  const make = (body, type = "application/json") => new Request("https://store.example/api/auth/login", { method: "POST", headers: { "Content-Type": type }, body });
  assert.deepEqual(await readJsonBody(make('{"name":"Бат"}')), { name: "Бат" });
  await assert.rejects(readJsonBody(make("{}", "text/plain")), { status: 415 });
  await assert.rejects(readJsonBody(make("{")), { status: 400 });
  await assert.rejects(readJsonBody(make("x".repeat(17000))), { status: 413 });
});
