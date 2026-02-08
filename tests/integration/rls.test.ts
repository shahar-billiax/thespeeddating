import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY } from "../env";

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let testUserId: string;
const testEmail = `rls-test-${Date.now()}@example.com`;

beforeAll(async () => {
  const { data } = await adminClient.auth.admin.createUser({
    email: testEmail,
    password: "testpass123",
    email_confirm: true,
  });
  testUserId = data.user!.id;

  const { data: country } = await adminClient
    .from("countries")
    .select("id")
    .eq("code", "gb")
    .single();

  await adminClient.from("profiles").insert({
    id: testUserId,
    first_name: "RLS",
    last_name: "Test",
    email: testEmail,
    date_of_birth: "1990-01-01",
    gender: "female",
    country_id: country?.id,
  });
});

afterAll(async () => {
  if (testUserId) {
    await adminClient.from("profiles").delete().eq("id", testUserId);
    await adminClient.auth.admin.deleteUser(testUserId);
  }
});

describe("RLS policies", () => {
  it("anon can read countries", async () => {
    const { data, error } = await anonClient.from("countries").select("*");
    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThan(0);
  });

  it("anon can read cities", async () => {
    const { data, error } = await anonClient.from("cities").select("*");
    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThan(0);
  });

  it("anon can read translations", async () => {
    const { data, error } = await anonClient.from("translations").select("*");
    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThan(0);
  });

  it("anon cannot read profiles", async () => {
    const { data } = await anonClient.from("profiles").select("*");
    expect(data).toHaveLength(0);
  });

  it("authenticated user can read own profile", async () => {
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    await userClient.auth.signInWithPassword({
      email: testEmail,
      password: "testpass123",
    });

    const { data, error } = await userClient
      .from("profiles")
      .select("*")
      .eq("id", testUserId)
      .single();

    expect(error).toBeNull();
    expect(data?.email).toBe(testEmail);
  });

  it("anon cannot read email_templates (locked table)", async () => {
    const { data } = await anonClient.from("email_templates").select("*");
    expect(data).toHaveLength(0);
  });
});
