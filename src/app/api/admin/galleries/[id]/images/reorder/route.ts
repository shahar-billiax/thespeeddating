import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return null;
  return user;
}

// PUT - Bulk reorder gallery images
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await params; // consume params
  const body = await request.json();
  const order: { id: number; sort_order: number }[] = body.order;

  if (!order?.length) {
    return NextResponse.json({ error: "No order provided" }, { status: 400 });
  }

  const admin = createAdminClient();

  const results = await Promise.all(
    order.map(({ id, sort_order }) =>
      admin
        .from("gallery_images")
        .update({ sort_order })
        .eq("id", id)
    )
  );

  const firstError = results.find((r) => r.error);
  if (firstError?.error) {
    return NextResponse.json(
      { error: firstError.error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
