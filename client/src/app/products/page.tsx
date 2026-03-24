import ProductsPageClient from "@/components/pages/ProductsPageClient";
import { fetchProducts } from "@/lib/api/products";

export const revalidate = 30;

type ProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const keywordParam = resolvedSearchParams.keyword;
  const keyword =
    typeof keywordParam === "string"
      ? keywordParam
      : Array.isArray(keywordParam)
        ? keywordParam[0] || ""
        : "";

  const initialData = await fetchProducts(
    {
      keyword,
      pageNumber: 1,
      pageSize: 9,
      sort: "newest",
    },
    { next: { revalidate } },
  ).catch(() => undefined);

  return (
    <ProductsPageClient
      initialKeyword={keyword}
      initialData={initialData}
    />
  );
}
