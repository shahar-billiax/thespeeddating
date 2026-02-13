import { notFound } from "next/navigation";
import { getBlogPost } from "@/lib/admin/actions";
import { BlogPostForm } from "@/components/admin/blog-form";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let post;
  try {
    post = await getBlogPost(Number(id));
  } catch {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Edit Blog Post</h1>
      <BlogPostForm post={post} />
    </div>
  );
}
