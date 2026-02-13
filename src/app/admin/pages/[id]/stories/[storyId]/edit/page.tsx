import { notFound } from "next/navigation";
import { getSuccessStoryById } from "@/lib/admin/actions";
import { SuccessStoryForm } from "@/components/admin/success-story-form";

export default async function EditStoryForPagePage({
  params,
}: {
  params: Promise<{ id: string; storyId: string }>;
}) {
  // id param is actually the page_key (e.g. "success-stories")
  const { id: pageKey, storyId } = await params;
  const story = await getSuccessStoryById(Number(storyId));

  if (!story) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">
        Edit Testimony: {story.couple_names}
      </h1>
      <SuccessStoryForm
        story={story}
        returnTo={`/admin/pages/${pageKey}/edit`}
      />
    </div>
  );
}
