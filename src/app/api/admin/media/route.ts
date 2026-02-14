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

// GET - List all media files
export async function GET() {
  const user = await requireAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await (admin as any)
    .from("media_files")
    .select("*")
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const files = (data ?? []).map((f: any) => ({
    ...f,
    url: `${supabaseUrl}/storage/v1/object/public/media/${f.storage_path}?v=${new Date(f.updated_at || f.created_at).getTime()}`,
  }));

  return NextResponse.json({ files });
}

// POST - Upload file(s)
export async function POST(request: NextRequest) {
  const user = await requireAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  for (const file of files) {
    if (!allowedTypes.some((t) => file.type.startsWith(t))) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: `File too large: ${file.name} (max 10MB)` },
        { status: 400 }
      );
    }
  }

  const admin = createAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const uploaded = [];

  for (const file of files) {
    const sanitized = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/_+/g, "_");
    const storagePath = `${Date.now()}-${sanitized}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from("media")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: record, error: dbError } = await (admin as any)
      .from("media_files")
      .insert({
        filename: file.name,
        storage_path: storagePath,
        file_size: file.size,
        mime_type: file.type,
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file on DB error
      await admin.storage.from("media").remove([storagePath]);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    uploaded.push({
      ...record,
      url: `${supabaseUrl}/storage/v1/object/public/media/${storagePath}`,
    });
  }

  return NextResponse.json({ files: uploaded });
}
