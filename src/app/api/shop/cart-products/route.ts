import { getCartProducts } from "@/lib/shop-api";

export async function GET(request: Request) {
  const value = new URL(request.url).searchParams.get("ids") ?? "";
  const ids = [...new Set(value.split(",").filter(Boolean))];
  if (value.length > 1000 || ids.length > 50 || ids.some((id) => !/^[1-9]\d{0,14}$/.test(id))) {
    return Response.json({ message: "Бүтээгдэхүүний код буруу байна." }, { status: 400 });
  }
  try {
    const data = await getCartProducts(ids);
    return Response.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ message: "Бүтээгдэхүүний мэдээллийг ачаалж чадсангүй." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
