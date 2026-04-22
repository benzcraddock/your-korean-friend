import { contextBridge, ipcRenderer } from 'electron';

const api = {
  settings: {
    getOpenAIKey: (): Promise<string | null> =>
      ipcRenderer.invoke('settings:getOpenAIKey'),
    setOpenAIKey: (key: string): Promise<void> =>
      ipcRenderer.invoke('settings:setOpenAIKey', key),
    clearOpenAIKey: (): Promise<void> =>
      ipcRenderer.invoke('settings:clearOpenAIKey'),
    hasOpenAIKey: (): Promise<boolean> =>
      ipcRenderer.invoke('settings:hasOpenAIKey'),
  },
};

contextBridge.exposeInMainWorld('api', api);

export type Api = typeof api;
