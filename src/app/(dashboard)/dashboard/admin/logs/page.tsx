"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Activity, 
  Search, 
  Filter, 
  Download,
  Trash2,
  RefreshCw,
  Calendar,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle
} from "lucide-react"
import { toast } from "react-hot-toast"
import { formatPrice } from "@/lib/utils"

interface ActivityLog {
  id: string
  userId: string
  action: string
  details: string
  metadata?: any
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface LogsData {
  logs: ActivityLog[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  stats: {
    action: string
    count: number
  }[]
}

export default function AdminLogsPage() {
  const { data: session } = useSession()
  const [logsData, setLogsData] = useState<LogsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [cleaningLogs, setCleaningLogs] = useState(false)
  
  // Filtros
  const [page, setPage] = useState(1)
  const [action, setAction] = useState("")
  const [userId, setUserId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchLogs()
    }
  }, [session, page, action, userId, startDate, endDate])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50"
      })

      if (action) params.append("action", action)
      if (userId) params.append("userId", userId)
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const response = await fetch(`/api/admin/activity-logs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLogsData(data)
      }
    } catch (error) {
      console.error("Error fetching logs:", error)
      toast.error("Error al cargar los logs")
    } finally {
      setLoading(false)
    }
  }

  const cleanOldLogs = async (days: number) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar los logs más antiguos que ${days} días?`)) {
      return
    }

    try {
      setCleaningLogs(true)
      const response = await fetch(`/api/admin/activity-logs?days=${days}`, {
        method: "DELETE"
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        fetchLogs()
      } else {
        toast.error("Error al limpiar los logs")
      }
    } catch (error) {
      console.error("Error cleaning logs:", error)
      toast.error("Error al limpiar los logs")
    } finally {
      setCleaningLogs(false)
    }
  }

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams({
        type: "logs",
        format: "excel"
      })

      if (action) params.append("action", action)
      if (userId) params.append("userId", userId)
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const response = await fetch(`/api/admin/reports/export?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `logs_actividad_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Logs exportados correctamente")
      }
    } catch (error) {
      console.error("Error exporting logs:", error)
      toast.error("Error al exportar los logs")
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "USER_CREATED":
      case "USER_UPDATED":
        return <User className="w-4 h-4 text-blue-500" />
      case "COURSE_CREATED":
      case "COURSE_UPDATED":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "LOGIN":
      case "LOGOUT":
        return <Shield className="w-4 h-4 text-purple-500" />
      case "PAYMENT_COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "ERROR":
      case "FAILED_LOGIN":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "USER_CREATED":
      case "COURSE_CREATED":
      case "PAYMENT_COMPLETED":
        return "bg-green-100 text-green-800"
      case "USER_UPDATED":
      case "COURSE_UPDATED":
        return "bg-blue-100 text-blue-800"
      case "LOGIN":
      case "LOGOUT":
        return "bg-purple-100 text-purple-800"
      case "ERROR":
      case "FAILED_LOGIN":
        return "bg-red-100 text-red-800"
      case "WARNING":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const clearFilters = () => {
    setAction("")
    setUserId("")
    setStartDate("")
    setEndDate("")
    setSearchQuery("")
    setPage(1)
  }

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logs de Actividad</h1>
          <p className="text-muted-foreground">
            Monitorea toda la actividad del sistema y usuarios
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportLogs}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button 
            variant="outline" 
            onClick={() => cleanOldLogs(30)}
            disabled={cleaningLogs}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {cleaningLogs ? "Limpiando..." : "Limpiar Logs"}
          </Button>
          <Button 
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      {logsData?.stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {logsData.stats.slice(0, 4).map((stat) => (
            <Card key={stat.action}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-2xl font-bold">{stat.count}</p>
                  </div>
                  {getActionIcon(stat.action)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="action">Acción</Label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las acciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las acciones</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                  <SelectItem value="USER_CREATED">Usuario Creado</SelectItem>
                  <SelectItem value="COURSE_CREATED">Curso Creado</SelectItem>
                  <SelectItem value="PAYMENT_COMPLETED">Pago Completado</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : logsData?.logs && logsData.logs.length > 0 ? (
            <div className="space-y-4">
              {logsData.logs.map((log) => (
                <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    {getActionIcon(log.action)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getActionColor(log.action)}>
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          por {log.user.name}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{log.details}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.user.email} • {log.user.role}
                      </p>
                      {log.metadata && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer">
                            Ver detalles técnicos
                          </summary>
                          <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay logs</h3>
              <p className="text-gray-600">No se encontraron registros de actividad con los filtros seleccionados.</p>
            </div>
          )}

          {/* Paginación */}
          {logsData?.pagination && logsData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Página {logsData.pagination.page} de {logsData.pagination.totalPages} 
                ({logsData.pagination.totalCount} registros)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!logsData.pagination.hasPrev}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!logsData.pagination.hasNext}
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
