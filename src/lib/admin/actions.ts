"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// ─── Auth helper ─────────────────────────────────────────────
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");
  return { supabase, user };
}

// ─── Dashboard stats ─────────────────────────────────────────
export async function getDashboardStats() {
  const { supabase } = await requireAdmin();

  const now = new Date().toISOString();
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [members, upcomingEvents, recentRegistrations, activeVips] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, created_at", { count: "exact", head: false })
        .eq("is_active", true),
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true)
        .eq("is_cancelled", false)
        .gte("event_date", now.split("T")[0]),
      supabase
        .from("event_registrations")
        .select("id", { count: "exact", head: true })
        .gte("registered_at", sevenDaysAgo),
      supabase
        .from("vip_subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
    ]);

  // Count new members in last 30 days
  const newMembers = members.data?.filter(
    (m) => m.created_at >= thirtyDaysAgo
  ).length ?? 0;
  const prevMembers = (members.count ?? 0) - newMembers;

  return {
    totalMembers: members.count ?? 0,
    membersTrend: prevMembers > 0 ? newMembers : 0,
    upcomingEvents: upcomingEvents.count ?? 0,
    recentRegistrations: recentRegistrations.count ?? 0,
    activeVips: activeVips.count ?? 0,
  };
}

export async function getUpcomingEventsWithGender() {
  const { supabase } = await requireAdmin();
  const now = new Date().toISOString().split("T")[0];

  const { data: events } = await supabase
    .from("events")
    .select(
      `id, event_date, start_time, event_type, limit_male, limit_female,
       cities(name), venues(name)`
    )
    .eq("is_published", true)
    .eq("is_cancelled", false)
    .gte("event_date", now)
    .order("event_date", { ascending: true })
    .limit(10);

  if (!events) return [];

  const eventsWithCounts = await Promise.all(
    events.map(async (event) => {
      const { data: regs } = await supabase
        .from("event_registrations")
        .select("user_id, profiles(gender)")
        .eq("event_id", event.id)
        .in("status", ["confirmed", "attended"]);

      const males =
        regs?.filter((r) => (r.profiles as any)?.gender === "male").length ?? 0;
      const females =
        regs?.filter((r) => (r.profiles as any)?.gender === "female").length ??
        0;

      return {
        id: event.id,
        date: event.event_date,
        time: event.start_time,
        type: event.event_type,
        city: (event.cities as any)?.name,
        venue: (event.venues as any)?.name,
        males,
        females,
        limitMale: event.limit_male,
        limitFemale: event.limit_female,
      };
    })
  );

  return eventsWithCounts;
}

