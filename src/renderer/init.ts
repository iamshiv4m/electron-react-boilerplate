import { app, ipcMain, IpcMainEvent } from 'electron';
import { SerialPort, SerialPortOpenOptions } from 'serialport';
import { exec } from 'child_process';
import isElevated from 'is-elevated';

let MAX_BUFFER = 134217728;

async function init(execName: string, callback: () => void) {
  app.on('ready', async () => {
    const gotTheLock = app.requestSingleInstanceLock();
    try {
      await sleep(500);
      if (!gotTheLock) {
        app.quit();
      } else {
        const isElevatedResult = true; // await isElevated();
        if (isElevatedResult) {
          setupSerialPort();
          // callback();
        } else {
          const command = [
            '/usr/bin/pkexec',
            'env',
            'DISPLAY=$DISPLAY',
            'XAUTHORITY=$XAUTHORITY',
            '/bin/bash -c "echo SUDOPROMPT ; ' + execName + '"'
          ].join(' ');

          exec(command, { encoding: 'utf-8', maxBuffer: MAX_BUFFER }, (_error, _stdout, _stderr) => {
            app.quit();
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  });
}

async function portList() {
  try {
    const list = await SerialPort.list();
    return list;
  } catch (error) {
    console.log(error, 'ERROR');
    return [];
  }
}

let classKeySerialPort: SerialPort | undefined;

function setupSerialPort() {
  ipcMain.on('serialport', (event: IpcMainEvent, data: { type: string; payload?: any }) => {
    switch (data.type) {
      case 'open':
        portList().then((ports) => {
          console.log('ports', ports);
          for (const port of ports) {
            if (port.vendorId === undefined) {
              continue;
            }
            console.log('port vendorId: ' + port.vendorId);
            if (
              port.vendorId === '1915' &&
              (port.productId === '521a' || port.productId === '521A' || port.productId === 'c00a' || port.productId === 'C00A')
            ) {
              console.log('path', port.path);
              classKeySerialPort = new SerialPort({
                path: port.path,
                baudRate: 115200,
                dataBits: 8,
                parity: 'none',
              } as SerialPortOpenOptions<any>);

              classKeySerialPort
                .on('open', () => {
                  event.sender.send('serialport', { type: 'opened' });
                })
                .on('close', () => {
                  console.log('close');
                  event.sender.send('serialport', { type: 'closed' });
                })
                .on('error', (error) => {
                  console.log('error');
                  console.error(error);
                  event.sender.send('serialport', {
                    type: 'error',
                    payload: { message: error.message },
                  });
                })
                .on('data', (data) => {
                  console.log('data received');
                  console.log(data);
                  console.log('data received finished');
                  event.sender.send('serialport', {
                    type: 'data',
                    payload: data,
                  });
                });
              return;
            }
          }
          console.log('device not found');
          event.sender.send('serialport', {
            type: 'error',
            payload: { message: 'device not found' },
          });
        });
        break;
      case 'close':
        if (classKeySerialPort && classKeySerialPort.isOpen) {
          classKeySerialPort.close();
        }
        break;
      case 'write':
        if (classKeySerialPort && classKeySerialPort.isOpen) {
          const writeBuffer = Buffer.from(data.payload);
          classKeySerialPort.write(writeBuffer, (err) => {
            if (err) {
              console.log('Error while sending message : ' + err);
            } else {
              console.log('Message sent successfully');
            }
          });
        }
        break;
    }
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default init;
export { portList };





