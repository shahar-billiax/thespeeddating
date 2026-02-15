import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function extractStoragePath(avatarUrl: string): string | null {
  const marker = "/storage/v1/object/public/media/";
  const idx = avatarUrl.indexOf(marker);
  if (idx === -1) return null;
  // Strip any query params (?v=...)
  const path = avatarUrl.slice(idx + marker.length).split("?")[0];
  return path || null;
}

// POST - Upload avatar
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, and WebP images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large (max 5MB)" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // Delete old avatar if exists
  const { data: profile } = await admin
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  if (profile?.avatar_url) {
    const oldPath = extractStoragePath(profile.avatar_url);
    if (oldPath) {
      await admin.storage.from("media").remove([oldPath]);
    }
  }

  // Upload new avatar
  const ext = file.name.split(".").pop() || "jpg";
  const storagePath = `avatars/${user.id}/${Date.now()}.${ext}`;
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

  // Update profile
  const avatarUrl = `${supabaseUrl}/storage/v1/object/public/media/${storagePath}`;
  const { error: updateError } = await admin
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (updateError) {
    await admin.storage.from("media").remove([storagePath]);
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: avatarUrl });
}

// DELETE - Remove avatar
export async function DELETE() {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  if (profile?.avatar_url) {
    const oldPath = extractStoragePath(profile.avatar_url);
    if (oldPath) {
      await admin.storage.from("media").remove([oldPath]);
    }
  }

  await admin
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);

  return NextResponse.json({ success: true });
}
