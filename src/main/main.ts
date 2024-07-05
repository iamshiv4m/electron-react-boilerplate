/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import {SerialPort} from 'serialport';
// import { listenClickerEvent } from '../renderer/listenEvent';
// import { stopListening } from '../renderer/listenEvent';
// import { register } from '../renderer/ClickerSDk/register';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
var classKeySerialPort;

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
      sandbox: false,
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

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    ipcMain.on('serialport', (event, data) => {
      switch (data.type) {
          case 'open':
              SerialPort.list().then((ports) => {
                      console.log('ports:', ports)
                      for (var port of ports) {
                          console.log('port vendorId: ' + port.vendorId)
                          if (port.vendorId === '1915' && ((port.productId === '521a' || port.productId === '521A') || (port.productId === 'c00a' || port.productId === 'C00A'))) {
                              classKeySerialPort = new SerialPort({
                                  path: port.path,
                                  baudRate: 115200,
                                  dataBits: 8,
                                  parity: 'none'
                              });
  
                              classKeySerialPort
                                  .on('open', () => {
                                      event.sender.send('serialport', { type: 'opened' });
                                  })
                                  .on('close', () => {
                                      console.log('close')
                                      event.sender.send('serialport', { type: 'closed' });
                                  })
                                  .on('error', (error) => {
                                      console.log('error')
                                      console.error(error);
                                      event.sender.send('serialport', { type: 'error', payload: { message: error.message } });
                                  })
                                  .on('data', (data) => {
                                      console.log("data received")
                                      console.log(data)
                                      console.log("data received finished")
                                      event.sender.send('serialport', { type: 'data', payload: data });
                                  });
  
                              if (process.argv.includes('--serialport-mock')) {
                                  global.classKeySerialPort = classKeySerialPort;
                              }
                              return;
                          }
                      }
                      console.log('device not found')
                      event.sender.send('serialport', { type: 'error', payload: { message: 'device not found' } });
                  
              }).catch((error) => {
                event.sender.send('serialport', { type: 'error', payload: { message: error.message } });
              });;
              break;
          case 'close':
              if (classKeySerialPort && classKeySerialPort.isOpen) {
                  classKeySerialPort.close();
              }
              break;
          case 'write':
              if (classKeySerialPort && classKeySerialPort.isOpen) {
                  var writeBuffer = Buffer.from(data.payload);
                  classKeySerialPort.write(writeBuffer, function (err, result) {
                      if (err) {
                          console.log('Error while sending message : ' + err);
                      }
                      if (result) {
                          console.log('Response received after sending message : ' + result);
                      }
                  })
              }
              break;
      }
  });
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);


