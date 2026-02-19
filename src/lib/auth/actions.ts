"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod/v4";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

const signUpSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().date(),
  gender: z.enum(["male", "female"]),
});

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const resetPasswordSchema = z.object({
  email: z.email(),
});

const updatePasswordSchema = z.object({
  password: z.string().min(6),
});

export async function signUp(formData: FormData) {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") || "unknown";
  const { limited } = checkRateLimit(`auth:${ip}`, 10, 60000);
  if (limited) {
    return { error: "Too many attempts. Please try again later." };
  }

  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    dateOfBirth: formData.get("dateOfBirth"),
    gender: formData.get("gender"),
  });

  if (!parsed.success) {
    return { error: "Invalid form data. Please check your inputs." };
  }

  const supabase = await createClient();
  const { email, password, firstName, lastName, dateOfBirth, gender } = parsed.data;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    // Create profile using admin client — the user has no session yet (email unconfirmed)
    const adminClient = createAdminClient();
    const { error: profileError } = await adminClient.from("profiles").insert({
      id: data.user.id,
      first_name: firstName,
      last_name: lastName,
      email,
      date_of_birth: dateOfBirth,
      gender,
    });

    if (profileError) {
      return { error: profileError.message };
    }
  }

  redirect("/verify-email");
}

export async function signIn(formData: FormData) {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") || "unknown";
  const { limited } = checkRateLimit(`auth:${ip}`, 10, 60000);
  if (limited) {
    return { error: "Too many attempts. Please try again later." };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Please enter a valid email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  const redirectTo = (formData.get("redirect") as string) || "/dashboard";
  redirect(redirectTo);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function resetPassword(formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: "Please enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: "http://localhost:3000/update-password",
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Check your email for a password reset link." };
}

export async function updatePassword(formData: FormData) {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login");
}
