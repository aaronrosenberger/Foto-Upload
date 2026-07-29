import { NextRequest, NextResponse } from "next/server";
import { uploadFileToDrive } from "@/lib/googleDrive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

type UploadResult = {
  fileName: string;
  status: "success" | "error";
  message?: string;
};

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Ungültige Anfrage: Formulardaten konnten nicht gelesen werden." },
      { status: 400 }
    );
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json(
      { error: "Es wurden keine Dateien übermittelt." },
      { status: 400 }
    );
  }

  const results: UploadResult[] = [];

  for (const file of files) {
    if (!ACCEPTED_TYPES.has(file.type)) {
      results.push({
        fileName: file.name,
        status: "error",
        message: "Nicht unterstütztes Dateiformat.",
      });
      continue;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      results.push({
        fileName: file.name,
        status: "error",
        message: `Datei ist größer als ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`,
      });
      continue;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await uploadFileToDrive(buffer, file.name, file.type);
      results.push({ fileName: file.name, status: "success" });
    } catch (error) {
      results.push({
        fileName: file.name,
        status: "error",
        message:
          error instanceof Error ? error.message : "Unbekannter Fehler beim Hochladen.",
      });
    }
  }

  return NextResponse.json({ results });
}
