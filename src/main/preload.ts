import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getPortList: () => ipcRenderer.invoke('get-port-list'),
  startListening: () => ipcRenderer.send('start-listening'),
  stopListening: () => ipcRenderer.send('stop-listening'),
  onPortList: (callback: (ports: any) => void) =>
    ipcRenderer.on('port-list', (_, ports) => callback(ports)),
  onClickerEvent: (callback: (data: any) => void) =>
    ipcRenderer.on('clicker-event', (_, data) => callback(data)),
  register: (classNum: number, studentNum: number, clickerNum: number) =>
    ipcRenderer.invoke('register', { classNum, studentNum, clickerNum }),
});
