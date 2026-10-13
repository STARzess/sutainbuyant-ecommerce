import { test } from "vitest";
import assert from "node:assert/strict";
import { validateProfileValues, validatePasswordValues, profileFieldErrors } from "../../src/lib/profile-validation.ts";
import { createAuthApiClient } from "../../src/lib/auth-api-client.ts";
const base = "https://api.example/api/v1";

test("profile updates normalize contact fields and drop forged identity or role", () => {
  const result = validateProfileValues({ name: "  Бат  ", email: " bat@example.com ", id: 42, role: "admin", token: "private" });
  assert.equal(result.valid, true);
  assert.deepEqual(result.values, { name: "Бат", email: "bat@example.com" });
});
test("profile validation rejects empty, malformed and oversized contact fields", () => {
  for (const input of [null, [], { name: " ", email: "broken" }, { name: "x".repeat(256), email: "x".repeat(256) + "@test.com" }, { name: 5, email: {} }]) {
    const result = validateProfileValues(input);
    assert.equal(result.valid, false);
    assert.deepEqual(Object.keys(result.errors), ["name", "email"]);
  }
});
test("password validation preserves literal spaces and drops token or identity fields", () => {
  const result = validatePasswordValues({ current_password: "old ", password: " new pw ", password_confirmation: " new pw ", token: "private", id: 5 });
  assert.equal(result.valid, true);
  assert.deepEqual(result.values, { current_password: "old ", password: " new pw ", password_confirmation: " new pw " });
});
test("password validation catches missing, short, oversized and mismatched values", () => {
  assert.deepEqual(Object.keys(validatePasswordValues({}).errors), ["current_password", "password", "password_confirmation"]);
  assert.equal(validatePasswordValues({ current_password: "old", password: "12345", password_confirmation: "12345" }).valid, false);
  assert.ok(validatePasswordValues({ current_password: "old", password: "123456", password_confirmation: "654321" }).errors.password_confirmation);
  assert.ok(validatePasswordValues({ current_password: "x".repeat(1025), password: "x".repeat(1025), password_confirmation: "x".repeat(1025) }).errors.current_password);
});
test("upstream field errors become known Mongolian messages without private contents", () => {
  const errors = { email: ["already taken: secret-email"], current_password: ["wrong secret-pass"], password: ["secret-pass"], token: ["secret-token"] };
  assert.deepEqual(profileFieldErrors("details", errors), { email: ["Энэ имэйл хаяг бүртгэлтэй байна."] });
  const translated = profileFieldErrors("password", errors);
  assert.deepEqual(Object.keys(translated), ["current_password", "password"]);
  assert.equal(JSON.stringify(translated).includes("secret"), false);
});
test("profile PUT uses uncached bearer auth, strips forged fields and returns only session user", async () => {
  const api = createAuthApiClient(base, async (url, options) => {
    assert.equal(String(url), `${base}/shop/profile`);
    assert.equal(options.method, "PUT");
    assert.equal(options.cache, "no-store");
    assert.equal(options.headers.Authorization, "Bearer qa-only");
    assert.deepEqual(JSON.parse(options.body), { name: "Бат", email: "bat@example.com" });
    return Response.json({ data: { id: 1, name: "Бат", email: "bat@example.com", token: "private", password: "private", created_at: "private" } });
  });
  assert.deepEqual(await api.updateProfile("qa-only", { name: "Бат", email: "bat@example.com", id: 9, role: "admin" }), { id: "1", name: "Бат", email: "bat@example.com" });
});
test("password PUT sends the three required fields and exposes no upstream message", async () => {
  const values = { current_password: "old-pw", password: "new-pw", password_confirmation: "new-pw" };
  const api = createAuthApiClient(base, async (url, options) => {
    assert.equal(String(url), `${base}/shop/profile/password`);
    assert.equal(options.method, "PUT");
    assert.equal(options.headers.Authorization, "Bearer qa-only");
    assert.deepEqual(JSON.parse(options.body), values);
    return Response.json({ message: "private message", token: "private" });
  });
  assert.equal(await api.changePassword("qa-only", { ...values, id: 9, token: "injected" }), undefined);
});
test("malformed success and expired/invalid backend responses remain errors", async () => {
  const values = { current_password: "old-pw", password: "new-pw", password_confirmation: "new-pw" };
  await assert.rejects(createAuthApiClient(base, async () => Response.json({ data: { id: 1 } })).updateProfile("qa", { name: "Бат", email: "bat@example.com" }), { status: 502 });
  await assert.rejects(createAuthApiClient(base, async () => Response.json({})).changePassword("qa", values), { status: 502 });
  for (const status of [401, 422, 503]) await assert.rejects(createAuthApiClient(base, async () => Response.json({ errors: { current_password: ["private"] } }, { status })).changePassword("qa", values), { status });
});
