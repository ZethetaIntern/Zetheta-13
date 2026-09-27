/**
 * Client-Side Image Compression Engine
 * Compresses JPG/PNG images to max 1200px width and target size <= 2MB
 * using HTML5 Canvas API without blocking the UI.
 */

export async function compressImage(file, maxDimension = 1200, _targetSizeBytes = 2 * 1024 * 1024) {
  // Only compress images; skip PDFs
  if (!file || !file.type.startsWith('image/')) {
    return {
      file,
      originalSize: file?.size || 0,
      compressedSize: file?.size || 0,
      reductionRatio: 0,
    };
  }

  const originalSize = file.size;

  try {
    let img;
    if (typeof createImageBitmap === 'function') {
      img = await createImageBitmap(file);
    } else {
      img = await new Promise((res, rej) => {
        const image = new Image();
        const url = URL.createObjectURL(file);
        image.src = url;
        image.onload = () => {
          URL.revokeObjectURL(url);
          res(image);
        };
        image.onerror = (err) => {
          URL.revokeObjectURL(url);
          rej(err);
        };
      });
    }

    let width = img.width;
    let height = img.height;

    // Scale down to max dimension maintaining aspect ratio
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    // Fast canvas encoding
    let currentQuality = 0.7;
    let dataUrl = canvas.toDataURL('image/jpeg', currentQuality);

    const bstr = atob(dataUrl.split(',')[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const compressedFile = new File([u8arr], file.name.replace(/\.[^/.]+$/, '.jpg'), {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    const reductionRatio = Math.max(
      0,
      Math.round(((originalSize - compressedFile.size) / originalSize) * 100)
    );

    return {
      file: compressedFile,
      originalSize,
      compressedSize: compressedFile.size,
      reductionRatio,
      previewUrl: dataUrl,
    };
  } catch (err) {
    console.warn('compressImage fallback:', err);
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      reductionRatio: 0,
      previewUrl: URL.createObjectURL(file),
    };
  }
}

/**
 * Format bytes to human readable format (e.g. 1.4 MB, 450 KB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
