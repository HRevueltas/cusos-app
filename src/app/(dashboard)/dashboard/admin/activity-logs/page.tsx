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
  Trash2, 
  Filter,
  Eye,
  Calendar,
  User,
  Shield,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from "lucide-react"
import { toast } from "react-hot-toast"

interface ActivityLog {
  id: string
  action: string
  details: string
  metadata: any
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface LogStats {
  action: string
  count: number
}

export default function ActivityLogsPage() {
  const { data: session } = useSession()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [stats, setStats] = useState<LogStats[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [limit] = useState(50)
    // Filtros
  const [actionFilter, setActionFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  
  // UI States
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)
  const [cleaning, setCleaning] = useState(false)

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchLogs()
    }
  }, [session, page, actionFilter, userFilter, startDate, endDate])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (actionFilter && actionFilter !== "all") params.append('action', actionFilter)
      if (userFilter) params.append('userId', userFilter)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/admin/activity-logs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
        setStats(data.stats)
        setTotalPages(data.pagination.totalPages)
        setTotalCount(data.pagination.totalCount)
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
      setCleaning(true)
      const response = await fetch(`/api/admin/activity-logs?days=${days}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        fetchLogs() // Recargar logs
      } else {
        toast.error("Error al limpiar logs")
      }
    } catch (error) {
      console.error("Error cleaning logs:", error)
      toast.error("Error al limpiar logs")
    } finally {
      setCleaning(false)
    }
  }
  const clearFilters = () => {
    setActionFilter("all")
    setUserFilter("")
    setStartDate("")
    setEndDate("")
    setPage(1)
  }

  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      'USER_LOGIN': 'bg-blue-100 text-blue-800',
      'USER_LOGOUT': 'bg-gray-100 text-gray-800',
      'USER_CREATED': 'bg-green-100 text-green-800',
      'USER_UPDATED': 'bg-yellow-100 text-yellow-800',
      'USER_DELETED': 'bg-red-100 text-red-800',
      'COURSE_CREATED': 'bg-purple-100 text-purple-800',
      'COURSE_PUBLISHED': 'bg-emerald-100 text-emerald-800',
      'COURSE_UPDATED': 'bg-orange-100 text-orange-800',
      'COURSE_DELETED': 'bg-red-100 text-red-800',
      'ENROLLMENT_CREATED': 'bg-indigo-100 text-indigo-800',
      'PAYMENT_COMPLETED': 'bg-green-100 text-green-800',
      'SYSTEM_SETTINGS_UPDATED': 'bg-blue-100 text-blue-800',
      'REPORT_EXPORTED': 'bg-cyan-100 text-cyan-800',
      'ACTIVITY_LOGS_CLEANED': 'bg-gray-100 text-gray-800',
    }
    return colors[action] || 'bg-gray-100 text-gray-800'
  }

  const getActionIcon = (action: string) => {
    if (action.includes('USER')) return <User className="w-4 h-4" />
    if (action.includes('COURSE')) return <Activity className="w-4 h-4" />
    if (action.includes('SYSTEM')) return <Shield className="w-4 h-4" />
    return <Activity className="w-4 h-4" />
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
          <h1 className="text-3xl font-bold">Logs de Actividad del Sistema</h1>
          <p className="text-muted-foreground">
            Monitorea todas las actividades y acciones realizadas en la plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => cleanOldLogs(30)}
            disabled={cleaning}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {cleaning ? "Limpiando..." : "Limpiar Logs"}
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Registros totales</p>
          </CardContent>
        </Card>
        
        {stats.slice(0, 3).map((stat, index) => (
          <Card key={stat.action}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {getActionIcon(stat.action)}
                {stat.action.replace(/_/g, ' ')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.count}</div>
              <p className="text-xs text-muted-foreground">Últimos 7 días</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="actionFilter">Tipo de Acción</Label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las acciones" />
                  </SelectTrigger>                  <SelectContent>
                    <SelectItem value="all">Todas las acciones</SelectItem>
                    <SelectItem value="USER_LOGIN">Inicio de Sesión</SelectItem>
                    <SelectItem value="USER_CREATED">Usuario Creado</SelectItem>
                    <SelectItem value="COURSE_CREATED">Curso Creado</SelectItem>
                    <SelectItem value="COURSE_PUBLISHED">Curso Publicado</SelectItem>
                    <SelectItem value="PAYMENT_COMPLETED">Pago Completado</SelectItem>
                    <SelectItem value="SYSTEM_SETTINGS_UPDATED">Configuración Actualizada</SelectItem>
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
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron logs de actividad.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center space-x-2">
                      {getActionIcon(log.action)}
                      <Badge className={getActionColor(log.action)}>
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">{log.details}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.user.name} ({log.user.role})
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, totalCount)} de {totalCount} registros
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <span className="text-sm font-medium">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalles del log */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalles del Log</h3>
                <Button variant="ghost" onClick={() => setSelectedLog(null)}>
                  ×
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Acción</Label>
                  <Badge className={getActionColor(selectedLog.action)}>
                    {selectedLog.action.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div>
                  <Label>Usuario</Label>
                  <p>{selectedLog.user.name} ({selectedLog.user.email})</p>
                </div>
                <div>
                  <Label>Detalles</Label>
                  <p>{selectedLog.details}</p>
                </div>
                <div>
                  <Label>Fecha y Hora</Label>
                  <p>{new Date(selectedLog.createdAt).toLocaleString()}</p>
                </div>
                {selectedLog.metadata && (
                  <div>
                    <Label>Metadatos</Label>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
