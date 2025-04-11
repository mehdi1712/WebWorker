self.onmessage = function (e) {
    const { imageData, filter } = e.data;
    const data = imageData.data;
    const totalPixels = data.length / 4;
    let chunkSize = 10000;
    let offset = 0;
  
    function applyFilter(i) {
      const idx = i * 4;
      let r = data[idx];
      let g = data[idx + 1];
      let b = data[idx + 2];
  
      switch (filter) {
        case 'grayscale':
          const avg = (r + g + b) / 3;
          r = g = b = avg;
          break;
        case 'sepia':
          const tr = 0.393*r + 0.769*g + 0.189*b;
          const tg = 0.349*r + 0.686*g + 0.168*b;
          const tb = 0.272*r + 0.534*g + 0.131*b;
          r = Math.min(255, tr);
          g = Math.min(255, tg);
          b = Math.min(255, tb);
          break;
        case 'invert':
          r = 255 - r;
          g = 255 - g;
          b = 255 - b;
          break;
        case 'none':
        default:
          break;
      }
  
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
    }
  
    function processChunk() {
      const max = Math.min(offset + chunkSize, totalPixels);
      for (let i = offset; i < max; i++) {
        applyFilter(i);
      }
  
      offset += chunkSize;
  
      self.postMessage({
        type: 'partial',
        imageData: imageData,
      });
  
      if (offset < totalPixels) {
        setTimeout(processChunk, 10);
      } else {
        self.postMessage({ type: 'done' });
      }
    }
  
    processChunk();
  };
  