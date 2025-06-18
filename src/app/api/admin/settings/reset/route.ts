import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Restaurar configuración por defecto
    const defaultSettings = {
      general: {
        siteName: "Plataforma de Cursos",
        siteDescription: "La mejor plataforma para aprender online",
        siteUrl: "https://misite.com",
        logoUrl: "/logo.png",
        faviconUrl: "/favicon.ico",
        supportEmail: "soporte@misite.com",
        contactEmail: "contacto@misite.com",
        socialMedia: {
          facebook: "",
          twitter: "",
          instagram: "",
          linkedin: ""
        }
      },
      features: {
        registrationEnabled: true,
        courseCreationEnabled: true,
        reviewsEnabled: true,
        certificatesEnabled: true,
        notificationsEnabled: true,
        multiLanguageEnabled: false
      },      security: {
        sessionTimeout: 30,
        passwordMinLength: 8,
        requireEmailVerification: true,
        enableTwoFactor: false,
        maxLoginAttempts: 5,
        blockDuration: 15
      },
      content: {
        maxCourseSize: 500,
        allowedFileTypes: ["mp4", "pdf", "docx", "pptx"],
        maxVideoLength: 120,
        autoApproval: false,
        contentModerationEnabled: true
      }
    }

    await db.systemSettings.upsert({
      where: { id: 1 },
      update: defaultSettings,
      create: { id: 1, ...defaultSettings }
    })

    // Log de la acción
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: "SYSTEM_SETTINGS_RESET",
        details: "Configuración del sistema restaurada a valores por defecto",
        metadata: {
          adminId: session.user.id,
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error resetting settings:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
