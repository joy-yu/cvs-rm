onmessage = function(o) {
  var timeArray = o.data.timeArray;
  var trackArray = o.data.trackArray;
  var step = o.data.step;

  for (var i = 0, len = timeArray.length; i < len; i++) {

    if (step - timeArray[i] > 0 || step - timeArray[i][0] > timeArray[i][1]) {
      timeArray.shift();
      trackArray.shift();
    } else {
      break;
    }
  }
  postMessage({
    timeArray,
    trackArray
  });
};
