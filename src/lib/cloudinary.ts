import { v2 as cloudinary } from 'cloudinary'

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Función para subir imagen
export async function uploadImage(
  file: File,
  folder: string = 'courses'
): Promise<{ url: string; publicId: string }> {
  try {
    // Convertir File a base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { 
          width: 1280, 
          height: 720, 
          crop: 'fill', 
          gravity: 'center',
          quality: 'auto:good' 
        },
        { format: 'webp' }
      ]
    })

    return {
      url: result.secure_url,
      publicId: result.public_id
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw new Error('Error al subir la imagen')
  }
}

// Función para eliminar imagen
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    throw new Error('Error al eliminar la imagen')
  }
}

export default cloudinary
