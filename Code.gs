var ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence'
];

var MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Foto Upload')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Uploads a single base64-encoded image into the Drive folder configured
 * via the DRIVE_FOLDER_ID script property. Called from Index.html through
 * google.script.run, once per selected file.
 */
function uploadFile(base64Data, fileName, mimeType) {
  if (ALLOWED_MIME_TYPES.indexOf(mimeType) === -1) {
    throw new Error('Nicht unterstütztes Dateiformat.');
  }

  var decoded = Utilities.base64Decode(base64Data);
  if (decoded.length > MAX_FILE_SIZE_BYTES) {
    throw new Error('Datei ist größer als ' + (MAX_FILE_SIZE_BYTES / (1024 * 1024)) + ' MB.');
  }

  var folderId = PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID');
  if (!folderId) {
    throw new Error('DRIVE_FOLDER_ID ist nicht als Script Property gesetzt.');
  }

  var blob = Utilities.newBlob(decoded, mimeType, fileName);
  var folder = DriveApp.getFolderById(folderId);
  var file = folder.createFile(blob);

  return { fileId: file.getId(), fileName: fileName };
}
