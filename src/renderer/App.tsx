import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import { register } from '../Clicker-SDK/register';
import { listenClickerEvent } from '../Clicker-SDK';

function Hello() {
  useEffect(() => {
    const openSerialPort = async () => {
      try {
        const result = await window.electron.ipcRenderer.invoke(
          'open-serial-port',
          '/dev/tty-usbserial1'
        );

        if (!result || !Array.isArray(result)) {
          throw new Error('Invalid port list returned');
        }

        let count = 1;
        const finalPort: any[] = [];
        for (const port of result) {
          if (!port.vendorId) {
            continue;
          }
          finalPort.push(port);
        }

      // listenClickerEvent((eventNum: any, deviceID: any) => {
      //   console.log(count);
      //   console.log(deviceID);
      //   console.log(eventNum);
      // });

        console.log(finalPort, 'device');
        console.log(result);
      } catch (error) {
        console.error('Error opening serial port:', error);
      }
    };

    openSerialPort();

   

    // return () => {
    //   window.electron.ipcRenderer.removeListener('listen-clicker-event', handleClickerEvent);
    // };
  }, []);

  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <div className="Hello">
        <a
          href="https://electron-react-boilerplate.js.org/"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              📚
            </span>
            Read our docs
          </button>
        </a>
        <a
          href="https://github.com/sponsors/electron-react-boilerplate"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="folded hands">
              🙏
            </span>
            Donate
          </button>
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
