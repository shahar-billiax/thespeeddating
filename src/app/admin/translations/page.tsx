import { getTranslations } from "@/lib/admin/actions";
import { AdminPagination } from "@/components/admin/pagination";
import { TranslationsManager } from "@/components/admin/translations-manager";

export default async function AdminTranslationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const { translations, total, page, perPage } = await getTranslations({
    page: params.page ? Number(params.page) : 1,
    search: params.search,
    language: params.language,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Translations</h1>
      <TranslationsManager translations={translations} search={params.search} language={params.language} />
      <AdminPagination total={total} page={page} perPage={perPage} />
    </div>
  );
}
