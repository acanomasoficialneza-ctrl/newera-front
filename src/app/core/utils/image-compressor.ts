/**
 * Helper utility to validate and compress images client-side before uploading.
 * Ensures images don't exceed max limits and compresses large camera photos 
 * down to optimal web size (< 2MB, typically 150KB - 300KB) with high visual clarity.
 */
export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  file?: File;
}

export class ImageCompressor {
  // Allowed MIME types
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

  // Maximum raw file limit before compression (ej. 20MB)
  private static readonly MAX_RAW_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

  // Target maximum compressed size (requested: strict max 2 MB)
  private static readonly MAX_FINAL_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

  /**
   * Validates and compresses an image File.
   * If the file is already small (< 500KB) and within dimensions, returns it.
   * Otherwise, scales to max 1600px dimension and compresses with quality 0.82.
   */
  public static async compressImage(file: File, maxDimension = 1600, quality = 0.82): Promise<ImageValidationResult> {
    // 1. Validar tipo de archivo
    if (!file.type || !this.ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return {
        valid: false,
        error: 'Formato no permitido. Solo se aceptan imágenes JPG, PNG o WEBP.'
      };
    }

    // 2. Si el archivo ya pesa 2 MB o menos, se sube directamente sin tocarlo
    if (file.size <= this.MAX_FINAL_SIZE_BYTES) {
      return {
        valid: true,
        file: file
      };
    }

    // 3. Si supera los 2 MB, se comprime automáticamente
    try {
      // Cargar la imagen en memoria
      const bitmap = await this.loadImage(file);

      // 4. Calcular nuevas dimensiones proporcionales
      let { width, height } = bitmap;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      // 5. Dibujar en Canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return { valid: false, error: 'No se pudo inicializar el procesador de imágenes en el navegador.' };
      }

      // Suavizado de imagen de alta calidad
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bitmap, 0, 0, width, height);

      // 6. Convertir a Blob comprimido (JPEG para mejor compresión visual en fotos/identificaciones)
      const mimeType = file.type === 'image/png' ? 'image/jpeg' : file.type;
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), mimeType, quality);
      });

      if (!blob) {
        return { valid: false, error: 'Error al procesar la imagen comprimida.' };
      }

      // 7. Si aún superara los 2 MB (extremadamente raro), reducir calidad en un segundo paso
      let finalBlob = blob;
      if (finalBlob.size > this.MAX_FINAL_SIZE_BYTES) {
        const lowerBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.65);
        });
        if (lowerBlob) finalBlob = lowerBlob;
      }

      // Verificación final estricta de 2 MB
      if (finalBlob.size > this.MAX_FINAL_SIZE_BYTES) {
        return {
          valid: false,
          error: 'La imagen excede el límite máximo de 2 MB incluso tras optimizarse.'
        };
      }

      // 8. Crear un nuevo File a partir del Blob
      const extension = mimeType === 'image/webp' ? '.webp' : '.jpg';
      const cleanName = file.name.replace(/\.[^/.]+$/, '') + extension;
      const compressedFile = new File([finalBlob], cleanName, {
        type: mimeType,
        lastModified: Date.now()
      });

      return {
        valid: true,
        file: compressedFile
      };

    } catch (err: any) {
      console.error('Error al comprimir imagen:', err);
      // Fallback: si falla el canvas pero la imagen original ya pesa <= 2MB, permitirla
      if (file.size <= this.MAX_FINAL_SIZE_BYTES) {
        return { valid: true, file };
      }
      return {
        valid: false,
        error: 'No se pudo procesar la imagen seleccionada.'
      };
    }
  }

  private static loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    });
  }
}
