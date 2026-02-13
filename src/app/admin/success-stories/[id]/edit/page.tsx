import { notFound } from "next/navigation";
import { getSuccessStoryById } from "@/lib/admin/actions";
import { SuccessStoryForm } from "@/components/admin/success-story-form";

export default async function EditSuccessStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = await getSuccessStoryById(Number(id));

  if (!story) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">
        Edit Story: {story.couple_names}
      </h1>
      <SuccessStoryForm story={story} />
    </div>
  );
}
