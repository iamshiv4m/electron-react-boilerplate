// src/global.d.ts
interface ClickerAPI {
  stopListening: () => void;
  portList: () => Promise<any>;
  listenClickerEvent: (
    callback: (eventNum: number, deviceID: string) => void,
  ) => void;
  register: (
    classNum: number,
    studentNum: number,
    clickerNum: number,
  ) => Promise<string>;
}

interface Window {
  api: ClickerAPI;
}
