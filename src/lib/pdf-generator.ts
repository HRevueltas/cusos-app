import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface CertificateData {
  studentName: string
  courseName: string
  instructorName: string
  completionDate: Date
  certificateId: string
}

export async function generateCertificatePDF(data: CertificateData): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })
  // Configuraciones
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20

  // Fondo decorativo
  pdf.setFillColor(240, 248, 255) // blue-50
  pdf.rect(0, 0, pageWidth, pageHeight, 'F')

  // Borde decorativo
  pdf.setLineWidth(2)
  pdf.setDrawColor(30, 64, 175) // blue-700
  pdf.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2), 'S')

  // Borde interno
  pdf.setLineWidth(1)
  pdf.setDrawColor(147, 197, 253) // blue-300
  pdf.rect(margin + 5, margin + 5, pageWidth - (margin * 2) - 10, pageHeight - (margin * 2) - 10, 'S')

  // Título principal
  pdf.setFontSize(28)
  pdf.setTextColor(30, 64, 175) // blue-700
  pdf.setFont('helvetica', 'bold')
  const titleText = 'CERTIFICADO DE FINALIZACIÓN'
  const titleWidth = pdf.getTextWidth(titleText)
  pdf.text(titleText, (pageWidth - titleWidth) / 2, margin + 25)

  // Línea decorativa bajo el título
  const lineY = margin + 30
  pdf.setLineWidth(3)
  pdf.setDrawColor(234, 179, 8) // yellow-500
  pdf.line(pageWidth/2 - 30, lineY, pageWidth/2 + 30, lineY)

  // Texto "Se certifica que"
  pdf.setFontSize(16)
  pdf.setTextColor(107, 114, 128) // gray-500
  pdf.setFont('helvetica', 'normal')
  const certifyText = 'Se certifica que'
  const certifyWidth = pdf.getTextWidth(certifyText)
  pdf.text(certifyText, (pageWidth - certifyWidth) / 2, margin + 45)

  // Nombre del estudiante
  pdf.setFontSize(24)
  pdf.setTextColor(30, 64, 175) // blue-700
  pdf.setFont('helvetica', 'bold')
  const studentNameWidth = pdf.getTextWidth(data.studentName)
  pdf.text(data.studentName, (pageWidth - studentNameWidth) / 2, margin + 60)

  // Línea bajo el nombre
  pdf.setLineWidth(1)
  pdf.setDrawColor(147, 197, 253) // blue-300
  pdf.line(pageWidth/2 - studentNameWidth/2 - 10, margin + 63, pageWidth/2 + studentNameWidth/2 + 10, margin + 63)

  // Texto "ha completado exitosamente el curso"
  pdf.setFontSize(16)
  pdf.setTextColor(107, 114, 128) // gray-500
  pdf.setFont('helvetica', 'normal')
  const completedText = 'ha completado exitosamente el curso'
  const completedWidth = pdf.getTextWidth(completedText)
  pdf.text(completedText, (pageWidth - completedWidth) / 2, margin + 75)

  // Nombre del curso (en recuadro)
  pdf.setFontSize(20)
  pdf.setTextColor(30, 64, 175) // blue-700
  pdf.setFont('helvetica', 'bold')
  
  const courseNameWidth = pdf.getTextWidth(data.courseName)
  const boxWidth = Math.min(courseNameWidth + 20, pageWidth - (margin * 4))
  const boxHeight = 15
  const boxX = (pageWidth - boxWidth) / 2
  const boxY = margin + 85
  
  // Fondo del recuadro
  pdf.setFillColor(255, 255, 255) // white
  pdf.setDrawColor(30, 64, 175) // blue-700
  pdf.setLineWidth(1)
  pdf.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'FD')
  
  // Texto del curso (con ajuste si es muy largo)
  const maxCourseWidth = boxWidth - 10
  let displayCourseName = data.courseName
  if (courseNameWidth > maxCourseWidth) {
    // Truncar si es muy largo
    while (pdf.getTextWidth(displayCourseName + '...') > maxCourseWidth && displayCourseName.length > 10) {
      displayCourseName = displayCourseName.slice(0, -1)
    }
    displayCourseName += '...'
  }
  
  const finalCourseWidth = pdf.getTextWidth(displayCourseName)
  pdf.text(displayCourseName, (pageWidth - finalCourseWidth) / 2, boxY + 10)

  // Información adicional
  const infoY = margin + 115
  
  // Fecha de finalización
  pdf.setFontSize(12)
  pdf.setTextColor(107, 114, 128) // gray-500
  pdf.setFont('helvetica', 'normal')
  const dateText = `Completado el ${data.completionDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`
  pdf.text(dateText, margin + 30, infoY)

  // Instructor
  const instructorText = `Instructor: ${data.instructorName}`
  const instructorWidth = pdf.getTextWidth(instructorText)
  pdf.text(instructorText, pageWidth - margin - 30 - instructorWidth, infoY)

  // Línea de firma
  const signatureY = margin + 135
  pdf.setLineWidth(1)
  pdf.setDrawColor(107, 114, 128) // gray-500
  pdf.line(margin + 30, signatureY, margin + 80, signatureY)
  
  pdf.setFontSize(10)
  pdf.text('Firma del Instructor', margin + 30, signatureY + 5)

  // ID del certificado y verificación
  pdf.setFontSize(10)
  pdf.setTextColor(30, 64, 175) // blue-700
  pdf.setFont('helvetica', 'bold')
  const verifyText = 'Certificado Verificado'
  const idText = `ID: ${data.certificateId}`
  
  const verifyWidth = pdf.getTextWidth(verifyText)
  const idWidth = pdf.getTextWidth(idText)
  
  pdf.text(verifyText, pageWidth - margin - 30 - Math.max(verifyWidth, idWidth), signatureY - 5)
  pdf.text(idText, pageWidth - margin - 30 - Math.max(verifyWidth, idWidth), signatureY + 2)

  // Sello/Logo decorativo (círculo con texto)
  const sealX = pageWidth - margin - 20
  const sealY = signatureY - 10
  
  pdf.setFillColor(234, 179, 8) // yellow-500
  pdf.setDrawColor(234, 179, 8)
  pdf.circle(sealX, sealY, 8, 'FD')
  
  pdf.setFontSize(8)
  pdf.setTextColor(255, 255, 255) // white
  pdf.setFont('helvetica', 'bold')
  const sealText = '✓'
  const sealTextWidth = pdf.getTextWidth(sealText)
  pdf.text(sealText, sealX - sealTextWidth/2, sealY + 2)

  return pdf.output('blob')
}

export async function generateCertificateFromHTML(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('Elemento no encontrado')
  }

  try {
    // Capturar el elemento como imagen
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })

    // Crear PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    // Calcular dimensiones manteniendo proporción
    const imgWidth = pageWidth - 20 // margin
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    // Centrar verticalmente si es necesario
    const yPosition = imgHeight > pageHeight - 20 
      ? 10 
      : (pageHeight - imgHeight) / 2

    pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, Math.min(imgHeight, pageHeight - 20))
    
    // Descargar
    pdf.save(filename)
  } catch (error) {
    console.error('Error generando PDF:', error)
    throw new Error('Error al generar el certificado PDF')
  }
}
