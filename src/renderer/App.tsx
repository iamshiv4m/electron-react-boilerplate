import React, { useEffect, useState } from 'react';

const App: React.FC = () => {
  const [ports, setPorts] = useState<any[]>([]);
  const [count, setCount] = useState(1);
  const [registerKey, setRegisterKey] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    
  }, []);

  const handleStartListening = () => {
    if (isListening) {
      setIsListening(false);
      window.electron.remoteControl.unsubscribeEvents();
      window.electron.remoteControl.close();
    } else {
      setIsListening(true);
      // Open the remote control connection
    console.log('Opening remote control', window.electron.remoteControl)
    window.electron.remoteControl.open();

    // Subscribe to events
    window.electron.remoteControl.subscribeEvents((data: any) => {
      console.log('Received data:', data);
    });

    // Cleanup on component unmount
    return () => {
      window.electron.remoteControl.unsubscribeEvents();
      window.electron.remoteControl.close();
    };
    }
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
      <button id="register" onClick={() => {}}>
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


