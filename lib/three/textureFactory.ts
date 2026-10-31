import * as THREE from 'three';

/**
 * Procedural texture generator for ECOFARM CIRCULAR 3D Industrial Visualization.
 * Strictly zero external file dependencies to prevent any 404 assets.
 */

export function createConcretePavementTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Base industrial concrete color
  ctx.fillStyle = '#6b7280';
  ctx.fillRect(0, 0, 512, 512);

  // Concrete noise and speckles
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 28;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Expansion joint seams / modular slab grid
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, 504, 504);
  ctx.beginPath();
  ctx.moveTo(256, 0);
  ctx.lineTo(256, 512);
  ctx.moveTo(0, 256);
  ctx.lineTo(512, 256);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createHazardStripesTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#facc15'; // Safety Yellow
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#18181b'; // Industrial Black
  ctx.beginPath();
  const stripeWidth = 32;
  for (let x = -256; x < 512; x += stripeWidth * 2) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x + stripeWidth, 0);
    ctx.lineTo(x + stripeWidth + 256, 256);
    ctx.lineTo(x + 256, 256);
    ctx.closePath();
  }
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createSolarPanelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Deep dark blue silicon anti-reflective coating
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 512);

  // 6x10 solar wafer cells
  const cols = 6;
  const rows = 10;
  const cellW = 512 / cols;
  const cellH = 512 / rows;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const x = c * cellW + 1.5;
      const y = r * cellH + 1.5;
      const w = cellW - 3;
      const h = cellH - 3;

      // Dark blue gradient per cell
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(0.5, '#0f2744');
      grad.addColorStop(1, '#0c1a2e');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);

      // Fine silver busbars
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.3, y);
      ctx.lineTo(x + w * 0.3, y + h);
      ctx.moveTo(x + w * 0.7, y);
      ctx.lineTo(x + w * 0.7, y + h);
      ctx.stroke();

      // Ultra-fine micro fingers
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.3)';
      ctx.lineWidth = 0.5;
      for (let f = 4; f < h; f += 6) {
        ctx.beginPath();
        ctx.moveTo(x, y + f);
        ctx.lineTo(x + w, y + f);
        ctx.stroke();
      }
    }
  }

  // Aluminum frame border
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 508, 508);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createSandTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Golden quartz silica sand base
  ctx.fillStyle = '#d97706';
  ctx.fillRect(0, 0, 256, 256);

  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 45;
    data[i] = Math.min(255, Math.max(0, 217 + grain));
    data[i + 1] = Math.min(255, Math.max(0, 119 + grain * 0.8));
    data[i + 2] = Math.min(255, Math.max(0, 20 + grain * 0.5));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createCarbonBiocharTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, 256, 256);

  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 35;
    const v = Math.min(255, Math.max(0, 24 + grain));
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createLabelTexture(text: string, sub: string = ''): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Industrial metallic sign badge
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 504, 120);

  // Left color accent bar
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(8, 8, 20, 112);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 36px monospace';
  ctx.fillText(text, 40, 54);

  if (sub) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px sans-serif';
    ctx.fillText(sub, 40, 96);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createIndustrialChequerPlateTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#475569';
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = '#64748b';
  // Diamond tread pattern
  for (let x = 16; x < 128; x += 32) {
    for (let y = 16; y < 128; y += 32) {
      ctx.beginPath();
      ctx.ellipse(x, y, 9, 3, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(x + 16, y + 16, 9, 3, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
