const rcControlService = require('./remoteControl');

let callback;

function onRemoteControlData(data) {
  switch (data.type) {
    case 'clicked':
      const deviceID = data.payload.id;
      const eventNum = data.payload.value;
      if (callback) {
        callback(eventNum, deviceID);
      }
      break;
    default:
      break;
  }
}

function init() {
  console.log('hey 2');
  rcControlService.open();
  rcControlService.subscribeEvents((data) => onRemoteControlData(data));
}

function stopListening() {
  rcControlService?.unsubscribeEvents();
  rcControlService?.close();
}

function listenClickerEvent(callbackArg) {
  console.log('hey 1');
  init();
  callback = callbackArg;
}

exports.listenClickerEvent = listenClickerEvent;
exports.stopListening = stopListening;
