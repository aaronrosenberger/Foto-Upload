var ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
  'image/x-adobe-dng'
];

var MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

function doGet() {
  var template = HtmlService.createTemplateFromFile('Index');
  template.scriptUrl = ScriptApp.getService().getUrl();
  return template.evaluate()
    .setTitle('Foto Upload')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Receives a single photo as a raw binary POST body (sent via XHR from
 * Index.html, not through google.script.run), with the file name and MIME
 * type passed as query parameters. Sending the raw bytes directly - instead
 * of a base64 string through google.script.run - avoids the ~33% size
 * overhead of base64 and lets the client report real upload progress.
 */
function doPost(e) {
  var fileName = e.parameter.fileName;
  var mimeType = e.parameter.mimeType;

  if (!fileName || !mimeType) {
    return jsonError('Fehlende Parameter.');
  }
  if (ALLOWED_MIME_TYPES.indexOf(mimeType) === -1) {
    return jsonError('Nicht unterstütztes Dateiformat.');
  }

  var bytes = e.postData && e.postData.bytes;
  if (!bytes || bytes.length === 0) {
    return jsonError('Keine Daten empfangen.');
  }
  if (bytes.length > MAX_FILE_SIZE_BYTES) {
    return jsonError('Datei ist größer als ' + (MAX_FILE_SIZE_BYTES / (1024 * 1024)) + ' MB.');
  }

  var folderId = PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID');
  if (!folderId) {
    return jsonError('DRIVE_FOLDER_ID ist nicht als Script Property gesetzt.');
  }

  try {
    var blob = Utilities.newBlob(bytes, mimeType, fileName);
    var folder = DriveApp.getFolderById(folderId);
    var file = folder.createFile(blob);
    return jsonOutput({ fileId: file.getId(), fileName: fileName });
  } catch (err) {
    return jsonError(err.message || 'Fehler beim Hochladen.');
  }
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonError(message) {
  return jsonOutput({ error: message });
}
