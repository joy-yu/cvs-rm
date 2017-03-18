  onmessage = function(o) {

    var step = o.data.step + 17;

    postMessage({
      step
    });
  }
