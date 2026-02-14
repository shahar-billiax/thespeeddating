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

// GET - List all images for a gallery
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const { data, error } = await admin
    .from("gallery_images")
    .select("*")
    .eq("gallery_id", Number(id))
    .order("sort_order", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const images = (data ?? []).map((img) => ({
    ...img,
    url: `${supabaseUrl}/storage/v1/object/public/media/${img.storage_path}`,
  }));

  return NextResponse.json({ images });
}

// POST - Add image(s) to gallery
// Accepts JSON: { images: [{ storage_path: string, caption?: string }] }
// Or FormData with files for direct upload
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const galleryId = Number(id);
  const admin = createAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // Get current max sort_order
  const { data: existing } = await admin
    .from("gallery_images")
    .select("sort_order")
    .eq("gallery_id", galleryId)
    .order("sort_order", { ascending: false })
    .limit(1);

  let nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    // Adding from media library
    const body = await request.json();
    const items: { storage_path: string; caption?: string }[] = body.images;

    if (!items?.length) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    const records = items.map((item) => ({
      gallery_id: galleryId,
      storage_path: item.storage_path,
      caption: item.caption || null,
      sort_order: nextOrder++,
    }));

    const { data, error } = await admin
      .from("gallery_images")
      .insert(records)
      .select();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    const images = (data ?? []).map((img) => ({
      ...img,
      url: `${supabaseUrl}/storage/v1/object/public/media/${img.storage_path}`,
    }));

    return NextResponse.json({ images });
  } else {
    // Direct file upload
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
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

      // Also create a media_files record so it's in the media library
      await (admin as any)
        .from("media_files")
        .insert({
          filename: file.name,
          storage_path: storagePath,
          file_size: file.size,
          mime_type: file.type,
        });

      // Create gallery_images record
      const { data: record, error: dbError } = await admin
        .from("gallery_images")
        .insert({
          gallery_id: galleryId,
          storage_path: storagePath,
          sort_order: nextOrder++,
        })
        .select()
        .single();

      if (dbError) {
        await admin.storage.from("media").remove([storagePath]);
        return NextResponse.json({ error: dbError.message }, { status: 500 });
      }

      uploaded.push({
        ...record,
        url: `${supabaseUrl}/storage/v1/object/public/media/${storagePath}`,
      });
    }

    return NextResponse.json({ images: uploaded });
  }
}
