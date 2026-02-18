"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const EDUCATION_LEVEL_MAP: Record<string, number> = {
  high_school: 1,
  some_college: 2,
  bachelors: 3,
  masters: 4,
  doctorate: 5,
};

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional().nullable(),
  last_name: z.string().min(1, "Last name is required"),
  bio: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  education: z.enum(["high_school", "some_college", "bachelors", "masters", "doctorate"]).optional().nullable().catch(null),
  relationship_status: z.enum(["single", "divorced", "widowed", "separated"]).optional().nullable().catch(null),
  has_children: z.boolean().optional().nullable(),
  faith: z.enum([
    "Jewish - Orthodox",
    "Jewish - Conservative",
    "Jewish - Reform",
    "Jewish - Traditional",
    "Jewish - Secular",
    "Christian",
    "Muslim",
    "Buddhist",
    "Hindu",
    "Spiritual",
    "Not religious",
    "Other",
  ]).optional().nullable().catch(null),
  height_cm: z.coerce.number().positive().optional().nullable(),
  country_id: z.coerce.number().positive().optional().nullable(),
  city_id: z.coerce.number().positive().optional().nullable(),
  phone: z.string().optional().nullable(),
  home_phone: z.string().optional().nullable(),
  mobile_phone: z.string().optional().nullable(),
  work_phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  sexual_preference: z.enum(["men", "women", "both"]).optional().nullable().catch(null),
  subscribed_email: z.boolean().optional(),
  subscribed_phone: z.boolean().optional(),
  subscribed_sms: z.boolean().optional(),
});

const passwordSchema = z.object({
  new_password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const hasChildrenVal = formData.get("has_children") as string;
  const rawData = {
    first_name: formData.get("first_name"),
    middle_name: formData.get("middle_name") || null,
    last_name: formData.get("last_name"),
    bio: formData.get("bio") || null,
    occupation: formData.get("occupation") || null,
    education: formData.get("education") || null,
    relationship_status: formData.get("relationship_status") || null,
    has_children: hasChildrenVal === "true" ? true : hasChildrenVal === "false" ? false : null,
    faith: formData.get("faith") || null,
    height_cm: formData.get("height_cm") ? Number(formData.get("height_cm")) : null,
    country_id: formData.get("country_id") ? Number(formData.get("country_id")) : null,
    city_id: formData.get("city_id") ? Number(formData.get("city_id")) : null,
    phone: formData.get("phone") || null,
    home_phone: formData.get("home_phone") || null,
    mobile_phone: formData.get("mobile_phone") || null,
    work_phone: formData.get("work_phone") || null,
    whatsapp: formData.get("whatsapp") || null,
    instagram: formData.get("instagram") || null,
    facebook: formData.get("facebook") || null,
    sexual_preference: formData.get("sexual_preference") || null,
    subscribed_email: formData.get("subscribed_email") === "true",
    subscribed_phone: formData.get("subscribed_phone") === "true",
    subscribed_sms: formData.get("subscribed_sms") === "true",
  };

  const result = profileSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  // Sync education_level (compatibility column) when education changes
  const updateData: Record<string, unknown> = { ...result.data };
  if (result.data.education && EDUCATION_LEVEL_MAP[result.data.education]) {
    updateData.education_level = EDUCATION_LEVEL_MAP[result.data.education];
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData as any)
    .eq("id", user.id);

  if (error) {
    return {
      success: false,
      error: "Failed to update profile",
    };
  }

  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const rawData = {
    new_password: formData.get("new_password"),
    confirm_password: formData.get("confirm_password"),
  };

  const result = passwordSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: result.data.new_password,
  });

  if (error) {
    return {
      success: false,
      error: "Failed to update password",
    };
  }

  return { success: true };
}

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Anonymize match scores (keep for statistical integrity)
  await supabase
    .from("match_scores")
    .update({ scorer_id: null } as any)
    .eq("scorer_id", user.id);

  // Anonymize match results
  await supabase
    .from("match_results")
    .update({ user_a_id: null } as any)
    .eq("user_a_id", user.id);

  await supabase
    .from("match_results")
    .update({ user_b_id: null } as any)
    .eq("user_b_id", user.id);

  // Delete profile (cascades to registrations via FK)
  await supabase
    .from("profiles")
    .delete()
    .eq("id", user.id);

  // Delete auth user via admin client
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const adminClient = createAdminClient();
  await adminClient.auth.admin.deleteUser(user.id);

  redirect("/");
}
