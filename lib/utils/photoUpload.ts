import { supabase } from '@/lib/supabase'

/**
 * Upload a photo to Supabase Storage
 * @param file - The file to upload
 * @param userId - The user's ID
 * @returns The public URL of the uploaded file or null if error
 */
export async function uploadPhoto(file: File, userId: string): Promise<string | null> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('fish-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('fish-photos')
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Upload exception:', error)
    return null
  }
}

/**
 * Delete a photo from Supabase Storage
 * @param photoUrl - The public URL of the photo
 * @returns true if successful, false otherwise
 */
export async function deletePhoto(photoUrl: string): Promise<boolean> {
  try {
    // Extract path from URL
    const url = new URL(photoUrl)
    const pathParts = url.pathname.split('/fish-photos/')
    if (pathParts.length < 2) return false
    
    const filePath = pathParts[1]

    const { error } = await supabase.storage
      .from('fish-photos')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete exception:', error)
    return false
  }
}

/**
 * Compress image before upload
 * @param file - The image file
 * @param maxWidth - Maximum width (default 1920)
 * @param maxHeight - Maximum height (default 1080)
 * @param quality - JPEG quality (0-1, default 0.8)
 * @returns Compressed file
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Canvas is empty'))
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = (error) => reject(error)
    }

    reader.onerror = (error) => reject(error)
  })
}
