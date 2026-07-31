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

  const rawUrls: string[] = [];
  items.forEach(item => {
    if (typeof item === 'string') {
      let clean = item;
      if (clean.includes('|||')) clean = clean.split('|||')[0];
      rawUrls.push(clean);
    } else if (item && typeof item === 'object') {
      let mainUrl = item.thumbnail_url || item.gallery_url || item.fullscreen_url || item.image_url || item.url;
      if (typeof mainUrl === 'string') {
        if (mainUrl.includes('|||')) mainUrl = mainUrl.split('|||')[0];
        rawUrls.push(mainUrl);
      }
    }
  });

  const paths = rawUrls.map(url => {
    if (!url) return null;
    if (url.startsWith('data:') || url.startsWith('blob:')) return null;

    try {
      let pathname = url;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        pathname = new URL(url).pathname;
      }

      // Remove query parameters or hash
      pathname = pathname.split('?')[0].split('#')[0];

      const bucketPattern = `/${bucket.toLowerCase()}/`;
      const lowerPath = pathname.toLowerCase();
      const idx = lowerPath.indexOf(bucketPattern);

      if (idx !== -1) {
        const pathPart = pathname.substring(idx + bucketPattern.length);
        return decodeURIComponent(pathPart);
      }

      // Fallback for relative paths like "vehicles/123.webp" or "123.webp"
      if (!url.startsWith('http') && !url.startsWith('/')) {
        return decodeURIComponent(url.split('?')[0]);
      }

      return null;
    } catch (e) {
      console.warn('[STORAGE PURGE PARSE ERROR]', e, 'for url:', url);
      return null;
    }
  }).filter(Boolean) as string[];

  console.log(`[STORAGE PURGE] Attempting to delete ${paths.length} items from bucket "${bucket}":`, paths);

  if (paths.length > 0) {
    const { data, error } = await supabase.storage.from(bucket).remove(paths);
    if (error) {
      console.error(`[STORAGE PURGE ERROR] Failed to delete from bucket "${bucket}":`, error);
    } else {
      console.log(`[STORAGE PURGE SUCCESS] Deleted ${data?.length || 0} objects from bucket "${bucket}":`, data);
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
  initialQuality: number = 0.82
): Promise<File> {
  if (!file || !file.type.startsWith('image/') || file.type.includes('svg')) {
    return file;
  }

  // Pass 1: Use browser-image-compression for EXIF orientation, HEIC decoding (iPhone photos),
  // and multi-pass crisp downscaling without crashing iOS Safari Web Workers.
  let compressedFile: File = file;
  try {
    const options = {
      maxSizeMB: 0.22, // ~150-200 KB target size for high clarity & small size
      maxWidthOrHeight: maxDimension,
      useWebWorker: false, // Critical: iOS Safari Web Workers fail on canvas operations
      fileType: 'image/webp',
      initialQuality: initialQuality
    };
    compressedFile = await imageCompression(file, options);
  } catch (err) {
    console.warn('[compressImageToWebP] browser-image-compression failed:', err);
  }

  // If pass 1 produced valid webp, return it immediately
  if (compressedFile && compressedFile.type === 'image/webp') {
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    return new File([compressedFile], `${cleanName}.webp`, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  }

  // Pass 2: Canvas WebP conversion pass if compressedFile was output as JPEG (e.g. on iOS Safari)
  try {
    const webpBlob = await new Promise<Blob | null>((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(compressedFile);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0);

        if (canvas.toBlob) {
          canvas.toBlob((b) => resolve(b), 'image/webp', initialQuality);
        } else {
          try {
            const dataUrl = canvas.toDataURL('image/webp', initialQuality);
            if (dataUrl.startsWith('data:image/webp')) {
              const byteString = atob(dataUrl.split(',')[1]);
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              resolve(new Blob([ab], { type: 'image/webp' }));
            } else {
              resolve(null);
            }
          } catch (e) {
            resolve(null);
          }
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };
      img.src = objectUrl;
    });

    if (webpBlob && webpBlob.size > 0) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const isWebp = webpBlob.type.includes('webp');
      return new File([webpBlob], `${cleanName}.${isWebp ? 'webp' : 'jpg'}`, {
        type: isWebp ? 'image/webp' : 'image/jpeg',
        lastModified: Date.now(),
      });
    }
  } catch (e) {
    console.warn('[compressImageToWebP] WebP canvas pass failed:', e);
  }

  // Fallback: Return downscaled file with webp/jpeg ext
  const cleanName = file.name.replace(/\.[^/.]+$/, '');
  const isWebp = compressedFile.type.includes('webp');
  return new File([compressedFile], `${cleanName}.${isWebp ? 'webp' : 'jpg'}`, {
    type: isWebp ? 'image/webp' : (compressedFile.type || 'image/jpeg'),
    lastModified: Date.now(),
  });
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

