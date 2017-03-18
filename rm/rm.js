(function(window, document) {

  var clientH = document.documentElement.clientHeight || document.body.clientHeight;
  var files = document.getElementById('uploadBtn');
  var startBtn = document.getElementById('startBtn');
  var stopBtn = document.getElementById('stopBtn');
  var player = new Audio();
  var reader = new FileReader();
  var timeArray = [];
  var trackArray = [];
  var stopRaf = null;


  function stopAll() {
    player.pause();
    cancelAnimationFrame(stopRaf)
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }

  function startAll() {
    player.play();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    dr();
  }

  startBtn.addEventListener('click', startAll);
  stopBtn.addEventListener('click', stopAll);
  player.addEventListener('ended', stopAll);
  files.addEventListener('click', stopAll);

  //imd数据加载初始化
  files.addEventListener('change', function() {
    var file = files.files[0];
    if (!file) return;

    step = 0;
    timeArray = [];
    trackArray = [];
    reader.readAsArrayBuffer(file);
    var fileName = file.name.split('_')[1] ? file.name.split('_')[0] : file.name.split('.')[0];
    player.src = '../' + fileName + '.mp3';


reader.addEventListener('load', function(e) {

      var buffer = reader.result;

      var totalTime = new Int32Array(buffer, 0, 1);
      console.log('总时长（毫秒）：', totalTime);

      var beats = new Int32Array(buffer, 4, 1);
      console.log('歌曲节拍数：', beats);

      var actionBuffer = buffer.slice(10 + 12 * beats);
      var actionNumber = new Int32Array(actionBuffer, 0, 1);
      console.log('歌曲动作数：', actionNumber)

      var acBuffer = actionBuffer.slice(4);
      var dataView;

      for (var i = 0; i < actionNumber; i++) {
        dataView = new DataView(acBuffer.slice(i * 11));

        if (dataView.getInt16(0, true) === 0 || dataView.getInt16(0, true) === 1) {
          timeArray.push(dataView.getInt32(2, true));
          trackArray.push(dataView.getInt8(6, true));

        } else if (dataView.getInt16(0, true) === 2) {
          timeArray.push([dataView.getInt32(2, true), dataView.getInt32(7, true)]);
          trackArray.push(dataView.getInt8(6, true));
        } else {
          continue;
        }
      }
      player.oncanplaythrough = function() {
        startBtn.disabled = false;
        stopBtn.disabled = true;
      }

      console.log(timeArray);
    });
});




  var btn = document.getElementById('btn');
  var draw = document.getElementById('draw');
  var ctx = draw.getContext('2d');
  var btW = 60;
  var btH = 24;
  var step = 0;
  draw.width = 290;
  draw.height = clientH;
  ctx.fillStyle = '#e0e5ad';

  var drawW = draw.getBoundingClientRect().width,
    drawH = draw.getBoundingClientRect().height;


  var arrWorker = new Worker('./rm/arrWorker.js');
  var stepWorker = new Worker('./rm/stepWorker.js');
  arrWorker.onmessage = function(o) {
    timeArray = o.data.timeArray;
    trackArray = o.data.trackArray;
  };
  stepWorker.onmessage = function(o) {
    step = o.data.step;
  };


  function dr() {
    ctx.clearRect(0, 0, drawW, clientH);
    arrWorker.postMessage({
      timeArray,
      trackArray,
      step
    });

    for (var i = 0, len = timeArray.length; i < len; i++) {

      if (step - timeArray[i] > -900) {
        ctx.drawImage(btn, trackArray[i] * drawW / 4+6, step - timeArray[i] + clientH - btH / 2, btW, btH);

      } else if (Array.isArray(timeArray[i])) {
        ctx.drawImage(btn, trackArray[i] * drawW / 4+6, step - timeArray[i][0] + clientH - btH / 2, btW, btH);
        ctx.fillRect(trackArray[i] * drawW / 4 + 21, step - timeArray[i][0] + clientH - timeArray[i][1] - btH / 2, btW / 2, timeArray[i][1]);

      } else {
        break;
      }
    }

    stepWorker.postMessage({
      step
    });
    
    stopRaf = requestAnimationFrame(dr);
  }



  //游戏键盘按钮事件
  var cf = document.querySelector('.confirm-section');
  var keyArr = [68, 70, 75, 76];
  document.onkeydown = function(e) {
    keyArr.forEach(function(v, i) {
      if (e.keyCode === v) {
        cf.children[i].classList.remove('hidden');
      }
    });
  }
  document.onkeyup = function(e) {
    keyArr.forEach(function(v, i) {
      if (e.keyCode === v) {
        cf.children[i].classList.add('hidden');
      }
    });
  }



})(window, document);
