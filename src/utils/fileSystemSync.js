import { generateExcelWorkbook, exportAndDownloadExcel } from './excelGenerator';

const STORAGE_KEY = 'neraca_puk_financial_data';
const AUTO_SAVE_KEY = 'neraca_puk_auto_save_enabled';

// In-memory file handle reference for File System Access API
let activeFileHandle = null;
let activeFileName = 'Laporan_Keuangan_PUK.xlsx';

export function isFileSystemAccessSupported() {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
}

export function getActiveFileName() {
  return activeFileName;
}

export function setActiveFileName(name) {
  activeFileName = name;
}

export function getActiveFileHandle() {
  return activeFileHandle;
}

export function setActiveFileHandle(handle, name) {
  activeFileHandle = handle;
  if (name) activeFileName = name;
}

/**
 * Open file picker using File System Access API
 */
export async function pickExcelFileWithHandle() {
  if (!isFileSystemAccessSupported()) {
    throw new Error('FILE_SYSTEM_API_NOT_SUPPORTED');
  }

  const [fileHandle] = await window.showOpenFilePicker({
    types: [
      {
        description: 'Excel Spreadsheet (*.xlsx, *.xls)',
        accept: {
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
          'application/vnd.ms-excel': ['.xls']
        }
      }
    ],
    multiple: false
  });

  const file = await fileHandle.getFile();
  activeFileHandle = fileHandle;
  activeFileName = file.name;

  return { file, fileHandle, fileName: file.name };
}

/**
 * Direct save back to original file if handle is present, otherwise fallback to download
 */
export async function saveFinancialDataToFile(monthlyData) {
  const wb = await generateExcelWorkbook(monthlyData);
  const buffer = await wb.xlsx.writeBuffer();

  if (activeFileHandle) {
    try {
      // Check if permission is granted
      const options = { mode: 'readwrite' };
      if (
        (await activeFileHandle.queryPermission(options)) === 'granted' ||
        (await activeFileHandle.requestPermission(options)) === 'granted'
      ) {
        const writable = await activeFileHandle.createWritable();
        await writable.write(buffer);
        await writable.close();
        saveToLocalStorage(monthlyData);
        return { success: true, method: 'direct_write', filename: activeFileName };
      }
    } catch (err) {
      console.warn('Direct file write failed, falling back to download:', err);
    }
  }

  // Fallback if no file handle or permission denied
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = activeFileName || 'Laporan_Keuangan_PUK.xlsx';
  a.click();
  URL.revokeObjectURL(a.href);

  saveToLocalStorage(monthlyData);
  return { success: true, method: 'download', filename: activeFileName };
}

/**
 * LocalStorage Helpers
 */
export function saveToLocalStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load from localStorage', e);
    return null;
  }
}

export function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear localStorage', e);
  }
}

export function getAutoSaveSetting() {
  try {
    const val = localStorage.getItem(AUTO_SAVE_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function setAutoSaveSetting(enabled) {
  try {
    localStorage.setItem(AUTO_SAVE_KEY, String(enabled));
  } catch (e) {
    console.error('Failed to set auto save setting', e);
  }
}
