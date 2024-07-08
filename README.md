## 1. Initial Setup
    1.	Clone the electron-react-boilerplate: 

    git clone --depth 1 --branch main https://github.com/electron-react-boilerplate/electron-react-boilerplate.git your-project-name

    2.	Navigate to the project directory:

    cd your-project-name

    3.	Install dependencies:

    npm install

## 2. Integrating RemoteControl Service
    1.  Install SerialPort:
	  npm install serialport
    npm install --save-dev @types/serialport

    2.  Create remoteControl.ts in src/main directory.

## 3. Updating Main Process
    1. Import RemoteControlService
    2. Set up IPC handlers
          Ex: ipcMain.on('serialport', () => {  });

## 4. Updating Preload Script
    1. Open src/main/preload.ts
    2. Expose RemoteControl methods:
    contextBridge.exposeInMainWorld('electron', 
      remoteControl: {
      open: () => ipcRenderer.invoke('remote-control-open'), 
      close: () => ipcRenderer.invoke('remote-control-close'), 
      // Add more methods as needed }, 
    ); 
## 5. Updating TypeScript Definitions
    1. Create or update src/renderer/electron.d.ts: 
    export interface IElectronAPI {
    
      remoteControl: {
        open: () => Promise<boolean>;
        close: () => Promise<boolean>;
        // Add more method signatures as needed
      };
    }

    declare global {
      interface Window {
        electron: IElectronAPI;
      }
    }

## 6. Call the exposed methods from your React component.
