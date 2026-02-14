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

export async function POST(request: NextRequest) {
  const user = await requireAdmin();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = await request.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Only allow http/https
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json(
      { error: "Only HTTP/HTTPS URLs are supported" },
      { status: 400 }
    );
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": "TheSpeedDating-MediaFetcher/1.0" },
      signal: AbortSignal.timeout(30000),
      redirect: "follow",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to download image from URL" },
      { status: 400 }
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: `Download failed with status ${response.status}` },
      { status: 400 }
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  if (!allowedTypes.some((t) => contentType.startsWith(t))) {
    return NextResponse.json(
      { error: `Unsupported content type: ${contentType}` },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.length > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Downloaded image exceeds 10MB limit" },
      { status: 400 }
    );
  }

  // Determine filename from URL
  const pathSegments = parsedUrl.pathname.split("/");
  let filename = pathSegments[pathSegments.length - 1] || "image";
  if (!filename.includes(".")) {
    const extMap: Record<string, string> = {
      "image/png": ".png",
      "image/jpeg": ".jpg",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
    };
    const ext =
      Object.entries(extMap).find(([t]) => contentType.startsWith(t))?.[1] ||
      ".bin";
    filename += ext;
  }

  const sanitized = filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_+/g, "_");
  const storagePath = `${Date.now()}-${sanitized}`;

  const admin = createAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const { error: uploadError } = await admin.storage
    .from("media")
    .upload(storagePath, buffer, {
      contentType,
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
      filename: decodeURIComponent(filename),
      storage_path: storagePath,
      file_size: buffer.length,
      mime_type: contentType.split(";")[0].trim(),
    })
    .select()
    .single();

  if (dbError) {
    await admin.storage.from("media").remove([storagePath]);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({
    file: {
      ...record,
      url: `${supabaseUrl}/storage/v1/object/public/media/${storagePath}?v=${new Date(record.updated_at || record.created_at).getTime()}`,
    },
  });
}
