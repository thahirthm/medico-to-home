import { env } from "./env";
import { ApiError } from "./errors";

// One private bucket for patient records and professional application documents.
export const BUCKET = "medical-documents";
export const MAX_BYTES = 20 * 1024 * 1024;

export const storage = (path: string, body: unknown) =>
  fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1${path}`, {
    method: "POST",
    headers: { apikey: env.SUPABASE_SECRET_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

/** A one-time URL the browser uploads straight to, so files never pass through the API. */
export async function signedUpload(path: string) {
  const res = await storage(`/object/upload/sign/${BUCKET}/${path}`, {});
  if (!res.ok) throw new ApiError(502, "Could not prepare the upload.");
  const { url } = (await res.json()) as { url: string };
  return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1${url}`;
}

/** A link that opens a private file for 5 minutes. */
export async function signedDownload(path: string) {
  const res = await storage(`/object/sign/${BUCKET}/${path}`, { expiresIn: 300 });
  if (!res.ok) throw new ApiError(502, "Could not open the file.");
  const { signedURL } = (await res.json()) as { signedURL: string };
  return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1${signedURL}`;
}

export const safeFileName = (name: string) => name.replace(/[^\w.-]+/g, "_");
