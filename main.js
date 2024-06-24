const path = require('path');
const { app, BrowserWindow, shell, ipcMain, ipcRenderer } = require('electron');
// const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
// const MenuBuilder = require('./src/main/menu');
// const { resolveHtmlPath } = require('./src/main/util.ts');
const { init, listenClickerEvent, portList, stopListening } = require('./src/ClickerSDk');
const { register } = require('./src/ClickerSDk/register');

let mainWindow = null;

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

ipcMain.on('ipc-example', async (event, arg) => {
    const msgTemplate = (pingPong) => `IPC test: ${pingPong}`;
    console.log(msgTemplate(arg));
    event.reply('ipc-example', msgTemplate('pong'));
  });

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
  
    const getAssetPath = (...paths) => {
      return path.join(RESOURCES_PATH, ...paths);
    };
  
    mainWindow = new BrowserWindow({
      show: false,
      width: 1024,
      height: 728,
      icon: getAssetPath('icon.png'),
      webPreferences: {
        preload: app.isPackaged
          ? path.join(__dirname, './erb/dll/preload.js')
          : path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      },
    });
  
    mainWindow.loadURL(path.join(__dirname, 'index.html'));
  
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
  
    // const menuBuilder = new MenuBuilder(mainWindow);
    // menuBuilder.buildMenu();
  
    // Open urls in the user's browser
    mainWindow.webContents.setWindowOpenHandler((edata) => {
      shell.openExternal(edata.url);
      return { action: 'deny' };
    });
  
    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    // new AppUpdater();
  };
  
  /**
   * Add event listeners...
   */
  // ipcMain.handle('get-port-list', async () => {
  //   try {
  //     const ports = await portList();
  //     const finalPort = ports.filter((port) => port.vendorId);
  //     console.log("final port", finalPort);
  //     return finalPort;
  //   } catch (error) {
  //     console.log(error, 'ERROR');
  //     return [];
  //   }
  // });
  
  // ipcMain.on('start-listening', (event, count) => {
  //   console.log("listen", event, count,)
  //   listenClickerEvent((eventNum, deviceID) => {
  //     console.log(count);
  //     console.log(deviceID);
  //     console.log(eventNum);
  //     event.sender.send('clicker-event', { count, eventNum, deviceID });
  //   });
  // });
  
  // ipcMain.on('stop-listening', () => {
  //   stopListening();
  // });
  
  // ipcMain.handle('register', async (classNum, studentNum, clickerNum) => {
  //   return await register(classNum, studentNum, clickerNum);
  // });
  
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
      createWindow();
      app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) createWindow();
      });
    })
    .catch(console.log);

    init();