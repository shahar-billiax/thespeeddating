import { PageForm } from "@/components/admin/page-form";

export default async function NewPagePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Create New Page</h1>
      <PageForm />
    </div>
  );
}
