"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";
import { redirect } from "next/navigation";

const matchmakingApplicationSchema = z.object({
  about_yourself: z.string().min(50, "Please provide more details about yourself"),
  looking_for: z.string().min(50, "Please provide more details about what you're looking for"),
  age_range: z.string().min(3, "Please specify an age range"),
  preferred_areas: z.string().min(2, "Please specify preferred areas"),
});

export async function submitMatchmakingApplication(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const data = {
    about_yourself: formData.get("about_yourself") as string,
    looking_for: formData.get("looking_for") as string,
    age_range: formData.get("age_range") as string,
    preferred_areas: formData.get("preferred_areas") as string,
  };

  const validation = matchmakingApplicationSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const questionnaireData = validation.data;

  const { error } = await supabase.from("matchmaking_profiles").insert({
    user_id: user.id,
    questionnaire_data: questionnaireData,
    package_type: null,
    status: "pending_review",
    admin_notes: null,
  });

  if (error) {
    console.error("Matchmaking application error:", error);
    return {
      success: false,
      error: "Failed to submit application. Please try again.",
    };
  }

  return { success: true };
}
