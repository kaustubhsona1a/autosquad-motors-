import { createClient } from '@supabase/supabase-js';
import imageCompression from 'browser-image-compression';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleSupabaseError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  }
  console.error('Supabase Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function deleteImagesFromStorage(items: any[], bucket: string = 'vehicle-images'): Promise<void> {
  if (!items || items.length === 0) return;

  const urls: string[] = [];
  items.forEach(item => {
    if (typeof item === 'string') {
      let cleanItem = item;
      if (item.includes('|||')) {
        cleanItem = item.split('|||')[0];
      }
      urls.push(cleanItem);
    } else if (item && typeof item === 'object') {
      let mainUrl = item.thumbnail_url || item.gallery_url || item.fullscreen_url || item.image_url;
      if (mainUrl) {
        if (typeof mainUrl === 'string' && mainUrl.includes('|||')) {
          mainUrl = mainUrl.split('|||')[0];
        }
        urls.push(mainUrl);
      }
    }
  });

  const paths = urls.map(url => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Look for "/public/bucket_name/" case-insensitively
      const publicIndex = pathname.toLowerCase().indexOf(`/public/${bucket.toLowerCase()}/`);
      if (publicIndex !== -1) {
        const splitStart = publicIndex + `/public/${bucket}/`.length;
        return decodeURIComponent(pathname.substring(splitStart));
      }
      
      // Alternate check for other Supabase URL structures (e.g. without /public/)
      const bucketIndex = pathname.toLowerCase().indexOf(`/${bucket.toLowerCase()}/`);
      if (bucketIndex !== -1) {
        const splitStart = bucketIndex + `/${bucket}/`.length;
        return decodeURIComponent(pathname.substring(splitStart));
      }

      // Fallback for custom domains or different URL formats
      if (url.toLowerCase().includes(bucket.toLowerCase())) {
        const fallbackSplit = url.split(new RegExp(bucket + '/', 'i'));
        if (fallbackSplit.length > 1) {
          return decodeURIComponent(fallbackSplit[1].split('?')[0]);
        }
      }
      return null;
    } catch (e) {
      console.warn('[PATH PARSE ERROR]', e, 'for url:', url);
      return null;
    }
  }).filter(Boolean) as string[];

  console.log(`[STORAGE PURGE] Attempting to delete ${paths.length} items from bucket "${bucket}":`, paths);

  if (paths.length > 0) {
    const { data, error } = await supabase.storage.from(bucket).remove(paths);
    if (error) {
      console.error(`[STORAGE PURGE ERROR] Failed to delete images from bucket "${bucket}":`, error);
    } else {
      console.log(`[STORAGE PURGE SUCCESS] Deleted from bucket "${bucket}":`, data);
    }
  }
}

export async function cleanupLegacyImageVariants(bucket: string = 'vehicle-images'): Promise<{deletedCount: number, errors: any[]}> {
  let deletedCount = 0;
  const errors: any[] = [];
  try {
    const { data: list, error } = await supabase.storage.from(bucket).list('vehicles', {
      limit: 1000,
      offset: 0,
    });
    if (error) {
      errors.push(error);
      return { deletedCount, errors };
    }

    const filesToDelete = list?.filter(f => 
      f.name.endsWith('-thumb.webp') || 
      f.name.endsWith('-gallery.webp') || 
      f.name.endsWith('-full.webp')
    ).map(f => `vehicles/${f.name}`) || [];

    if (filesToDelete.length > 0) {
      const { data, error: removeError } = await supabase.storage.from(bucket).remove(filesToDelete);
      if (removeError) {
        errors.push(removeError);
      } else {
        deletedCount = data?.length || 0;
      }
    }
  } catch (err) {
    errors.push(err);
  }
  return { deletedCount, errors };
}

