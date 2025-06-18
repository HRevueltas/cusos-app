import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Obtener configuración desde la base de datos o valores por defecto
    let settings = await db.systemSettings.findFirst()

    // Si no existe configuración, crear valores por defecto
    if (!settings) {
      settings = await db.systemSettings.create({
        data: {
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
          },          security: {
            sessionTimeout: 30,
            passwordMinLength: 8,
            requireEmailVerification: true,
            enableTwoFactor: false,
            maxLoginAttempts: 5,
            blockDuration: 15
          },content: {
            maxCourseSize: 500,
            allowedFileTypes: ["mp4", "pdf", "docx", "pptx"],
            maxVideoLength: 120,
            autoApproval: false,
            contentModerationEnabled: true
          }
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const settingsData = await request.json()

    // Actualizar o crear configuración
    const settings = await db.systemSettings.upsert({
      where: { id: 1 }, // Asumimos que solo hay un registro de configuración
      update: settingsData,
      create: { id: 1, ...settingsData }
    })

    // Log de la acción
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: "SYSTEM_SETTINGS_UPDATED",
        details: "Configuración del sistema actualizada",
        metadata: {
          adminId: session.user.id,
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
