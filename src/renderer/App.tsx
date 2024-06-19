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
      ) => any;
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
        await window.electron.getPortList();
      } catch (error) {
        console.error('Error fetching ports:', error);
      }
    }

    fetchPorts();

    window.electron.onPortList((portList) => {
      setPorts(portList);
    });

    window.electron.onClickerEvent((data) => {
      console.log(data.eventNum, 'check');
      console.log(data.deviceID);
      const tbody = document.querySelector('.tbody');
      if (tbody) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
          <th scope="row">${count}</th>
          <td>${data.deviceID}</td>
          <td>${data.eventNum}</td>
        `;
        tbody.prepend(newRow);
      }
      setCount(count + 1);
    });
  }, [count]);

  const handleStartListening = () => {
    if (isListening) {
      window.electron.stopListening();
      setIsListening(false);
    } else {
      window.electron.startListening();
      setIsListening(true);
    }
  };

  const handleRegister = () => {
    console.log(window?.electron?.register(255, 255, 2 + 2), 'check');
    return;
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
      .then((clickerId: any) => {
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
