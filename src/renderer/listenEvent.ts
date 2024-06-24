import rcControlService from "./remoteControl";

type CallbackType = (eventNum: number, deviceID: string) => void;

let callback: CallbackType | undefined;

function onRemoteControlData(data: any): void {
  switch (data.type) {
    case "clicked":
      const deviceID: string = data.payload.id;
      const eventNum: number = data.payload.value;
      if (callback) {
        callback(eventNum, deviceID);
      }
      break;
    default:
      break;
  }
}

function init(): void {
  rcControlService.open();
  rcControlService.subscribeEvents((data: any) => onRemoteControlData(data));
}

function stopListening(): void {
  rcControlService.unsubscribeEvents();
  rcControlService.close();
}

function listenClickerEvent(callbackArg: CallbackType): void {
  init();
  callback = callbackArg;
}

export { listenClickerEvent, stopListening };
