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

    // Simular información de backups (en un entorno real, esto vendría de un sistema de backup)
    const backups = [
      {
        id: "backup_001",
        filename: "backup_2024_06_17_10_30.sql",
        size: 15728640, // 15MB
        type: "auto",
        status: "completed",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        description: "Backup automático diario"
      },
      {
        id: "backup_002", 
        filename: "backup_manual_2024_06_16.sql",
        size: 14680064, // 14MB
        type: "manual",
        status: "completed",
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        description: "Backup antes de actualización del sistema"
      },
      {
        id: "backup_003",
        filename: "backup_2024_06_15_10_30.sql", 
        size: 13631488, // 13MB
        type: "auto",
        status: "completed",
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        description: "Backup automático diario"
      }
    ]

    return NextResponse.json({ backups })
  } catch (error) {
    console.error("Error fetching backups:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { type, description } = await request.json()

    // Simular creación de backup
    const backupId = `backup_${Date.now()}`
    const filename = `backup_${new Date().toISOString().split('T')[0]}_${new Date().toTimeString().split(' ')[0].replace(/:/g, '_')}.sql`

    // En un entorno real, aquí se ejecutaría el comando de backup de la base de datos
    // Por ejemplo: pg_dump, mysqldump, etc.

    // Log de la acción
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: "BACKUP_CREATED",
        details: `Backup ${type} creado: ${filename}`,
        metadata: {
          adminId: session.user.id,
          backupId,
          filename,
          type,
          description,
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      backup: {
        id: backupId,
        filename,
        type,
        status: "completed",
        description
      }
    })
  } catch (error) {
    console.error("Error creating backup:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
