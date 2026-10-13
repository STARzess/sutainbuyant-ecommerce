export function siteUrl() {
  const url = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3100");
  if (!/^https?:$/.test(url.protocol) || url.username || url.password) throw new Error("Invalid site URL configuration");
  return new URL(url.origin);
}
