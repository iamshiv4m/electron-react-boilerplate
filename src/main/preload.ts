import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getPortList: () => ipcRenderer.invoke('get-port-list'),
  startListening: (count: number) => {
    console.log('ipc event count', ipcRenderer, count)
    ipcRenderer.invoke('start-listening', count)
  },
  stopListening: () => ipcRenderer.send('stop-listening'),
  onClickerEvent: (callback: (data: any) => void) =>
    ipcRenderer.on('clicker-event', (_, data) => callback(data)),
  register: (classNum: number, studentNum: number, clickerNum: number) =>
    ipcRenderer.invoke('register', classNum, studentNum, clickerNum),
  ipcRenderer: ipcRenderer,
});
