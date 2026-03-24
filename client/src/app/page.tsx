import HomePageClient from "@/components/pages/HomePageClient";
import { fetchProducts } from "@/lib/api/products";

export const revalidate = 30;

export default async function HomePage() {
  const data = await fetchProducts(
    { pageNumber: 1, pageSize: 8 },
    { next: { revalidate } },
  ).catch(() => undefined);

  return <HomePageClient initialProducts={data?.products} />;
}
