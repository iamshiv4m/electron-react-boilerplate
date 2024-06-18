import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { SerialPort } from 'serialport';
import { init, listenClickerEvent } from '../Clicker-SDK';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

// Function to create the main application window
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

  mainWindow.loadURL(resolveHtmlPath('index.html'));

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

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Listen for 'update-event' messages from renderer process
  ipcMain.on('update-event', (event, args) => {
    const { deviceID, eventNum, index } = args;
    console.log(deviceID, eventNum, index);
    // Update your UI here using deviceID, eventNum, and index
    // Example:
    // mainWindow?.webContents.send('some-message-to-renderer', { deviceID, eventNum, index });
  });

  // Initialize your application
  init();

  // Remove this if your app does not use auto updates
  new AppUpdater();
};

// Handle serial port requests
ipcMain.handle('open-serial-port', async (event, portPath) => {
  try {
    const ports = await SerialPort.list(); // Getting the list of available serial ports
    const finalPort = ports.filter(port => !!port.vendorId); // Filter ports with vendorId

    // Iterate over filtered ports
    finalPort.forEach((port, index) => {
      listenClickerEvent((eventNum:any, deviceID:any) => {
        console.log(deviceID,'sss');
        console.log(eventNum);
        mainWindow?.webContents.send('update-event', { deviceID, eventNum, index });
      });
    });

    return finalPort; // Return the list of valid ports
  } catch (error) {
    console.error('Error opening serial port:', error);
    return { success: false, message: error };
  }
});

// Application lifecycle events
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
