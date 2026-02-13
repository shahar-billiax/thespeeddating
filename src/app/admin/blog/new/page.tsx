import { BlogPostForm } from "@/components/admin/blog-form";

export default async function NewBlogPostPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">New Blog Post</h1>
      <BlogPostForm />
    </div>
  );
}
