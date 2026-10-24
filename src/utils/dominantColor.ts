/**
 * Fast client-side dominant color extraction from an image using HTML5 Canvas
 */

const colorCache = new Map<string, string>();

export function extractDominantColor(img: HTMLImageElement): string {
  if (!img.src || colorCache.has(img.src)) {
    return colorCache.get(img.src) || 'rgba(192, 25, 44, 0.15)';
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 24;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return 'rgba(192, 25, 44, 0.15)';

    ctx.drawImage(img, 0, 0, 16, 24);
    const data = ctx.getImageData(0, 0, 16, 24).data;

    let rSum = 0;
    let gSum = 0;
    let bSum = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a < 128) continue;
      // Skip extreme dark or extreme bright pixels to get rich accent hue
      const brightness = (r + g + b) / 3;
      if (brightness < 20 || brightness > 235) continue;

      rSum += r;
      gSum += g;
      bSum += b;
      count++;
    }

    if (count === 0) {
      const fallback = 'rgba(192, 25, 44, 0.15)';
      colorCache.set(img.src, fallback);
      return fallback;
    }

    const avgR = Math.round(rSum / count);
    const avgG = Math.round(gSum / count);
    const avgB = Math.round(bSum / count);

    const result = `rgba(${avgR}, ${avgG}, ${avgB}, 0.18)`;
    colorCache.set(img.src, result);
    return result;
  } catch {
    // Cross-origin fallback
    const fallback = 'rgba(192, 25, 44, 0.15)';
    colorCache.set(img.src, fallback);
    return fallback;
  }
}
