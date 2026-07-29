# Foto-Upload – Hochzeits-Landingpage

Eine Next.js-Landingpage für eine Hochzeit mit Foto-Upload-Funktion. Gäste können
Bilder auswählen und per Klick auf "Hochladen" direkt in einen Google-Drive-Ordner
hochladen – die Anbindung erfolgt über einen Google Service Account.

## Tech-Stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/)
- [googleapis](https://www.npmjs.com/package/googleapis) für die Google-Drive-API

## Einrichtung

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Google Service Account einrichten

1. Google Cloud Projekt öffnen (oder neues anlegen): https://console.cloud.google.com/
2. **Google Drive API** aktivieren (APIs & Dienste → Bibliothek → "Google Drive API").
3. Unter **APIs & Dienste → Anmeldedaten** einen neuen **Dienstkonto** (Service Account)
   anlegen.
4. Für das Dienstkonto einen JSON-Schlüssel erstellen und herunterladen. Aus der
   JSON-Datei benötigst du:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_PRIVATE_KEY`
5. Den Ziel-Ordner in Google Drive anlegen und die **E-Mail-Adresse des
   Service Accounts** als Bearbeiter für diesen Ordner freigeben (Ordner
   → Rechtsklick → "Freigeben"). Ohne diesen Schritt schlägt der Upload mit
   einem Berechtigungsfehler fehl.
6. Die Ordner-ID aus der URL des Ordners kopieren:
   `https://drive.google.com/drive/folders/<ORDNER_ID>` → `GOOGLE_DRIVE_FOLDER_ID`

### 3. Umgebungsvariablen setzen

`.env.example` nach `.env.local` kopieren und die Werte eintragen:

```bash
cp .env.example .env.local
```

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@dein-projekt.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=deine-google-drive-ordner-id
```

> Wichtig: Der `GOOGLE_PRIVATE_KEY` muss die Zeilenumbrüche als `\n` enthalten
> und in Anführungszeichen stehen, genau wie in der JSON-Datei.

### 4. Entwicklungsserver starten

```bash
npm run dev
```

Die Seite ist danach unter http://localhost:3000 erreichbar.

## Projektstruktur

```
src/
  app/
    page.tsx            Landingpage (Hero, Hochzeitsinfos, Upload-Bereich)
    layout.tsx           Root-Layout, Metadaten
    globals.css           Tailwind-Basis-Styles
    api/upload/route.ts   API-Route für den Foto-Upload
  components/
    PhotoUploader.tsx     Client-Komponente: Auswahl, Vorschau, Upload
  lib/
    googleDrive.ts        Google-Drive-Anbindung über Service Account
```

## Funktionsweise des Uploads

1. Im Browser wählt der Nutzer ein oder mehrere Bilder aus (Drag & Drop oder
   Dateiauswahl).
2. Beim Klick auf "Hochladen" werden die Dateien als `multipart/form-data`
   an `POST /api/upload` gesendet.
3. Die API-Route validiert Dateityp (JPG/PNG/WEBP/HEIC) und Größe (max. 15 MB),
   authentifiziert sich über den Service Account (JWT) und lädt jede Datei per
   `drive.files.create` in den konfigurierten Ordner hoch.
4. Der Client zeigt pro Datei den Status (Erfolg/Fehler) an.

## Build für Produktion

```bash
npm run build
npm run start
```
