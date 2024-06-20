const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ElectronService', {
  ipcRenderer,
});

contextBridge.exposeInMainWorld('electron', {
  listSerialPorts: () => ipcRenderer.invoke('list-serial-ports'),
  registerClicker: (classNum: any, studentNum: any, clickerNum: any) =>
    ipcRenderer.invoke('register-clicker', classNum, studentNum, clickerNum),
  startListening: () => ipcRenderer.send('start-listening'),
  stopListening: () => ipcRenderer.invoke('stop-listening'),
  onClickerEvent: (callback: any) =>
    ipcRenderer.on('clicker-event', (event, data) =>
      callback(data.eventNum, data.deviceID),
    ),
});
