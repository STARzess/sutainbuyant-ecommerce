export type PartKind =
  | "brake"
  | "oil"
  | "filter"
  | "shock"
  | "tire"
  | "battery"
  | "plug";

// homepage local
export const homeProducts: {
  id: string;
  name: string;
  category: string;
  label: string;
  price: number;
  kind: PartKind;
}[] = [
  {
    id: "brake-disc",
    name: "Урд тоормосны диск",
    category: "Тоормосны систем",
    label: "Toyota Prius",
    price: 120000,
    kind: "brake",
  },
  {
    id: "engine-oil",
    name: "Хөдөлгүүрийн тос 5W-30",
    category: "Тос, тосолгоо",
    label: "4 литр",
    price: 89000,
    kind: "oil",
  },
  {
    id: "air-filter",
    name: "Хөдөлгүүрийн агаар шүүгч",
    category: "Шүүлтүүр",
    label: "Toyota Corolla",
    price: 35000,
    kind: "filter",
  },
  {
    id: "shock-absorber",
    name: "Урд амортизатор",
    category: "Явах эд анги",
    label: "Nissan X-Trail",
    price: 185000,
    kind: "shock",
  },
  {
    id: "tire",
    name: "Автомашины дугуй",
    category: "Дугуй, обуд",
    label: "205 / 55 R16",
    price: 210000,
    kind: "tire",
  },
  {
    id: "battery",
    name: "Автомашины аккумулятор",
    category: "Цахилгаан",
    label: "12V · 60Ah",
    price: 245000,
    kind: "battery",
  },
  {
    id: "spark-plug",
    name: "Иридиум свеча",
    category: "Хөдөлгүүр",
    label: "Toyota / Lexus",
    price: 45000,
    kind: "plug",
  },
  {
    id: "oil-filter",
    name: "Хөдөлгүүрийн тосны шүүр",
    category: "Шүүлтүүр",
    label: "Toyota Prius",
    price: 18000,
    kind: "filter",
  },
];

export const homeCategories: {
  name: string;
  description: string;
  kind: PartKind;
}[] = [
  {
    name: "Хөдөлгүүр",
    description: "Свеча, хөдөлгүүрийн эд анги",
    kind: "plug",
  },
  {
    name: "Тоормосны систем",
    description: "Наклад, диск, тоормосны эд анги",
    kind: "brake",
  },
  {
    name: "Явах эд анги",
    description: "Амортизатор, тэнхлэгийн эд анги",
    kind: "shock",
  },
  {
    name: "Тос, тосолгоо",
    description: "Хөдөлгүүр, хурдны хайрцгийн тос",
    kind: "oil",
  },
  { name: "Шүүлтүүр", description: "Агаар, тос, түлшний шүүр", kind: "filter" },
  {
    name: "Дугуй, обуд",
    description: "Дугуй, обуд, дагалдах хэрэгсэл",
    kind: "tire",
  },
];

export function formatPrice(value: number) {
  return `${new Intl.NumberFormat("mn-MN").format(value)} ₮`;
}
