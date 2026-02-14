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

// PATCH - Update caption or sort_order
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const user = await requireAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imageId } = await params;
  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.caption !== undefined) updates.caption = body.caption;
  if (body.sort_order !== undefined) updates.sort_order = body.sort_order;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const admin = createAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const { data, error } = await admin
    .from("gallery_images")
    .update(updates)
    .eq("id", Number(imageId))
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    image: {
      ...data,
      url: `${supabaseUrl}/storage/v1/object/public/media/${data.storage_path}`,
    },
  });
}

// DELETE - Remove image from gallery (DB record only, storage file kept)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const user = await requireAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imageId } = await params;
  const admin = createAdminClient();

  const { error } = await admin
    .from("gallery_images")
    .delete()
    .eq("id", Number(imageId));

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
