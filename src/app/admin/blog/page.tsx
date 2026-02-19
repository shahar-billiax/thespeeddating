import Link from "next/link";
import { getBlogPosts } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { BlogPostsTable } from "@/components/admin/blog-posts-table";
import { Plus } from "lucide-react";

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const { posts, total, page, perPage } = await getBlogPosts({
    page:      params.page      ? Number(params.page) : 1,
    language:  params.language,
    published: params.published,
    q:         params.q,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Link>
        </Button>
      </div>

      <BlogPostsTable posts={posts} total={total} page={page} perPage={perPage} />
    </div>
  );
}
