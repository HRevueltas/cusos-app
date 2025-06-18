// Función para generar el ID de certificado (debe coincidir con el backend)
export function generateCertificateId(userId: string, courseId: string): string {
  // En el frontend usamos una implementación similar pero con crypto-js o Web Crypto API
  // Por simplicidad, usaremos una función hash simple
  const data = `${userId}-${courseId}-certificate`
  
  // Función hash simple que coincida con el backend
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Convertir a string hexadecimal y tomar los primeros 16 caracteres
  return Math.abs(hash).toString(16).padStart(8, '0').substring(0, 16)
}

// Función para generar URL pública de certificado
export function generatePublicCertificateUrl(userId: string, courseId: string): string {
  const certificateId = generateCertificateId(userId, courseId)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  return `${baseUrl}/certificate/${certificateId}`
}

// Función para obtener el dominio base
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXTAUTH_URL || 'http://localhost:3000'
}
