import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { Channels } from '../main/preload';
import '../../global';
import { isWindowDefined } from '../../global';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: string, ...args: unknown[]): void;
        on(channel: string, func: (...args: unknown[]) => void): () => void;
        once(channel: string, func: (...args: unknown[]) => void): void;
        invoke(channel: string, ...args: unknown[]): Promise<unknown>;
      };
    };
  }
}
function Hello() {
  const [clickerEvents, setClickerEvents] = useState<any[]>([]);

  useEffect(() => {
    console.log(window.navigator.userAgent.includes('Electron'), 'checlk');

    // Function to open the serial port
    const openSerialPort = async () => {
      try {
        if (typeof window !== 'undefined' && window.electron) {
          const result = await window.electron.ipcRenderer.invoke(
            'open-serial-port',
            '/dev/tty-usbserial1',
          );

          if (!result || !Array.isArray(result)) {
            throw new Error('Invalid port list returned');
          }

          const finalPort: any[] = result.filter((port) => port.vendorId);
          console.log(finalPort, 'device');
          console.log(result);
        }
      } catch (error) {
        console.error('Error opening serial port:', error);
      }
    };

    openSerialPort();

    // IPC listener for clicker events
    const handleUpdateEvent = (event: any, args: any) => {
      console.log('Received update-event:', args);
      setClickerEvents((prevEvents) => [...prevEvents, args]);
    };

    if (typeof window !== 'undefined' && window.electron) {
      window.electron.ipcRenderer.on(
        'update-event' as Channels,
        handleUpdateEvent,
      );
    }

    // Cleanup the effect
    // return () => {
    //   if (typeof window !== 'undefined' && window.electron) {
    //     window.electron.ipcRenderer.removeListener('update-event', handleUpdateEvent);
    //   }
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
      <div>
        <h2>Clicker Events</h2>
        <ul>
          {clickerEvents.map((event, index) => (
            <li key={index}>
              Device ID: {event.deviceID}, Event Number: {event.eventNum},
              Index: {event.index}
            </li>
          ))}
        </ul>
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
