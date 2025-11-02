/**
 * Encodes a file as a base-64 URL of the form `data:<mime-type>;base64,<data>`.
 *
 * @param file The file to process.
 *
 * @returns A Promise which resolves to a base-64 URL representation of the image.
 */
export function encodeImageAsBase64Url(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = reject;
  });
}

/**
 * Extracts the MIME type of a base-64 encoded image.
 *
 * @param base64ImageUrl
 * The base-64 encoded image URL of the form `data:<mime-type>;base64,<data>`.
 *
 * @returns
 * The MIME type of the image as a string, e.g. `'image/jpeg'`.
 *
 * @throws
 * A generic error if the MIME type isn't present in the provided URL.
 */
export function getMimeType(base64ImageUrl: string): string {
  const potentialMimeType = base64ImageUrl.match(/^data:(.+);base64,/)?.[1];

  if (!potentialMimeType) {
    throw new Error(
      `Failed to find mime type in the provided image URL: ${base64ImageUrl}`,
    );
  }

  return potentialMimeType;
}

/**
 * Extracts the raw image data of a base-64 encoded image.  This is
 * equivalent to the image URL with the MIME type removed.
 *
 * @param base64ImageUrl
 * The base-64 encoded image URL of the form `data:<mime-type>;base64,<data>`;
 *
 * @returns
 * The base-64 image data as a string.
 */
export function getRawImageData(base64ImageUrl: string): string {
  return base64ImageUrl.replace(/^data:.+;base64,/, '');
}

// Resize an image by painting it onto an HTML canvas and screenshotting the canvas
export function resizeImageAndConvertToDataUrl(
  imageFile: File,
  width: number,
  height?: number,
): Promise<string> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height ?? width;
      const canvasRenderingContext = canvas.getContext('2d');
      if (canvasRenderingContext) {
        // Calculate cropping area to maintain aspect ratio
        let cropX = 0;
        let cropY = 0;
        let cropWidth = image.width;
        let cropHeight = image.height;
        const aspectRatio = image.width / image.height;
        const targetAspectRatio = canvas.width / canvas.height;

        if (aspectRatio > targetAspectRatio) {
          // Crop the width
          cropWidth = image.height * targetAspectRatio;
          cropX = (image.width - cropWidth) / 2;
        } else {
          // Crop the height
          cropHeight = image.width / targetAspectRatio;
          cropY = (image.height - cropHeight) / 2;
        }
        canvasRenderingContext.drawImage(
          image,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          width,
          height ?? width,
        );
      }
      resolve(canvas.toDataURL('image/webp'));
    };

    // get original file as data url
    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      image.src = fileReader.result as string;
    });
    fileReader.readAsDataURL(imageFile);
  });
}
