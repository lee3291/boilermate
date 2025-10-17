import imageCompression from 'browser-image-compression';

// --- Configuration ---
const MAX_SIZE_MB = 1.5;
const LANDSCAPE_MAX_WIDTH = 1920;
const PORTRAIT_MAX_HEIGHT = 1920;

/**
 * A helper function to get the dimensions of an image file.
 * This uses standard browser APIs and avoids the problematic import.
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.width, height: image.height });
      URL.revokeObjectURL(imageUrl); // Clean up the object URL
    };
    image.onerror = (error) => {
      reject(error);
      URL.revokeObjectURL(imageUrl);
    };
    image.src = imageUrl;
  });
}

/**
 * Compresses an image file, applying different constraints for
 * landscape vs. portrait orientations.
 *
 * @param file The original image File object from the user.
 * @returns A Promise that resolves with the compressed File object.
 */
export async function compressImage(file: File): Promise<File> {
  console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

  try {
    // Get image dimensions to determine orientation
    const { width, height } = await getImageDimensions(file);
    const isLandscape = width > height;

    const options = {
      maxSizeMB: MAX_SIZE_MB,
      maxWidthOrHeight: isLandscape ? LANDSCAPE_MAX_WIDTH : PORTRAIT_MAX_HEIGHT,
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);
    console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

    return compressedFile;
  } catch (error) {
    console.error('Image compression failed. Returning original file.', error);
    return file;
  }
}

