import { createServer } from "node:http";
const origin = "http://127.0.0.1:4325";
let sequence, accounts, sessions, orders, flags, counters, writes;
function reset() {
  sequence = 0; flags = { emptyHome: process.env.QA_EMPTY_CATALOG === "1" }; counters = { profile: 0, password: 0, order: 0, cancel: 0 }; writes = [];
  accounts = new Map([[1, { id: 1, name: "Бат", email: "bat@example.test", password: "qa-password" }], [2, { id: 2, name: "Сараа", email: "other@example.test", password: "qa-password" }]]);
  sessions = new Map(); orders = new Map();
  for (const [id, status, owner] of [[101, "pending", 1], [102, "paid", 1], [103, "completed", 1], [900, "pending", 2]]) orders.set(String(id), order(id, status, owner, { customer_name: owner === 1 ? "Бат" : "Сараа", customer_phone: "99112233", shipping_address: "PRIVATE-DELIVERY", note: null, items: [{ product_id: 24, quantity: 2 }] }));
}
const categories = [{ id: 1, name: "Хувцас", description: "Өдөр тутмын хувцас", products_count: 8 }, { id: 2, name: "Гоо сайхан", description: "Арчилгааны бүтээгдэхүүн", products_count: 8 }, { id: 3, name: "Гэр ахуй", description: "Гэр ахуйн бүтээгдэхүүн", products_count: 8 }];
const tags = [{ id: 1, name: "Шинэ" }, { id: 2, name: "Хямдралтай" }];
const products = Array.from({ length: 24 }, (_, index) => ({ id: index + 1, name: `Бүтээгдэхүүн ${index + 1}`, price: (index + 1) * 1000, description: `Бүтээгдэхүүн ${index + 1} дэлгэрэнгүй тайлбар.`, sku: `SKU-${index + 1}`, created_at: `2026-09-${String(index + 1).padStart(2, "0")}T00:00:00Z`, categories: [categories[index % 3]], tags: [tags[index % 2]], image: null }));
function order(id, status, owner, input) {
  const items = input.items.map((item, index) => { const product = products.find(product => product.id === item.product_id); return { id: id * 10 + index + 1, product_id: product.id, product_name: product.name, image: null, quantity: item.quantity, unit_price: product.price, line_total: product.price * item.quantity }; });
  return { id, owner, number: `ORD-${id}`, status, created_at: `2026-10-12T04:${String(id % 60).padStart(2, "0")}:00Z`, customer_name: input.customer_name, customer_phone: input.customer_phone, shipping_address: input.shipping_address, note: input.note, items, items_count: items.length, total: items.reduce((sum, item) => sum + item.line_total, 0) };
}
function orderSummary(record) { return Object.fromEntries(Object.entries(record).filter(([name]) => name !== "items")); }
reset();
export function startMockApi(port = 4325) {
  const server = createServer(async (req, res) => {
    res.setHeader("Content-Type", "application/json"); res.setHeader("Cache-Control", "no-store");
    const send = (status, body) => { res.statusCode = status; res.end(JSON.stringify(body)); };
    const json = async () => { let raw = ""; for await (const chunk of req) raw += chunk; return raw ? JSON.parse(raw) : {}; };
    const url = new URL(req.url, origin); const route = url.pathname.replace(/^\/api\/v1\//, "");
    if (url.pathname === "/__qa__/reset") { reset(); return send(200, {}); }
    if (url.pathname === "/__qa__/flags") { Object.assign(flags, await json()); return send(200, {}); }
    if (url.pathname === "/__qa__/state") return send(200, { counters, writes, orders: [...orders.values()].map(orderSummary) });
    const token = req.headers.authorization?.replace("Bearer ", ""); const user = accounts.get(sessions.get(token));
    const safeUser = user => ({ id: user.id, name: user.name, email: user.email, created_at: null });
    if (route === "login" || route === "register") {
      const values = await json(); if (flags.authFailure) return send(flags.authFailure, { message: "PRIVATE-ERROR" });
      let account = [...accounts.values()].find(account => account.email === values.email);
      if (route === "register") {
        if (account) return send(422, { errors: { email: ["already taken PRIVATE-ERROR"] } });
        account = { id: accounts.size + 1, name: values.name, email: values.email, password: values.password }; accounts.set(account.id, account);
      } else if (!account || account.password !== values.password) return send(422, { errors: { email: ["PRIVATE-ERROR"] } });
      const token = `qa-session-${++sequence}`; sessions.set(token, account.id); return send(200, { token, token_type: "Bearer", user: safeUser(account) });
    }
    if (route === "shop/categories") return send(200, { data: flags.emptyHome ? [] : categories });
    if (route === "shop/tags") return send(200, { data: tags });
    if (route === "shop/products") {
      const q = url.searchParams; let result = flags.emptyHome ? [] : products.filter(product => (!q.get("search") || product.name.includes(q.get("search"))) && (!q.get("category_id") || product.categories[0].id === Number(q.get("category_id"))) && (!q.get("tag_id") || product.tags[0].id === Number(q.get("tag_id"))) && (!q.has("min_price") || product.price >= Number(q.get("min_price"))) && (!q.has("max_price") || product.price <= Number(q.get("max_price"))));
      result.sort((a, b) => q.get("sort") === "price_asc" ? a.price - b.price : q.get("sort") === "price_desc" ? b.price - a.price : q.get("sort") === "name" ? a.name.localeCompare(b.name) : b.id - a.id);
      const total = result.length; const perPage = Math.min(50, Number(q.get("per_page")) || 9); const last = Math.max(1, Math.ceil(total / perPage)); const page = Math.min(last, Math.max(1, Number(q.get("page")) || 1)); const start = (page - 1) * perPage; result = result.slice(start, start + perPage);
      return send(200, { data: result, meta: { total, last_page: last, current_page: page, from: total ? start + 1 : null, to: total ? start + result.length : null } });
    }
    const productMatch = route.match(/^shop\/products\/(\d+)$/);
    if (productMatch) { if (flags.productFailure) return send(503, { message: "PRIVATE-ERROR" }); const product = products.find(product => product.id === Number(productMatch[1])); return product ? send(200, { data: product, related: products.filter(item => item.id !== product.id).slice(0, 4) }) : send(404, {}); }
    if (!user) return send(401, {});
    if (route === "shop/profile" && req.method === "GET") return flags.profileReadFailure ? send(503, { message: "PRIVATE-ERROR" }) : send(200, { data: safeUser(user) });
    if (route === "shop/profile" && req.method === "PUT") {
      const values = await json(); counters.profile++; writes.push({ operation: "profile", fields: Object.keys(values), userId: user.id }); await new Promise(resolve => setTimeout(resolve, 650));
      if (flags.profileWriteFailure) return send(503, { message: "PRIVATE-ERROR" });
      if ([...accounts.values()].some(account => account.id !== user.id && account.email === values.email)) return send(422, { errors: { email: ["already taken PRIVATE-ERROR"] } });
      user.name = values.name; user.email = values.email; return send(200, { data: { ...safeUser(user), token: "PRIVATE-TOKEN" } });
    }
    if (route === "shop/profile/password") {
      const values = await json(); counters.password++; await new Promise(resolve => setTimeout(resolve, 350));
      if (values.current_password !== user.password) return send(422, { errors: { current_password: ["PRIVATE-ERROR"] } });
      user.password = values.password; for (const [key, id] of sessions) if (id === user.id && key !== token) sessions.delete(key); return send(200, { message: "PRIVATE-MESSAGE" });
    }
    if (route === "logout") { if (flags.logoutFailure) return send(503, {}); sessions.delete(token); return send(200, {}); }
    if (route === "shop/orders" && req.method === "GET") return send(200, { data: [...orders.values()].filter(order => order.owner === user.id).map(orderSummary) });
    if (route === "shop/orders" && req.method === "POST") {
      const values = await json(); counters.order++; writes.push({ operation: "order", fields: Object.keys(values), itemFields: Object.keys(values.items[0] || {}), userId: user.id }); await new Promise(resolve => setTimeout(resolve, 500));
      if (flags.checkoutInvalid) return send(422, { errors: { customer_phone: ["PRIVATE-ERROR"], "items.0.product_id": ["PRIVATE-ERROR"] } });
      if (flags.checkoutFailure) return send(503, {});
      const next = order(200 + counters.order, "pending", user.id, values); orders.set(String(next.id), next); return send(201, { data: next });
    }
    const orderMatch = route.match(/^shop\/orders\/(\d+)(\/cancel)?$/);
    if (orderMatch) {
      const record = orders.get(orderMatch[1]); if (!record) return send(404, {}); if (record.owner !== user.id) return send(403, {});
      if (orderMatch[2]) { if (record.status !== "pending") return send(403, {}); counters.cancel++; await new Promise(resolve => setTimeout(resolve, 400)); if (flags.cancelFailure) return send(503, {}); record.status = "cancelled"; }
      return send(200, { data: record });
    }
    return send(404, {});
  });
  server.listen(port, "127.0.0.1"); return server;
}
