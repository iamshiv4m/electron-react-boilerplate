import path from 'path';
import { app, BrowserWindow, shell, ipcMain, ipcRenderer } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { SerialPort } from 'serialport';
import { init, listenClickerEvent } from '../Clicker-SDK';
import * as $ from 'jquery';


class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

const createWindow = async () => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      contextIsolation: true,
      nodeIntegration: true,
    },
  });
  
  const indexPath = resolveHtmlPath('index.html');
  console.log('Loading index.html from:', indexPath); // Debugging line
  mainWindow.loadURL(indexPath);

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  ipcMain.on('update-event', (event, args) => {
    const { deviceID, eventNum, index } = args;

    console.log(deviceID, eventNum, index);
   
  });

  init();
  new AppUpdater();
};

ipcMain.handle('open-serial-port', async (event, portPath) => {
  try {
    const ports = await SerialPort.list();
    const finalPort = ports.filter(port => !!port.vendorId);

    finalPort.forEach((port, index) => {
      listenClickerEvent((eventNum:any, deviceID:any) => {
        console.log('Clicker Event Data:', { deviceID, eventNum, index });
        mainWindow?.webContents.send('update-event', { deviceID, eventNum, index });
      });
    });

    return finalPort;
  } catch (error) {
    console.error('Error opening serial port:', error);
    return { success: false, message: error };
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});
