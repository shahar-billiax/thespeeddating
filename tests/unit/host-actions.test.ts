import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { createClient } from "@/lib/supabase/server";
import { getHostVenues } from "@/lib/host/actions";

function makeMockSupabase(user: any, profile: any) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: table === "profiles" ? profile : null,
        error: null,
      }),
      order: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
}

describe("requireHost (via getHostVenues)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirects to /login when no user", async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeMockSupabase(null, null) as any
    );
    await expect(getHostVenues()).rejects.toThrow("REDIRECT:/login");
  });

  it("redirects to / when user has member role", async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeMockSupabase({ id: "user-1" }, { role: "member" }) as any
    );
    await expect(getHostVenues()).rejects.toThrow("REDIRECT:/");
  });

  it("allows host role", async () => {
    const mock = makeMockSupabase({ id: "user-1" }, { role: "host" });
    // Make the venue_hosts query return empty array
    mock.from = vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue({
        data: table === "profiles" ? { role: "host" } : null,
        error: null,
      }),
      in: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
    }));
    vi.mocked(createClient).mockResolvedValue(mock as any);
    const result = await getHostVenues();
    expect(result).toEqual([]);
  });

  it("allows admin role", async () => {
    const mock = makeMockSupabase({ id: "user-1" }, { role: "admin" });
    mock.from = vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue({
        data: table === "profiles" ? { role: "admin" } : null,
        error: null,
      }),
      in: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
    }));
    vi.mocked(createClient).mockResolvedValue(mock as any);
    const result = await getHostVenues();
    expect(result).toEqual([]);
  });
});
