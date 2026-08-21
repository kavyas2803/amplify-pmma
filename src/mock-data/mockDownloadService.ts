function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function triggerDummyDownload(filename: string) {
  // Minimal valid-looking placeholder blob; isolated here so it can be
  // swapped for a real presigned-URL download without touching callers.
  const content =
    'This is a placeholder file for the GL Tax Classification POC prototype.\r\n' +
    `Requested file: ${filename}\r\n`;
  const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadSourceFiles(runId: string, glFileName: string): Promise<void> {
  await delay(null);
  triggerDummyDownload(glFileName || `${runId}-source.xlsx`);
}

export async function downloadKpmgExcel(runId: string): Promise<void> {
  await delay(null);
  triggerDummyDownload(`KPMG_Tax_Classification_${runId}.xlsx`);
}
