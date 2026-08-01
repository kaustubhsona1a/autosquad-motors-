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

export async function compressImage(
  file: File,
  options?: { maxDimension?: number; targetQuality?: number; isShowcase?: boolean }
): Promise<File> {
  // Skip compression for non-images or showcase branding assets if requested
  if (
    options?.isShowcase ||
    (!file.type.startsWith('image/') && !file.name.match(/\.(heic|heif|jpe?g|png|webp|mov)$/i))
  ) {
    return file;
  }

  // For car inventory photos, 1280px is optimal HD for retina mobile & desktop galleries
  const maxDim = options?.maxDimension || 1280;
  const initialQuality = options?.targetQuality || 0.75;

  try {
    let img: HTMLImageElement | null = new Image();
    let objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    const loaded = await new Promise<boolean>((resolve) => {
      if (!img) return resolve(false);
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      if (img.complete && img.naturalWidth) resolve(true);
    });

    // If direct HTMLImageElement load failed (e.g. raw unconverted HEIC on desktop), try fallback worker
    if (!loaded || !img.naturalWidth || !img.naturalHeight) {
      URL.revokeObjectURL(objectUrl);
      try {
        const options = {
          maxSizeMB: 0.2, // 200 KB target
          maxWidthOrHeight: maxDim,
          useWebWorker: true,
          initialQuality: 0.75
        };
        const compressedBlob = await imageCompression(file, options);
        return new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
      } catch {
        return file;
      }
    }

    // Canvas drawing helper function with bicubic smooth downscaling
    const renderToCanvas = (targetMaxDim: number) => {
      let width = img!.naturalWidth || img!.width;
      let height = img!.naturalHeight || img!.height;

      if (width > targetMaxDim || height > targetMaxDim) {
        if (width > height) {
          height = Math.round((height * targetMaxDim) / width);
          width = targetMaxDim;
        } else {
          width = Math.round((width * targetMaxDim) / height);
          height = targetMaxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img!, 0, 0, width, height);

      return canvas;
    };

    const getBlob = (canvas: HTMLCanvasElement, mimeType: string, q: number): Promise<Blob | null> => {
      return new Promise((resolve) => {
        try {
          canvas.toBlob((b) => resolve(b), mimeType, q);
        } catch {
          resolve(null);
        }
      });
    };

    let canvas = renderToCanvas(maxDim);
    if (!canvas) {
      URL.revokeObjectURL(objectUrl);
      return file;
    }

    // Step 1: Initial Quality Pass at 0.75 quality & 1280px dimension
    let jpegBlob = await getBlob(canvas, 'image/jpeg', initialQuality);
    let webpBlob = await getBlob(canvas, 'image/webp', initialQuality);

    // Step 2: Adaptive Compression Pass
    // If output exceeds 220 KB, re-encode with quality 0.68
    if (jpegBlob && jpegBlob.size > 220 * 1024) {
      const tighterJpeg = await getBlob(canvas, 'image/jpeg', 0.68);
      if (tighterJpeg) jpegBlob = tighterJpeg;
    }

    if (webpBlob && webpBlob.size > 220 * 1024) {
      const tighterWebp = await getBlob(canvas, 'image/webp', 0.68);
      if (tighterWebp) webpBlob = tighterWebp;
    }

    // Step 3: Resolution Downscaling Pass
    // If STILL > 240 KB (e.g. photos with complex reflections), downscale dimension to 1080px
    if (jpegBlob && jpegBlob.size > 240 * 1024) {
      const canvas1080 = renderToCanvas(1080);
      if (canvas1080) {
        const scaledJpeg = await getBlob(canvas1080, 'image/jpeg', 0.70);
        if (scaledJpeg) jpegBlob = scaledJpeg;
        const scaledWebp = await getBlob(canvas1080, 'image/webp', 0.70);
        if (scaledWebp) webpBlob = scaledWebp;
      }
    }

    URL.revokeObjectURL(objectUrl);
    img = null;

    let finalBlob: Blob | null = jpegBlob;
    let finalExt = 'jpg';
    let finalType = 'image/jpeg';

    // Prefer WebP if valid, smaller than JPEG, and under 220 KB. Otherwise default to JPEG (iOS optimal format)
    if (
      webpBlob &&
      webpBlob.type === 'image/webp' &&
      webpBlob.size > 0 &&
      jpegBlob &&
      webpBlob.size <= jpegBlob.size &&
      webpBlob.size < 220 * 1024
    ) {
      finalBlob = webpBlob;
      finalExt = 'webp';
      finalType = 'image/webp';
    }

    if (!finalBlob) {
      return file;
    }

    const cleanBaseName = file.name.replace(/\.[^/.]+$/, '');
    const newFileName = `${cleanBaseName}.${finalExt}`;
    return new File([finalBlob], newFileName, { type: finalType, lastModified: Date.now() });
  } catch (err) {
    console.warn('Canvas image compression error, using original file:', err);
    return file;
  }
}

export async function compressImageToWebP(
  file: File,
  maxDimension: number = 1280,
  initialQuality: number = 0.75
): Promise<File> {
  return compressImage(file, { maxDimension, targetQuality: initialQuality });
}

export async function uploadImageToStorage(file: File, path: string, bucket: string = 'vehicle-images'): Promise<string> {
  let finalFile = file;
  
  if (file.type.startsWith('image/') && !file.type.includes('svg')) {
    const isShowcase = bucket === 'site_settings' || path.includes('site_settings') || path.includes('logo') || path.includes('hero') || path.includes('about');
    
    const maxDim = isShowcase ? 1600 : 1280;
    const quality = isShowcase ? 0.82 : 0.75;

    try {
      finalFile = await compressImage(file, { maxDimension: maxDim, targetQuality: quality, isShowcase });
    } catch (err) {
      console.warn('Primary compressImage failed, using original file:', err);
    }
  }

  const fileExt = finalFile.type.includes('webp') ? 'webp' : (finalFile.name.split('.').pop()?.toLowerCase() || 'jpg');
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, finalFile, {
        contentType: finalFile.type || 'image/jpeg',
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

