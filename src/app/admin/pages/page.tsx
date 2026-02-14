import Link from "next/link";
import { getAllGroupedPages } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PagesTable } from "@/components/admin/pages-table";

export default async function AdminPagesPage() {
  const pages = await getAllGroupedPages();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Pages</h1>
        <Button asChild>
          <Link href="/admin/pages/new">
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Link>
        </Button>
      </div>

      <PagesTable pages={pages} />
    </div>
  );
}
