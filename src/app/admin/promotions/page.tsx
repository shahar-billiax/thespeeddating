import { getPromotions, getCountries } from "@/lib/admin/actions";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { AdminPagination } from "@/components/admin/pagination";
import { PromotionDialog } from "@/components/admin/promotion-dialog";

export default async function AdminPromotionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const [{ promotions, total, page, perPage }, countries] = await Promise.all([
    getPromotions({ page: params.page ? Number(params.page) : 1 }),
    getCountries(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Promotion Codes</h1>
        <PromotionDialog countries={countries} />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Valid</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No promotion codes
                </TableCell>
              </TableRow>
            ) : (
              promotions.map((promo: any) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-mono font-medium">{promo.code}</TableCell>
                  <TableCell>{promo.is_percentage ? "Percentage" : "Fixed"}</TableCell>
                  <TableCell>
                    {promo.is_percentage ? `${promo.value}%` : promo.value}
                  </TableCell>
                  <TableCell className="text-sm">
                    {promo.valid_from ?? "—"} → {promo.valid_until ?? "—"}
                  </TableCell>
                  <TableCell>
                    {promo.times_used}{promo.max_uses ? `/${promo.max_uses}` : ""}
                  </TableCell>
                  <TableCell>
                    <Badge variant={promo.is_active ? "default" : "secondary"}>
                      {promo.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AdminPagination total={total} page={page} perPage={perPage} />
    </div>
  );
}
