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

// POST - Replace image with an edited version
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  // Get current file record
  const { data: existing, error: fetchError } = await (admin as any)
    .from("media_files")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Upload the edited file to the same storage path (overwrite)
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await admin.storage
    .from("media")
    .upload(existing.storage_path, buffer, {
      contentType: file.type || existing.mime_type || "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: uploadError.message },
      { status: 500 }
    );
  }

  // Update file size and mime type in DB
  const { data, error: updateError } = await (admin as any)
    .from("media_files")
    .update({
      file_size: buffer.byteLength,
      mime_type: file.type || existing.mime_type,
    })
    .eq("id", Number(id))
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return NextResponse.json({
    file: {
      ...data,
      url: `${supabaseUrl}/storage/v1/object/public/media/${data.storage_path}?v=${new Date(data.updated_at || data.created_at).getTime()}`,
    },
  });
}
