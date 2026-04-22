import { ipcMain } from 'electron';
import { storage } from '../services/storage.js';

export function registerIpcHandlers() {
  ipcMain.handle('settings:getOpenAIKey', () => storage.getOpenAIKey());
  ipcMain.handle('settings:setOpenAIKey', (_e, key: string) => {
    if (typeof key !== 'string' || key.length === 0) {
      throw new Error('Invalid key');
    }
    storage.setOpenAIKey(key);
  });
  ipcMain.handle('settings:clearOpenAIKey', () => storage.clearOpenAIKey());
  ipcMain.handle('settings:hasOpenAIKey', () => storage.hasOpenAIKey());
}
