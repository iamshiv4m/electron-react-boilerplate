export interface ElectronAPI {
    remoteControl: {
      open: () => boolean;
      close: () => boolean;
      subscribeEvents: (callback: (data: any) => void) => void;
      unsubscribeEvents: () => void;
      startRegister: (classNumber: number, number: number, registrationKey: number[]) => boolean;
      finishRegister: () => boolean;
    };
    ipcRenderer: {
        send: (channel: string, args: unknown[]) => void;
        on: (channel: string, func: (...args: unknown[]) => void) => (() => void) | undefined;
        once: (channel: string, func: (...args: unknown[]) => void) => void;
      };
  }
  
  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }