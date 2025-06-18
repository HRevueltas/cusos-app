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

    // Obtener información del sistema
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalFiles
    ] = await Promise.all([
      db.user.count(),
      db.course.count(),
      db.enrollment.count(),
      // Simular conteo de archivos
      Promise.resolve(1250)
    ])

    // Simular información del sistema
    const systemInfo = {
      databaseSize: 52428800, // 50MB
      totalUsers,
      totalCourses,
      totalFiles,
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      autoBackupEnabled: true,
      storageUsed: 1073741824, // 1GB
      storageLimit: 10737418240 // 10GB
    }

    return NextResponse.json(systemInfo)
  } catch (error) {
    console.error("Error fetching system info:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
