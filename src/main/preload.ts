import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron';
import RemoteControlService from './remoteControl';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send(channel: string, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: string, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: string, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  remoteControl: {
    open: () => RemoteControlService.open(),
    close: () => RemoteControlService.close(),
    subscribeEvents: (callback: (data: any) => void) => RemoteControlService.subscribeEvents(callback),
    unsubscribeEvents: () => RemoteControlService.unsubscribeEvents(),
    startRegister: (classNumber: number, number: number, registrationKey: number[]) => 
      RemoteControlService.startRegister(classNumber, number, registrationKey),
    finishRegister: () => RemoteControlService.finishRegister(),
  },
});
