/** Trigger a file download for an in-memory Blob (shared by TXT / JSON exports). */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyPlainText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export function downloadTextAsFile(
  content: string,
  filename = `transcription-${Date.now()}.txt`
): void {
  triggerBlobDownload(new Blob([content], { type: 'text/plain' }), filename);
}

export function downloadJsonAsFile(
  data: unknown,
  filename = `transcription-${Date.now()}.json`
): void {
  triggerBlobDownload(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    filename
  );
}
