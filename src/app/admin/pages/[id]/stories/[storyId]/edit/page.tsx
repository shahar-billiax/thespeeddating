import { notFound } from "next/navigation";
import { getSuccessStoryById, getCountries } from "@/lib/admin/actions";
import { SuccessStoryForm } from "@/components/admin/success-story-form";

export default async function EditStoryForPagePage({
  params,
}: {
  params: Promise<{ id: string; storyId: string }>;
}) {
  const { id, storyId } = await params;
  const [story, countries] = await Promise.all([
    getSuccessStoryById(Number(storyId)),
    getCountries(),
  ]);

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
        countries={countries}
        returnTo={`/admin/pages/${id}/edit`}
      />
    </div>
  );
}
