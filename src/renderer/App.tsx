import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    electron: {
      getPortList: () => Promise<any>;
      startListening: (count: number) => void;
      onClickerEvent: (callback: (data: any) => void) => void;
      stopListening: () => void;
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
  const [registerKey, setRegisterKey] = useState('');
  const [isListening, setIsListening] = useState(false);

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

  useEffect(() => {
    window.electron.onClickerEvent((data) => {
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
    if (isListening) {
      window.electron.stopListening();
      setIsListening(false);
    } else {
      window.electron.startListening(count);
      setIsListening(true);
    }
  };

  const handleRegister = () => {
    window.electron.stopListening();
    setRegisterKey('');

    const handleWindowClick = (event: MouseEvent) => {
      if (registerKey !== 'Register is successful!') {
        window.electron.stopListening();
      }
      window.removeEventListener('click', handleWindowClick);
    };

    window.addEventListener('click', handleWindowClick);

    const classNum = 255;
    const studentNum = 255;
    const clickerNum = Math.floor(Math.random() * 4) + 2;
    setRegisterKey(`Press clicker number ${clickerNum}`);

    window.electron
      .register(classNum, studentNum, clickerNum)
      .then((clickerId) => {
        setRegisterKey('Register is successful!');
      });
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
      <button id="startListening" onClick={handleStartListening}>
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
      <button id="register" onClick={handleRegister}>
        Register
      </button>
      <div id="h1"></div>
      <div id="registerKey">{registerKey}</div>
      <table>
        <tbody className="tbody"></tbody>
      </table>
    </div>
  );
};

export default App;
