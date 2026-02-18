import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SERVICE_ROLE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Unsplash images (free to use, direct URLs)
const VENUE_IMAGES: Record<string, string> = {
  "The Montague Bar": "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80",
  "Skylight Rooftop Bar": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
  "Revolution Manchester": "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80",
  "Porter & Sons": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80",
};

async function main() {
  // Get all venues
  const { data: venues, error } = await supabase.from("venues").select("id, name");
  if (error) throw error;
  if (!venues?.length) {
    console.log("No venues found");
    return;
  }

  for (const venue of venues) {
    const imageUrl = VENUE_IMAGES[venue.name];
    if (!imageUrl) {
      console.log(`No image configured for: ${venue.name}`);
      continue;
    }

    console.log(`Downloading image for: ${venue.name}...`);

    // Download image
    const res = await fetch(imageUrl);
    if (!res.ok) {
      console.error(`Failed to download image for ${venue.name}: ${res.status}`);
      continue;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png") ? "png" : "jpeg";
    const storagePath = `venue-${venue.id}-${Date.now()}.${ext}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(storagePath, buffer, { contentType, upsert: false });

    if (uploadError) {
      console.error(`Upload failed for ${venue.name}: ${uploadError.message}`);
      continue;
    }

    // Create media_files record
    await supabase.from("media_files").insert({
      filename: `${venue.name.replace(/\s+/g, "-").toLowerCase()}.${ext}`,
      storage_path: storagePath,
      file_size: buffer.length,
      mime_type: contentType,
    });

    // Update venue with cover_image
    const { error: updateError } = await supabase
      .from("venues")
      .update({ cover_image: storagePath })
      .eq("id", venue.id);

    if (updateError) {
      console.error(`Update failed for ${venue.name}: ${updateError.message}`);
      continue;
    }

    console.log(`  Set cover image for: ${venue.name} (${storagePath})`);
  }

  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
