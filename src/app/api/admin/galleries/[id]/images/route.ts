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

// GET - List images for a gallery, optionally filtered by entity
// Query params: ?venue_id=X or ?event_id=X
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  let query = admin
    .from("gallery_images")
    .select("*")
    .eq("gallery_id", Number(id))
    .order("sort_order", { ascending: true });

  const venueId = request.nextUrl.searchParams.get("venue_id");
  const eventId = request.nextUrl.searchParams.get("event_id");
  if (venueId) query = query.eq("venue_id", Number(venueId));
  if (eventId) query = query.eq("event_id", Number(eventId));

  const { data, error } = await query;

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
  try {
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
    const venueId = body.venue_id ? Number(body.venue_id) : null;
    const eventId = body.event_id ? Number(body.event_id) : null;

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
      ...(venueId ? { venue_id: venueId } : {}),
      ...(eventId ? { event_id: eventId } : {}),
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
    const fmVenueId = formData.get("venue_id") ? Number(formData.get("venue_id")) : null;
    const fmEventId = formData.get("event_id") ? Number(formData.get("event_id")) : null;

    // Filter to actual File/Blob entries (reject strings from malformed uploads)
    const validFiles = files.filter(
      (f): f is File => typeof f !== "string" && f instanceof Blob && f.size > 0
    );

    if (validFiles.length === 0) {
      return NextResponse.json(
        { error: "No valid files provided" },
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
    const allowedExts = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];

    for (const file of validFiles) {
      const fileType = file.type || "";
      const fileName = file.name || "";
      const ext = fileName.toLowerCase().replace(/.*(\.[^.]+)$/, "$1");
      if (
        !allowedTypes.some((t) => fileType.startsWith(t)) &&
        !allowedExts.includes(ext)
      ) {
        return NextResponse.json(
          { error: `Unsupported file type: ${fileType || fileName || "unknown"}` },
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

    // Map extensions to MIME types for fallback when file.type is missing
    const extToMime: Record<string, string> = {
      ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
      ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml",
    };

    for (const file of validFiles) {
      const sanitized = (file.name || "upload")
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .replace(/_+/g, "_");
      const storagePath = `${Date.now()}-${sanitized}`;
      const ext = (file.name || "").toLowerCase().replace(/.*(\.[^.]+)$/, "$1");
      const mimeType = file.type || extToMime[ext] || "application/octet-stream";

      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await admin.storage
        .from("media")
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: uploadError.message },
          { status: 500 }
        );
      }

      // Also create a media_files record so it's in the media library
      await admin
        .from("media_files" as any)
        .insert({
          filename: file.name || sanitized,
          storage_path: storagePath,
          file_size: file.size,
          mime_type: mimeType,
        });

      // Create gallery_images record
      const { data: record, error: dbError } = await admin
        .from("gallery_images")
        .insert({
          gallery_id: galleryId,
          storage_path: storagePath,
          sort_order: nextOrder++,
          ...(fmVenueId ? { venue_id: fmVenueId } : {}),
          ...(fmEventId ? { event_id: fmEventId } : {}),
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
  } catch (err) {
    console.error("Gallery images POST error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown server error" },
      { status: 500 }
    );
  }
}
