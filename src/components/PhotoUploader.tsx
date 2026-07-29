"use client";

import { useCallback, useRef, useState } from "react";

const MAX_FILE_SIZE_MB = 15;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

type SelectedFile = {
  file: File;
  previewUrl: string;
};

type UploadResult = {
  fileName: string;
  status: "success" | "error";
  message?: string;
};

export default function PhotoUploader() {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    setResults([]);

    const incoming = Array.from(fileList).filter((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) return false;
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return false;
      return true;
    });

    setSelectedFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.file.name}-${f.file.size}`));
      const deduped = incoming.filter(
        (file) => !existingKeys.has(`${file.name}-${file.size}`)
      );
      const additions = deduped.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      return [...prev, ...additions];
    });
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    addFiles(event.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || isUploading) return;
    setIsUploading(true);
    setResults([]);

    try {
      const formData = new FormData();
      selectedFiles.forEach(({ file }) => formData.append("files", file));

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Upload fehlgeschlagen.");
      }

      setResults(data.results as UploadResult[]);

      const allSucceeded = (data.results as UploadResult[]).every(
        (r) => r.status === "success"
      );
      if (allSucceeded) {
        selectedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
        setSelectedFiles([]);
      }
    } catch (error) {
      setResults([
        {
          fileName: "Upload",
          status: "error",
          message:
            error instanceof Error ? error.message : "Unbekannter Fehler beim Upload.",
        },
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragActive
            ? "border-blush-500 bg-blush-100"
            : "border-blush-300 bg-white/60 hover:bg-white"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <p className="font-serif text-lg text-blush-700">
          Fotos hierher ziehen oder klicken zum Auswählen
        </p>
        <p className="mt-1 text-sm text-stone-500">
          JPG, PNG, WEBP oder HEIC · max. {MAX_FILE_SIZE_MB} MB pro Bild
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {selectedFiles.map((f, index) => (
            <div
              key={`${f.file.name}-${f.file.size}`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-blush-200 bg-white shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.previewUrl}
                alt={f.file.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Bild entfernen"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploading}
          className="w-full rounded-full bg-blush-500 px-8 py-3 font-medium text-white shadow-md transition-colors hover:bg-blush-600 disabled:cursor-not-allowed disabled:bg-stone-300 sm:w-auto"
        >
          {isUploading
            ? "Wird hochgeladen …"
            : `Hochladen${selectedFiles.length ? ` (${selectedFiles.length})` : ""}`}
        </button>

        {results.length > 0 && (
          <ul className="w-full space-y-1 text-sm">
            {results.map((r, i) => (
              <li
                key={`${r.fileName}-${i}`}
                className={r.status === "success" ? "text-sage-600" : "text-red-600"}
              >
                {r.status === "success"
                  ? `✓ ${r.fileName} erfolgreich hochgeladen`
                  : `✗ ${r.fileName}: ${r.message ?? "Fehler beim Hochladen"}`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
