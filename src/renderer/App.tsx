import React, { useEffect } from 'react';
import { listenClickerEvent, portList } from './ClickerSDk';

const App: React.FC = () => {
  let count = 1;

  // useEffect(() => {
  //   const script = document.createElement('script');
  //   script.src = '/hello.js';
  //   script.async = true;
  //   document.body.appendChild(script);

  //   return () => {
  //     document.body.removeChild(script);
  //   };
  // }, []);

  // useEffect(() => {
  //   const fetchPortsAndListen = async () => {
  //     const ports = await portList() as any;
  //     const finalPort = [];

  //     for (const port of ports) {
  //       if (!port.vendorId) {
  //         continue;
  //       }
  //       finalPort.push(port);
  //     }

  //     listenClickerEvent((eventNum: any, deviceID: any) => {
  //       console.log(count);
  //       console.log(deviceID);
  //       console.log(eventNum);
  //       // $('.tbody').prepend('<tr><th scope="row">' + (count++) + '</th><td>' + deviceID + '</td><td>' + eventNum + '</td</tr>');
  //     });
  //   };

  //   // fetchPortsAndListen();
  // }, []);

  return (
    <div>
      <h1>Hello World!</h1>
      We are using Node.js <span id="node-version"></span>, Chromium{' '}
      <span id="chrome-version"></span>, Electron{' '}
      <span id="electron-version"></span>, and Serialport{' '}
      <span id="serialport-version"></span>
      <h1 className="center" id="h1">
        Listening Clicker!
      </h1>
      <br />
      <button
        id="startListening"
        className="btn btn-info"
        style={{ fontSize: '13px' }}
      >
        Stop Listening!
      </button>
      <button
        id="register"
        className="btn btn-info"
        style={{ fontSize: '13px' }}
      >
        Click this button For Register!
      </button>
      <br />
      <br />
      <table className="table">
        <thead className="thead-dark">
          <tr>
            <th scope="col">No.</th>
            <th scope="col">Device Id</th>
            <th scope="col">Clicked Value</th>
          </tr>
        </thead>
        <tbody className="tbody"></tbody>
      </table>
      <div id="myModal" className="modal">
        <div className="modal-content">
          <p id="registerKey"></p>
        </div>
      </div>
    </div>
  );
};

export default App;