// ─── Events CRUD ─────────────────────────────────────────────
export async function getEvents(params: {
  page?: number;
  country?: string;
  city?: string;
  status?: string;
  type?: string;
  search?: string;
}) {
  const { supabase } = await requireAdmin();
  const page = params.page ?? 1;
  const perPage = 20;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from("events")
    .select(
      `*, cities(name), countries(name, code), venues(name)`,
      { count: "exact" }
    )
    .order("event_date", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (params.country) query = query.eq("country_id", Number(params.country));
  if (params.city) query = query.eq("city_id", Number(params.city));
  if (params.type) query = query.eq("event_type", params.type);
  if (params.search)
    query = query.ilike("venues.name", `%${params.search}%`);

  if (params.status === "upcoming") {
    query = query
      .gte("event_date", new Date().toISOString().split("T")[0])
      .eq("is_cancelled", false);
  } else if (params.status === "past") {
    query = query.lt("event_date", new Date().toISOString().split("T")[0]);
  } else if (params.status === "cancelled") {
    query = query.eq("is_cancelled", true);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return { events: data ?? [], total: count ?? 0, page, perPage };
}

export async function getEvent(id: number) {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("events")
    .select(`*, cities(id, name), countries(id, name, code, currency), venues(id, name)`)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createEvent(formData: FormData) {
  const { supabase } = await requireAdmin();

  const event = {
    country_id: Number(formData.get("country_id")),
    city_id: Number(formData.get("city_id")),
    venue_id: formData.get("venue_id")
      ? Number(formData.get("venue_id"))
      : null,
    event_date: formData.get("event_date") as string,
    start_time: (formData.get("start_time") as string) || null,
    end_time: (formData.get("end_time") as string) || null,
    event_type: (formData.get("event_type") as string) || "jewish_general",
    description: (formData.get("description") as string) || null,
    dress_code: (formData.get("dress_code") as string) || null,
    price: formData.get("price") ? Number(formData.get("price")) : null,
    price_male: formData.get("price_male")
      ? Number(formData.get("price_male"))
      : null,
    price_female: formData.get("price_female")
      ? Number(formData.get("price_female"))
      : null,
    vip_price: formData.get("vip_price")
      ? Number(formData.get("vip_price"))
      : null,
    enable_gendered_price: formData.get("enable_gendered_price") === "on",
    age_min: formData.get("age_min") ? Number(formData.get("age_min")) : null,
    age_max: formData.get("age_max") ? Number(formData.get("age_max")) : null,
    age_min_male: formData.get("age_min_male")
      ? Number(formData.get("age_min_male"))
      : null,
    age_max_male: formData.get("age_max_male")
      ? Number(formData.get("age_max_male"))
      : null,
    age_min_female: formData.get("age_min_female")
      ? Number(formData.get("age_min_female"))
      : null,
    age_max_female: formData.get("age_max_female")
      ? Number(formData.get("age_max_female"))
      : null,
    enable_gendered_age: formData.get("enable_gendered_age") === "on",
    limit_male: formData.get("limit_male")
      ? Number(formData.get("limit_male"))
      : null,
    limit_female: formData.get("limit_female")
      ? Number(formData.get("limit_female"))
      : null,
    special_offer: (formData.get("special_offer") as string) || null,
    special_offer_value: formData.get("special_offer_value")
      ? Number(formData.get("special_offer_value"))
      : null,
    currency: (formData.get("currency") as string) || null,
    is_published: formData.get("is_published") === "on",
  };

  const { data, error } = await supabase
    .from("events")
    .insert(event)
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/events");
  redirect(`/admin/events/${data.id}`);
}

export async function updateEvent(id: number, formData: FormData) {
  const { supabase } = await requireAdmin();

  const event = {
    country_id: Number(formData.get("country_id")),
    city_id: Number(formData.get("city_id")),
    venue_id: formData.get("venue_id")
      ? Number(formData.get("venue_id"))
      : null,
    event_date: formData.get("event_date") as string,
    start_time: (formData.get("start_time") as string) || null,
    end_time: (formData.get("end_time") as string) || null,
    event_type: (formData.get("event_type") as string) || "jewish_general",
    description: (formData.get("description") as string) || null,
    dress_code: (formData.get("dress_code") as string) || null,
    price: formData.get("price") ? Number(formData.get("price")) : null,
    price_male: formData.get("price_male")
      ? Number(formData.get("price_male"))
      : null,
    price_female: formData.get("price_female")
      ? Number(formData.get("price_female"))
      : null,
    vip_price: formData.get("vip_price")
      ? Number(formData.get("vip_price"))
      : null,
    enable_gendered_price: formData.get("enable_gendered_price") === "on",
    age_min: formData.get("age_min") ? Number(formData.get("age_min")) : null,
    age_max: formData.get("age_max") ? Number(formData.get("age_max")) : null,
    age_min_male: formData.get("age_min_male")
      ? Number(formData.get("age_min_male"))
      : null,
    age_max_male: formData.get("age_max_male")
      ? Number(formData.get("age_max_male"))
      : null,
    age_min_female: formData.get("age_min_female")
      ? Number(formData.get("age_min_female"))
      : null,
    age_max_female: formData.get("age_max_female")
      ? Number(formData.get("age_max_female"))
      : null,
    enable_gendered_age: formData.get("enable_gendered_age") === "on",
    limit_male: formData.get("limit_male")
      ? Number(formData.get("limit_male"))
      : null,
    limit_female: formData.get("limit_female")
      ? Number(formData.get("limit_female"))
      : null,
    special_offer: (formData.get("special_offer") as string) || null,
    special_offer_value: formData.get("special_offer_value")
      ? Number(formData.get("special_offer_value"))
      : null,
    currency: (formData.get("currency") as string) || null,
    is_published: formData.get("is_published") === "on",
    is_cancelled: formData.get("is_cancelled") === "on",
  };

  const { error } = await supabase.from("events").update(event).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
  redirect(`/admin/events/${id}`);
}

export async function deleteEvent(id: number) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function getEventParticipants(eventId: number) {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("event_registrations")
    .select(
      `id, status, payment_status, attended, registered_at, admin_notes,
       profiles(id, first_name, last_name, email, phone, gender, date_of_birth)`
    )
    .eq("event_id", eventId)
    .order("registered_at", { ascending: true });

  return data ?? [];
}

export async function updateParticipant(
  registrationId: number,
  updates: { status?: string; attended?: boolean; admin_notes?: string }
) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("event_registrations")
    .update(updates)
    .eq("id", registrationId);

  if (error) return { error: error.message };
  revalidatePath("/admin/events");
  return { success: true };
}

export async function toggleMatchSubmission(eventId: number, open: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("events")
    .update({ match_submission_open: open })
    .eq("id", eventId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function toggleMatchResults(eventId: number, released: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("events")
    .update({ match_results_released: released })
    .eq("id", eventId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function computeMatches(eventId: number) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("compute_matches", {
    p_event_id: eventId,
  });
  if (error) return { error: error.message };
  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

// ─── Venues CRUD ─────────────────────────────────────────────
export async function getVenues(params: {
  page?: number;
  country?: string;
  city?: string;
  active?: string;
}) {
  const { supabase } = await requireAdmin();
  const page = params.page ?? 1;
  const perPage = 20;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from("venues")
    .select(`*, cities(name), countries(name, code)`, { count: "exact" })
    .order("name", { ascending: true })
    .range(offset, offset + perPage - 1);

  if (params.country) query = query.eq("country_id", Number(params.country));
  if (params.city) query = query.eq("city_id", Number(params.city));
  if (params.active === "true") query = query.eq("is_active", true);
  if (params.active === "false") query = query.eq("is_active", false);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return { venues: data ?? [], total: count ?? 0, page, perPage };
}

export async function getVenue(id: number) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("venues")
    .select(`*, cities(id, name), countries(id, name, code)`)
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createVenue(formData: FormData) {
  const { supabase } = await requireAdmin();
  const venue = {
    name: formData.get("name") as string,
    country_id: Number(formData.get("country_id")),
    city_id: Number(formData.get("city_id")),
    address: (formData.get("address") as string) || null,
    phone: (formData.get("phone") as string) || null,
    website: (formData.get("website") as string) || null,
    venue_type: (formData.get("venue_type") as string) || null,
    description: (formData.get("description") as string) || null,
    dress_code: (formData.get("dress_code") as string) || null,
    transport_info: (formData.get("transport_info") as string) || null,
    map_url: (formData.get("map_url") as string) || null,
    latitude: formData.get("latitude")
      ? Number(formData.get("latitude"))
      : null,
    longitude: formData.get("longitude")
      ? Number(formData.get("longitude"))
      : null,
    contact_person_name:
      (formData.get("contact_person_name") as string) || null,
    contact_person_email:
      (formData.get("contact_person_email") as string) || null,
    contact_person_phone:
      (formData.get("contact_person_phone") as string) || null,
    internal_notes: (formData.get("internal_notes") as string) || null,
    is_active: formData.get("is_active") === "on",
  };

  const { data, error } = await supabase
    .from("venues")
    .insert(venue)
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/venues");
  redirect(`/admin/venues/${data.id}`);
}

export async function updateVenue(id: number, formData: FormData) {
  const { supabase } = await requireAdmin();
  const venue = {
    name: formData.get("name") as string,
    country_id: Number(formData.get("country_id")),
    city_id: Number(formData.get("city_id")),
    address: (formData.get("address") as string) || null,
    phone: (formData.get("phone") as string) || null,
    website: (formData.get("website") as string) || null,
    venue_type: (formData.get("venue_type") as string) || null,
    description: (formData.get("description") as string) || null,
    dress_code: (formData.get("dress_code") as string) || null,
    transport_info: (formData.get("transport_info") as string) || null,
    map_url: (formData.get("map_url") as string) || null,
    latitude: formData.get("latitude")
      ? Number(formData.get("latitude"))
      : null,
    longitude: formData.get("longitude")
      ? Number(formData.get("longitude"))
      : null,
    contact_person_name:
      (formData.get("contact_person_name") as string) || null,
    contact_person_email:
      (formData.get("contact_person_email") as string) || null,
    contact_person_phone:
      (formData.get("contact_person_phone") as string) || null,
    internal_notes: (formData.get("internal_notes") as string) || null,
    is_active: formData.get("is_active") === "on",
  };

  const { error } = await supabase.from("venues").update(venue).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/venues");
  revalidatePath(`/admin/venues/${id}`);
  redirect(`/admin/venues/${id}`);
}

// ─── Members ─────────────────────────────────────────────────
export async function getMembers(params: {
  page?: number;
  search?: string;
  gender?: string;
  country?: string;
  city?: string;
  ageMin?: string;
  ageMax?: string;
  vip?: string;
}) {
  const { supabase } = await requireAdmin();
  const page = params.page ?? 1;
  const perPage = 20;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from("profiles")
    .select(`*, cities(name), countries(name, code)`, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (params.search) {
    query = query.or(
      `first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,email.ilike.%${params.search}%`
    );
  }
  if (params.gender) query = query.eq("gender", params.gender);
  if (params.country) query = query.eq("country_id", Number(params.country));
  if (params.city) query = query.eq("city_id", Number(params.city));

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return { members: data ?? [], total: count ?? 0, page, perPage };
}

export async function getMember(id: string) {
  const { supabase } = await requireAdmin();

  const [{ data: profile }, { data: registrations }, { data: vipSubs }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(`*, cities(id, name), countries(id, name, code)`)
        .eq("id", id)
        .single(),
      supabase
        .from("event_registrations")
        .select(`*, events(id, event_date, event_type, cities(name))`)
        .eq("user_id", id)
        .order("registered_at", { ascending: false }),
      supabase
        .from("vip_subscriptions")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false }),
    ]);

  return { profile, registrations: registrations ?? [], vipSubs: vipSubs ?? [] };
}

export async function updateMember(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  const updates: Record<string, any> = {};
  const fields = [
    "first_name", "last_name", "phone", "bio", "occupation", "education",
    "relationship_status", "faith", "admin_comments", "role",
  ];
  for (const f of fields) {
    const val = formData.get(f);
    if (val !== null) updates[f] = (val as string) || null;
  }

  if (formData.get("is_active") !== null)
    updates.is_active = formData.get("is_active") === "on";
  if (formData.get("country_id"))
    updates.country_id = Number(formData.get("country_id"));
  if (formData.get("city_id"))
    updates.city_id = Number(formData.get("city_id"));

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(`/admin/members/${id}`);
  revalidatePath("/admin/members");
  return { success: true };
}

// ─── Blog CRUD ───────────────────────────────────────────────
export async function getBlogPosts(params: {
  page?: number;
  country?: string;
  published?: string;
}) {
  const { supabase } = await requireAdmin();
  const page = params.page ?? 1;
  const perPage = 20;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from("blog_posts")
    .select(`*, countries(name, code)`, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (params.country) query = query.eq("country_id", Number(params.country));
  if (params.published === "true") query = query.eq("is_published", true);
  if (params.published === "false") query = query.eq("is_published", false);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { posts: data ?? [], total: count ?? 0, page, perPage };
}

export async function getBlogPost(id: number) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`*, countries(id, name, code)`)
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function saveBlogPost(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = formData.get("id") ? Number(formData.get("id")) : null;

  const post = {
    title: formData.get("title") as string,
    slug:
      (formData.get("slug") as string) ||
      (formData.get("title") as string)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    body_html: formData.get("body_html") as string,
    country_id: Number(formData.get("country_id")),
    language_code: (formData.get("language_code") as string) || "en",
    featured_image: (formData.get("featured_image") as string) || null,
    is_published: formData.get("is_published") === "on",
    published_at: formData.get("is_published") === "on"
      ? new Date().toISOString()
      : null,
  };

  if (id) {
    const { error } = await supabase
      .from("blog_posts")
      .update(post)
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase
      .from("blog_posts")
      .insert(post)
      .select("id")
      .single();
    if (error) return { error: error.message };
    revalidatePath("/admin/blog");
    redirect(`/admin/blog/${data.id}/edit`);
  }

  revalidatePath("/admin/blog");
  return { success: true };
}

export async function deleteBlogPost(id: number) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

// ─── Promotions CRUD ─────────────────────────────────────────
export async function getPromotions(params: { page?: number }) {
  const { supabase } = await requireAdmin();
  const page = params.page ?? 1;
  const perPage = 20;
  const offset = (page - 1) * perPage;

  const { data, count, error } = await supabase
    .from("promotion_codes")
    .select(`*, countries(name, code), events(event_date, cities(name))`, {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (error) throw new Error(error.message);
  return { promotions: data ?? [], total: count ?? 0, page, perPage };
}

export async function savePromotion(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = formData.get("id") ? Number(formData.get("id")) : null;

  const promo = {
    code: (formData.get("code") as string).toUpperCase(),
    country_id: Number(formData.get("country_id")),
    is_percentage: formData.get("is_percentage") === "on",
    value: Number(formData.get("value")),
    valid_from: (formData.get("valid_from") as string) || null,
    valid_until: (formData.get("valid_until") as string) || null,
    event_id: formData.get("event_id")
      ? Number(formData.get("event_id"))
      : null,
    max_uses: formData.get("max_uses")
      ? Number(formData.get("max_uses"))
      : null,
    is_active: formData.get("is_active") === "on",
  };

  if (id) {
    const { error } = await supabase
      .from("promotion_codes")
      .update(promo)
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("promotion_codes").insert(promo);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/promotions");
  return { success: true };
}

// ─── Translations ────────────────────────────────────────────
export async function getTranslations(params: {
  page?: number;
  search?: string;
  language?: string;
}) {
  const { supabase } = await requireAdmin();
  const page = params.page ?? 1;
  const perPage = 50;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from("translations")
    .select("*", { count: "exact" })
    .order("string_key", { ascending: true })
    .range(offset, offset + perPage - 1);

  if (params.search) {
    query = query.or(
      `string_key.ilike.%${params.search}%,value.ilike.%${params.search}%`
    );
  }
  if (params.language) query = query.eq("language_code", params.language);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { translations: data ?? [], total: count ?? 0, page, perPage };
}

export async function saveTranslation(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = formData.get("id") ? Number(formData.get("id")) : null;

  const translation = {
    string_key: formData.get("string_key") as string,
    language_code: formData.get("language_code") as string,
    value: formData.get("value") as string,
  };

  if (id) {
    const { error } = await supabase
      .from("translations")
      .update(translation)
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("translations").insert(translation);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/translations");
  return { success: true };
}

export async function deleteTranslation(id: number) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("translations").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/translations");
  return { success: true };
}

// ─── Matchmaking ─────────────────────────────────────────────
export async function getMatchmakingProfiles(params: {
  page?: number;
  status?: string;
}) {
  const { supabase } = await requireAdmin();
  const page = params.page ?? 1;
  const perPage = 20;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from("matchmaking_profiles")
    .select(`*, profiles(first_name, last_name, email, gender)`, {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (params.status) query = query.eq("status", params.status);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { profiles: data ?? [], total: count ?? 0, page, perPage };
}

export async function updateMatchmakingProfile(
  id: number,
  updates: { status?: string; admin_notes?: string }
) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("matchmaking_profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/matchmaking");
  return { success: true };
}

// ─── Galleries CRUD ──────────────────────────────────────────
export async function getGalleries(params: {
  page?: number;
  category?: string;
  country?: string;
}) {
  const { supabase } = await requireAdmin();
  const page = params.page ?? 1;
  const perPage = 20;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from("galleries")
    .select(`*, countries(name, code), gallery_images(id)`, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (params.category) query = query.eq("category", params.category);
  if (params.country) query = query.eq("country_id", Number(params.country));

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { galleries: data ?? [], total: count ?? 0, page, perPage };
}

export async function getGallery(id: number) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("galleries")
    .select(
      `*, countries(id, name, code), gallery_images(id, storage_path, caption, sort_order)`
    )
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function saveGallery(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = formData.get("id") ? Number(formData.get("id")) : null;

  const gallery = {
    name: formData.get("name") as string,
    category: formData.get("category") as string,
    country_id: Number(formData.get("country_id")),
    is_active: formData.get("is_active") === "on",
  };

  if (id) {
    const { error } = await supabase
      .from("galleries")
      .update(gallery)
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath(`/admin/galleries/${id}`);
  } else {
    const { data, error } = await supabase
      .from("galleries")
      .insert(gallery)
      .select("id")
      .single();
    if (error) return { error: error.message };
    revalidatePath("/admin/galleries");
    redirect(`/admin/galleries/${data.id}`);
  }

  revalidatePath("/admin/galleries");
  return { success: true };
}

// ─── Shared lookups ──────────────────────────────────────────
export async function getCountries() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("countries")
    .select("id, name, code, currency")
    .order("name");
  return data ?? [];
}

export async function getCities(countryId?: number) {
  const { supabase } = await requireAdmin();
  let query = supabase.from("cities").select("id, name, country_id").order("name");
  if (countryId) query = query.eq("country_id", countryId);
  const { data } = await query;
  return data ?? [];
}

export async function getVenuesByCity(cityId: number) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("venues")
    .select("id, name")
    .eq("city_id", cityId)
    .eq("is_active", true)
    .order("name");
  return data ?? [];
}

export async function exportParticipantsCsv(eventId: number) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: registrations } = await supabase
    .from("event_registrations")
    .select("*, profiles(first_name, last_name, email, gender, date_of_birth, phone)")
    .eq("event_id", eventId)
    .order("created_at");

  if (!registrations || registrations.length === 0) {
    return { csv: "No participants", filename: `event-${eventId}-participants.csv` };
  }

  const headers = ["First Name", "Last Name", "Email", "Gender", "Date of Birth", "Phone", "Status", "Attended", "Registered At"];
  const rows = registrations.map((r: any) => [
    r.profiles?.first_name || "",
    r.profiles?.last_name || "",
    r.profiles?.email || "",
    r.profiles?.gender || "",
    r.profiles?.date_of_birth || "",
    r.profiles?.phone || "",
    r.status || "",
    r.attended ? "Yes" : "No",
    r.created_at || "",
  ]);

  const csv = [headers.join(","), ...rows.map(r => r.map((v: string) => `"${v}"`).join(","))].join("\n");
  return { csv, filename: `event-${eventId}-participants.csv` };
}

// ─── Pages (CMS) ─────────────────────────────────────────────
export async function getPages(params?: {
  page?: number;
  country?: string;
  language?: string;
  pageKey?: string;
}) {
  const { supabase } = await requireAdmin();
  const page = params?.page ?? 1;
  const perPage = 20;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from("pages")
    .select(`*, countries(name, code)`, { count: "exact" })
    .order("page_key", { ascending: true })
    .range(offset, offset + perPage - 1);

  if (params?.country) query = query.eq("country_id", Number(params.country));
  if (params?.language) query = query.eq("language_code", params.language);
  if (params?.pageKey) query = query.ilike("page_key", `%${params.pageKey}%`);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { pages: data ?? [], total: count ?? 0, page, perPage };
}

export async function getPageById(id: number) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("pages")
    .select(`*, countries(id, name, code)`)
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createPage(formData: FormData) {
  const { supabase } = await requireAdmin();

  const pageData = {
    page_key: formData.get("page_key") as string,
    country_id: Number(formData.get("country_id")),
    language_code: formData.get("language_code") as string,
    title: formData.get("title") as string,
    content_html: formData.get("content_html") as string,
    meta_title: formData.get("meta_title") as string || null,
    meta_description: formData.get("meta_description") as string || null,
    is_published: formData.get("is_published") === "true",
  };

  const { data, error } = await supabase
    .from("pages")
    .insert(pageData)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function updatePage(id: number, formData: FormData) {
  const { supabase } = await requireAdmin();

  const pageData = {
    page_key: formData.get("page_key") as string,
    country_id: Number(formData.get("country_id")),
    language_code: formData.get("language_code") as string,
    title: formData.get("title") as string,
    content_html: formData.get("content_html") as string,
    meta_title: formData.get("meta_title") as string || null,
    meta_description: formData.get("meta_description") as string || null,
    is_published: formData.get("is_published") === "true",
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("pages")
    .update(pageData)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/pages");
  revalidatePath(`/${pageData.page_key}`);
  redirect("/admin/pages");
}

export async function deletePage(id: number) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("pages").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/pages");
  return { success: true };
}
