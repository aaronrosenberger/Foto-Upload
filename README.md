# Foto-Upload – Hochzeits-Landingpage (Google Apps Script)

Eine Hochzeits-Landingpage mit Foto-Upload-Funktion, gebaut als **Google Apps
Script Web App**. Gäste wählen Bilder aus und laden sie per Klick auf
"Hochladen" direkt in einen Google-Drive-Ordner hoch – ganz ohne separates
Hosting, da Apps Script die Seite selbst ausliefert.

## Tech-Stack

- [Google Apps Script](https://developers.google.com/apps-script) (V8-Runtime)
- `HtmlService` für die Seite (`Index.html`)
- [Tailwind CSS](https://tailwindcss.com/) über CDN (kein Build-Schritt nötig)
- `DriveApp` für den Datei-Upload – läuft unter deinem eigenen Google-Konto,
  **kein Service Account / keine JSON-Schlüssel nötig**

## Projektstruktur

```
appsscript.json    Manifest (Web-App-Konfiguration)
Code.gs            Server-Logik: liefert die Seite aus, nimmt Uploads entgegen
Index.html         Landingpage inkl. Upload-Widget (HTML/CSS/JS)
.clasp.json.example Vorlage für die clasp-Konfiguration (lokal → Apps Script)
```

## Einrichtung

### 1. Voraussetzungen

- Ein Google-Konto, unter dem die App laufen soll (dieses Konto braucht
  Zugriff auf den Ziel-Drive-Ordner).
- [clasp](https://github.com/google/clasp) für die lokale Entwicklung:
  ```bash
  npm install -g @google/clasp
  clasp login
  ```

### 2. Apps-Script-Projekt anlegen und Code hochladen

```bash
clasp create --type webapp --title "Foto-Upload Hochzeit" --rootDir .
```

Das legt automatisch eine `.clasp.json` mit deiner eigenen `scriptId` an
(diese Datei ist bewusst in `.gitignore`, da sie projektspezifisch ist –
orientiere dich an `.clasp.json.example`).

Danach den Code hochladen:

```bash
clasp push
```

Alternativ ganz ohne clasp: Auf https://script.google.com ein neues Projekt
anlegen und den Inhalt von `Code.gs`, `Index.html` und `appsscript.json`
manuell in den Editor kopieren (Projekteinstellungen → "appsscript.json-
Manifestdatei anzeigen" aktivieren, um die Manifest-Datei bearbeiten zu
können).

### 3. Google-Drive-Ordner verknüpfen

1. In Google Drive (mit dem Konto, unter dem die App später läuft) den
   Zielordner für die Hochzeitsfotos anlegen oder auswählen.
2. Die Ordner-ID aus der URL kopieren:
   `https://drive.google.com/drive/folders/`**`<ORDNER_ID>`**
3. Im Apps-Script-Editor: **Projekteinstellungen (Zahnrad-Symbol) → Script
   Properties → Script-Property hinzufügen**
   - Eigenschaft: `DRIVE_FOLDER_ID`
   - Wert: die kopierte Ordner-ID
4. Speichern.

Das war's – kein Service Account, keine Freigabe-Schritte nötig, da das
Script direkt mit den Rechten deines Google-Kontos läuft.

### 4. Als Web App bereitstellen

```bash
clasp deploy
```

Oder im Editor: **Deploy → Neuer Deployment → Web-App**
- **Ausführen als:** Ich (dein Konto)
- **Zugriff:** Jeder / Jeder (auch anonym) – damit Gäste ohne Google-Login
  hochladen können

Nach dem Deployment erhältst du eine URL wie
`https://script.google.com/macros/s/XXXXXXXX/exec` – das ist die fertige,
gehostete Landingpage.

> Nach Code-Änderungen: `clasp push` und danach ein **neues Deployment**
> (bzw. bestehendes Deployment aktualisieren), damit die Web-App-URL die
> neue Version ausliefert.

## Funktionsweise des Uploads

1. Im Browser wählt der Gast ein oder mehrere Bilder aus (Drag & Drop oder
   Dateiauswahl); alle gängigen Foto-Formate, max. 50 MB pro Bild.
2. Beim Klick auf "Hochladen" schickt der Browser jede Datei per
   `XMLHttpRequest` als **rohen Binär-POST** direkt an die eigene Web-App-URL
   (Dateiname/MIME-Type als Query-Parameter) – **nicht** über
   `google.script.run`. Das spart die ~33 % Größenaufschlag von Base64 und
   liefert echten Byte-für-Byte-Upload-Fortschritt
   (`xhr.upload.onprogress`), was über `google.script.run` gar nicht möglich
   wäre. Bis zu 3 Dateien laufen dabei gleichzeitig (`UPLOAD_CONCURRENCY` in
   `Index.html`); schlägt ein Upload fehl, wird er automatisch bis zu zweimal
   wiederholt (`UPLOAD_MAX_RETRIES`), bevor er als fehlgeschlagen markiert
   wird.
3. `doPost(e)` in `Code.gs` validiert Typ und Größe, liest die rohen Bytes
   aus `e.postData.bytes` und legt die Datei über
   `DriveApp.getFolderById(...).createFile(...)` im konfigurierten Ordner ab.
4. Die Seite zeigt pro Datei den Status (Erfolg/Fehler) sowie einen
   Gesamt-Fortschrittsbalken (echte Prozentangabe über alle Dateien) an.

`doGet()` übergibt die eigene Bereitstellungs-URL
(`ScriptApp.getService().getUrl()`) per Template-Scriptlet
(`<?!= scriptUrl ?>`) an `Index.html` – deshalb funktioniert `SCRIPT_URL` in
`Index.html` nur, wenn die Seite tatsächlich über `doGet()` von Apps Script
ausgeliefert wird (z. B. nicht bei einem lokalen Öffnen der Datei).

## Hinweise zu Limits

- Apps Script hat eine Ausführungszeit-Grenze von 6 Minuten pro Aufruf; die
  Parallelität ist bewusst auf 3 gleichzeitige Uploads begrenzt, um innerhalb
  der Kontingente für gleichzeitige Ausführungen zu bleiben.
- Die Dateigröße ist auf 50 MB begrenzt (anpassbar in
  `MAX_FILE_SIZE_BYTES` in `Code.gs` und `MAX_FILE_SIZE_MB` in `Index.html`),
  um innerhalb der Apps-Script-Quotas zu bleiben. Abgelehnte Dateien (falscher
  Typ oder zu groß) werden dem Gast mit Begründung angezeigt statt
  stillschweigend übersprungen zu werden.
- Bei sehr vielen gleichzeitigen Uploads (z. B. viele Gäste zeitgleich)
  gelten die täglichen Apps-Script-Kontingente für private Google-Konten.
