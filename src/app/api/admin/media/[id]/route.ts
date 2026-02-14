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

// PATCH - Update alt_text and/or filename
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const updates: Record<string, string> = {};

  if (body.alt_text !== undefined) updates.alt_text = body.alt_text;
  if (body.filename !== undefined) updates.filename = body.filename;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data, error } = await (admin as any)
    .from("media_files")
    .update(updates)
    .eq("id", Number(id))
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return NextResponse.json({
    file: {
      ...data,
      url: `${supabaseUrl}/storage/v1/object/public/media/${data.storage_path}?v=${new Date(data.updated_at || data.created_at).getTime()}`,
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  // Get the file record first
  const { data: file, error: fetchError } = await (admin as any)
    .from("media_files")
    .select("storage_path")
    .eq("id", Number(id))
    .single();

  if (fetchError || !file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Delete from storage
  await admin.storage.from("media").remove([file.storage_path]);

  // Delete from database
  const { error } = await (admin as any)
    .from("media_files")
    .delete()
    .eq("id", Number(id));

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
