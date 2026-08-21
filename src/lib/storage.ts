import { supabase } from "@/integrations/supabase/client";

const BUCKET = "product-images";

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function getProductImageUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24);
  if (error) {
    console.error("Failed to create signed URL:", error);
    return null;
  }
  return data.signedUrl;
}

export async function deleteProductImage(path: string | null | undefined): Promise<void> {
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error("Failed to delete image:", error);
}
