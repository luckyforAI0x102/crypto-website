const fileName = 'cases.json';
const lockName = 'case-desk/cases.json';

async function readCases(directory) {
  let handle;
  try {
    handle = await directory.getFileHandle(fileName);
  } catch (error) {
    if (error.name === 'NotFoundError') return [];
    throw error;
  }
  const file = await handle.getFile();
  // A first write interrupted before closing can leave an empty file.
  if (file.size === 0) return [];
  const records = JSON.parse(await file.text());
  if (!Array.isArray(records)) throw new Error('Invalid case log');
  return records;
}

function withCaseFile(mode, operation) {
  if (!navigator.storage?.getDirectory || !navigator.locks) {
    throw new Error('unsupported-storage');
  }
  return navigator.locks.request(lockName, { mode }, async () => {
    const directory = await navigator.storage.getDirectory();
    return operation(directory);
  });
}

export function saveCase(caseId) {
  if (!/^[0-9]{6}$/.test(caseId)) throw new Error('Invalid case ID');
  return withCaseFile('exclusive', async (directory) => {
    const records = await readCases(directory);
    if (records.some((record) => record.caseId === caseId)) return false;

    records.push({ caseId, savedAt: new Date().toISOString() });
    const handle = await directory.getFileHandle(fileName, { create: true });
    const stream = await handle.createWritable();
    try {
      await stream.write(JSON.stringify(records, null, 2) + '\n');
      await stream.close();
    } catch (error) {
      await stream.abort().catch(() => {});
      throw error;
    }
    return true;
  });
}

export async function downloadCases() {
  const records = await withCaseFile('shared', readCases);
  const blob = new Blob([JSON.stringify(records, null, 2) + '\n'], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}
