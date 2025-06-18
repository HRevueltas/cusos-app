import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const emailConfig = await request.json()

    // Crear transportador de email
    const transporter = nodemailer.createTransporter({
      host: emailConfig.smtpHost,
      port: emailConfig.smtpPort,
      secure: emailConfig.smtpPort === 465,
      auth: {
        user: emailConfig.smtpUser,
        pass: emailConfig.smtpPassword,
      },
    })

    // Verificar conexión
    await transporter.verify()

    // Enviar email de prueba
    await transporter.sendMail({
      from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
      to: session.user.email,
      subject: "Prueba de Configuración SMTP",
      html: `
        <h2>Configuración SMTP Exitosa</h2>
        <p>Este es un email de prueba para verificar que la configuración SMTP está funcionando correctamente.</p>
        <p><strong>Servidor:</strong> ${emailConfig.smtpHost}:${emailConfig.smtpPort}</p>
        <p><strong>Usuario:</strong> ${emailConfig.smtpUser}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p><small>Este email fue enviado desde el panel de administración de la plataforma.</small></p>
      `,
    })

    return NextResponse.json({ success: true, message: "Email de prueba enviado correctamente" })
  } catch (error) {
    console.error("Error testing email:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Error al probar la configuración de email",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 400 }
    )
  }
}
