import { describe, it, expect, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY } from "../env";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const testEmail = `test-${Date.now()}@example.com`;
const testPassword = "testpass123";
let testUserId: string;

afterAll(async () => {
  if (testUserId) {
    await supabase.from("profiles").delete().eq("id", testUserId);
    await supabase.auth.admin.deleteUser(testUserId);
  }
});

describe("auth integration", () => {
  it("creates a user via admin API", async () => {
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });

    expect(error).toBeNull();
    expect(data.user).toBeTruthy();
    testUserId = data.user!.id;
  });

  it("creates a profile for the user", async () => {
    const { data: country } = await supabase
      .from("countries")
      .select("id")
      .eq("code", "gb")
      .single();

    const { error } = await supabase.from("profiles").insert({
      id: testUserId,
      first_name: "Test",
      last_name: "User",
      email: testEmail,
      date_of_birth: "1990-05-15",
      gender: "male",
      country_id: country?.id,
    });

    expect(error).toBeNull();
  });

  it("can read the profile back", async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", testUserId)
      .single();

    expect(error).toBeNull();
    expect(data?.first_name).toBe("Test");
    expect(data?.last_name).toBe("User");
    expect(data?.email).toBe(testEmail);
  });

  it("signs in with email/password", async () => {
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await anonClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    expect(error).toBeNull();
    expect(data.session).toBeTruthy();
    expect(data.user?.email).toBe(testEmail);
  });
});
