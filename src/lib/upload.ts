import { createClient } from '@/utils/supabase/client';

/**
 * Uploads a file to Supabase Storage and returns its public URL.
 * 
 * @param file The file object from the input element
 * @param bucketName The Supabase storage bucket name (e.g., 'courses', 'videos', 'images')
 * @returns The public URL of the uploaded file, or null if it failed.
 */
export async function uploadFile(file: File, bucketName: string = 'courses'): Promise<string | null> {
  if (!file) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient();

  // Check if credentials are set and valid
  if (!supabaseUrl || !supabaseUrl.startsWith('http') || !supabaseKey || supabaseKey === 'your-anon-key-here') {
    console.warn("Supabase credentials are missing or invalid. Simulating upload for development.");
    // Simulate upload delay for local testing without backend
    await new Promise(resolve => setTimeout(resolve, 1500));
    return URL.createObjectURL(file); // Temporary blob URL for UI purposes
  }

  try {
    // Create a unique file name to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file to Supabase:', uploadError.message);
      throw uploadError;
    }

    // Get public URL
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Upload process failed:', error);
    alert('فشل رفع الملف. تأكد من إعدادات Supabase Storage أو حجم الملف.');
    return null;
  }
}
