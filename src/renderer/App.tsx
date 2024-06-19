import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    electron: {
      getPortList: () => Promise<any>;
      startListening: () => void;
      stopListening: () => void;
      onPortList: (callback: (ports: any) => void) => void;
      onClickerEvent: (callback: (data: any) => void) => void;
      register: (
        classNum: number,
        studentNum: number,
        clickerNum: number,
      ) => Promise<string>;
    };
  }
}

const App: React.FC = () => {
  const [ports, setPorts] = useState<any[]>([]);
  const [count, setCount] = useState(1);

  useEffect(() => {
    async function fetchPorts() {
      try {
        const portList = await window.electron.getPortList();
        setPorts(portList);
      } catch (error) {
        console.error('Error fetching ports:', error);
      }
    }

    fetchPorts();
  }, []);
  console.log(ports, 'port');

  useEffect(() => {
    window.electron.onClickerEvent((data) => {
      console.log('data: ', data);
      console.log(data.count);
      console.log(data.deviceID);
      console.log(data.eventNum);
      const tbody = document.querySelector('.tbody');
      if (tbody) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
          <th scope="row">${data.count}</th>
          <td>${data.deviceID}</td>
          <td>${data.eventNum}</td>
        `;
        tbody.prepend(newRow);
      }
      setCount(data.count + 1);
    });
  }, [count]);

  const handleStartListening = () => {
    window.electron.startListening();
  };

  return (
    <div>
      <h1>Serial Port List</h1>
      <ul>
        {ports.map((port, index) => (
          <li key={index}>
            {`Path: ${port.path}, Manufacturer: ${port.manufacturer}, Serial Number: ${port.serialNumber}, Vendor ID: ${port.vendorId}, Product ID: ${port.productId}`}
          </li>
        ))}
      </ul>
      {/* <button id="startListening" onClick={handleStartListening}>
        Start Listening
      </button> */}
      <table>
        <tbody className="tbody"></tbody>
      </table>
    </div>
  );
};

export default App;
