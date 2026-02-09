"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  bio: z.string().optional(),
  occupation: z.string().optional(),
  education: z.string().optional(),
  relationship_status: z.enum(["single", "divorced", "widowed", "separated"]).optional(),
  has_children: z.boolean().optional(),
  faith: z.enum([
    "secular",
    "conservative",
    "orthodox",
    "traditional",
    "reform",
    "liberal",
    "modern_orthodox",
    "atheist",
  ]).optional(),
  height_cm: z.coerce.number().positive().optional(),
  country_id: z.coerce.number().positive().optional().nullable(),
  city_id: z.coerce.number().positive().optional().nullable(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  sexual_preference: z.enum(["men", "women", "both"]).optional(),
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

  const rawData = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    bio: formData.get("bio") || null,
    occupation: formData.get("occupation") || null,
    education: formData.get("education") || null,
    relationship_status: formData.get("relationship_status") || null,
    has_children: formData.get("has_children") === "true",
    faith: formData.get("faith") || null,
    height_cm: formData.get("height_cm") ? Number(formData.get("height_cm")) : null,
    country_id: formData.get("country_id") ? Number(formData.get("country_id")) : null,
    city_id: formData.get("city_id") ? Number(formData.get("city_id")) : null,
    phone: formData.get("phone") || null,
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

  const { error } = await supabase
    .from("profiles")
    .update(result.data)
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
