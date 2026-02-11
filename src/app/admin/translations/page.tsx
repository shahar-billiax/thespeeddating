import { getTranslationsPaired } from "@/lib/admin/actions";
import { AdminPagination } from "@/components/admin/pagination";
import { TranslationsManager } from "@/components/admin/translations-manager";

export default async function AdminTranslationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const { pairs, total, page, perPage } = await getTranslationsPaired({
    page: params.page ? Number(params.page) : 1,
    search: params.search,
    namespace: params.namespace,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Translations</h1>
      <TranslationsManager
        pairs={pairs}
        search={params.search}
        namespace={params.namespace}
      />
      <AdminPagination total={total} page={page} perPage={perPage} />
    </div>
  );
}
