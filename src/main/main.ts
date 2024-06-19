console.log('Starting main process...');

import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { init, portList, stopListening } from '../ClickerSDk';
import { register } from '../ClickerSDk/register';
import { listenClickerEvent } from '../ClickerSDk';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

console.log('Setting up IPC handlers...');

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  console.log('Creating browser window...');

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

  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  new AppUpdater();
};

console.log('Adding event listeners...');

ipcMain.handle('get-port-list', async () => {
  try {
    console.log('Fetching port list...');
    let count = 1;
    const ports: any = await portList();
    console.log('ports: ', ports);
    const finalPort = [];
    for (const port of ports) {
      if (!port.vendorId) {
        continue;
      }
      finalPort.push(port);
      console.log('hello world');
      listenClickerEvent((eventNum: any, deviceID: any) => {
        console.log(count);
        console.log(deviceID);
        console.log(eventNum);
        /*  $('.tbody').prepend(
              '<tr><th scope="row">' +
                count++ +
                '</th><td>' +
                deviceID +
                '</td><td>' +
                eventNum +
                '</td</tr>',
            ); */
      });
    }
  } catch (error) {
    console.log(error, 'ERROR');
    return [];
  }
});

ipcMain.on('start-listening', (event, count) => {
  console.log('Start listening...');
  listenClickerEvent((eventNum: any, deviceID: any) => {
    console.log(count);
    console.log(deviceID);
    console.log(eventNum);
    event.sender.send('clicker-event', { count, eventNum, deviceID });
  });
});

ipcMain.on('stop-listening', () => {
  console.log('Stop listening...');
  stopListening();
});

ipcMain.handle(
  'register',
  async (event, { classNum, studentNum, clickerNum }) => {
    console.log('Registering clicker...');
    return await register(classNum, studentNum, clickerNum);
  },
);

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    console.log('Quitting app...');
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    console.log('init');
    init();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

console.log(init, 'check here');

console.log('hello world!');