export async function compressImageToWebP(
  file: File,
  maxDimension: number = 1440,
  initialQuality: number = 0.86
): Promise<File> {
  if (!file || !file.type.startsWith('image/') || file.type.includes('svg')) {
    return file;
  }

  try {
    return await new Promise<File>((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = async () => {
        URL.revokeObjectURL(objectUrl);

        let targetWidth = img.width;
        let targetHeight = img.height;

        // Downscale dimensions if exceeding maxDimension
        if (targetWidth > maxDimension || targetHeight > maxDimension) {
          if (targetWidth > targetHeight) {
            targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
            targetWidth = maxDimension;
          } else {
            targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
            targetHeight = maxDimension;
          }
        }

        // Multi-step downscaling (halving step-by-step)
        // Single-step downscaling of 12MP-48MP iPhone photos causes severe softness/blur in browser canvas.
        let curWidth = img.width;
        let curHeight = img.height;

        let curCanvas = document.createElement('canvas');
        curCanvas.width = curWidth;
        curCanvas.height = curHeight;
        let ctx = curCanvas.getContext('2d');

        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, curWidth, curHeight);

        // Halve step by step until near target size to preserve crisp edges and fine details
        while (curWidth * 0.5 > targetWidth && curHeight * 0.5 > targetHeight) {
          const nextWidth = Math.floor(curWidth * 0.5);
          const nextHeight = Math.floor(curHeight * 0.5);

          const nextCanvas = document.createElement('canvas');
          nextCanvas.width = nextWidth;
          nextCanvas.height = nextHeight;
          const nextCtx = nextCanvas.getContext('2d');

          if (nextCtx) {
            nextCtx.imageSmoothingEnabled = true;
            nextCtx.imageSmoothingQuality = 'high';
            nextCtx.drawImage(curCanvas, 0, 0, curWidth, curHeight, 0, 0, nextWidth, nextHeight);
            curCanvas = nextCanvas;
            curWidth = nextWidth;
            curHeight = nextHeight;
          } else {
            break;
          }
        }

        // Final step canvas to target width & height
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = targetWidth;
        finalCanvas.height = targetHeight;
        const finalCtx = finalCanvas.getContext('2d');

        if (!finalCtx) {
          resolve(file);
          return;
        }

        finalCtx.imageSmoothingEnabled = true;
        finalCtx.imageSmoothingQuality = 'high';
        finalCtx.drawImage(curCanvas, 0, 0, curWidth, curHeight, 0, 0, targetWidth, targetHeight);

        // Helper to convert canvas to Blob
        const createBlob = (q: number, mime: string): Promise<Blob | null> => {
          return new Promise((res) => {
            if (finalCanvas.toBlob) {
              finalCanvas.toBlob((b) => res(b), mime, q);
            } else {
              try {
                const dataUrl = finalCanvas.toDataURL(mime, q);
                const byteString = atob(dataUrl.split(',')[1]);
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i);
                }
                res(new Blob([ab], { type: mime }));
              } catch (e) {
                res(null);
              }
            }
          });
        };

        let currentQuality = initialQuality;
        let blob = await createBlob(currentQuality, 'image/webp');

        // Check if browser produced a valid webp blob
        if (!blob || !blob.type.includes('webp')) {
          try {
            const dataUrl = finalCanvas.toDataURL('image/webp', currentQuality);
            if (dataUrl.startsWith('data:image/webp')) {
              const byteString = atob(dataUrl.split(',')[1]);
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              blob = new Blob([ab], { type: 'image/webp' });
            }
          } catch (e) {
            console.warn('WebP dataUrl conversion failed, using fallback:', e);
          }
        }

        // Target size check: if larger than 280KB, adjust quality down slightly (e.g. 0.78)
        if (blob && blob.size > 280 * 1024 && currentQuality > 0.7) {
          const refinedBlob = await createBlob(0.78, 'image/webp');
          if (refinedBlob && refinedBlob.size < blob.size && refinedBlob.type.includes('webp')) {
            blob = refinedBlob;
          }
        }

        // Final safety fallback: if browser canvas doesn't support webp export, fallback to jpeg
        if (!blob || blob.size === 0) {
          blob = await createBlob(currentQuality, 'image/jpeg');
        }

        if (blob) {
          const isWebp = blob.type.includes('webp');
          const cleanName = file.name.replace(/\.[^/.]+$/, '');
          const newFileName = `${cleanName}.${isWebp ? 'webp' : 'jpg'}`;
          const finalFile = new File([blob], newFileName, {
            type: isWebp ? 'image/webp' : 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(finalFile);
        } else {
          resolve(file);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    });
  } catch (err) {
    console.warn('[compressImageToWebP] Compression exception, using original:', err);
    return file;
  }
}

export async function uploadImageToStorage(file: File, path: string, bucket: string = 'vehicle-images'): Promise<string> {
  let finalFile = file;
  
  if (file.type.startsWith('image/') && !file.type.includes('svg')) {
    const isShowcase = bucket === 'site_settings' || path.includes('site_settings') || path.includes('logo') || path.includes('hero') || path.includes('about');
    
    const maxDim = isShowcase ? 1920 : 1440;
    const quality = isShowcase ? 0.88 : 0.85;

    try {
      finalFile = await compressImageToWebP(file, maxDim, quality);
    } catch (err) {
      console.warn('Primary compressImageToWebP failed, trying browser-image-compression without worker:', err);
      try {
        finalFile = await imageCompression(file, {
          maxSizeMB: 0.35,
          maxWidthOrHeight: maxDim,
          useWebWorker: false, // Explicitly false to prevent iOS Safari worker canvas crashes
          fileType: 'image/webp',
          initialQuality: quality
        });
      } catch (fallbackErr) {
        console.warn('All image compression attempts failed, using original file:', fallbackErr);
      }
    }
  }

  const fileExt = finalFile.type === 'image/webp' ? 'webp' : (finalFile.name.split('.').pop()?.toLowerCase() || 'jpg');
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, finalFile, {
        contentType: finalFile.type || 'image/webp',
        upsert: true
      });

    if (uploadError) {
      console.warn('[STORAGE UPLOAD WARN] Supabase upload failed, using Data URL fallback:', uploadError.message);
      return await fileToDataUrl(finalFile);
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.warn('[STORAGE UPLOAD EXCEPTION] Falling back to Data URL:', err);
    return await fileToDataUrl(finalFile);
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

