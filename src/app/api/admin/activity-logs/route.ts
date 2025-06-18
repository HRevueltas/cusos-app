import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}

    if (action) {
      where.action = action
    }

    if (userId) {
      where.userId = userId
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Obtener logs con información del usuario
    const [logs, totalCount] = await Promise.all([
      db.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.activityLog.count({ where })
    ])

    // Obtener estadísticas de actividad
    const stats = await db.activityLog.groupBy({
      by: ['action'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
        }
      },
      _count: {
        action: true
      }
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats: stats.map(stat => ({
        action: stat.action,
        count: stat._count.action
      }))
    })
  } catch (error) {
    console.error("Error fetching activity logs:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Eliminar logs más antiguos que X días
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const result = await db.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    })

    // Log de la acción de limpieza
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: "ACTIVITY_LOGS_CLEANED",
        details: `Se eliminaron ${result.count} logs de actividad más antiguos que ${days} días`,
        metadata: {
          adminId: session.user.id,
          deletedCount: result.count,
          cutoffDate: cutoffDate.toISOString(),
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Se eliminaron ${result.count} registros de actividad`
    })
  } catch (error) {
    console.error("Error cleaning activity logs:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
