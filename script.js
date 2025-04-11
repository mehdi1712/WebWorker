const imageInput = document.getElementById('imageInput');
const originalCanvas = document.getElementById('originalCanvas');
const processedCanvas = document.getElementById('canvas');
const ctxOriginal = originalCanvas.getContext('2d');
const ctxProcessed = processedCanvas.getContext('2d');

const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const filterSelect = document.getElementById('filterSelect');

const worker = new Worker('worker.js');

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    const fixedWidth = 512;
    const scale = fixedWidth / img.width;
    const height = img.height * scale;

    originalCanvas.width = fixedWidth;
    originalCanvas.height = height;
    processedCanvas.width = fixedWidth;
    processedCanvas.height = height;

    ctxOriginal.drawImage(img, 0, 0, fixedWidth, height);
    processedCanvas.classList.remove("show");
    originalCanvas.classList.add("show");
    downloadBtn.style.display = "none";

    const imageData = ctxOriginal.getImageData(0, 0, fixedWidth, height);
    const filter = filterSelect.value;
    worker.postMessage({ imageData, filter });
  };
  img.src = URL.createObjectURL(file);
});

worker.onmessage = (e) => {
  if (e.data.type === 'partial') {
    ctxProcessed.putImageData(e.data.imageData, 0, 0);
  } else if (e.data.type === 'done') {
    processedCanvas.classList.add("show");
    downloadBtn.style.display = "inline-block";
  }
};

resetBtn.addEventListener('click', () => {
  ctxOriginal.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
  ctxProcessed.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
  originalCanvas.classList.remove("show");
  processedCanvas.classList.remove("show");
  imageInput.value = "";
  downloadBtn.style.display = "none";

});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'processed-image.png';
  link.href = processedCanvas.toDataURL('image/png');
  link.click();
});
