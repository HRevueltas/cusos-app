"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  Download,
  Upload,
  Trash2,
  RefreshCw,
  HardDrive,
  Shield,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText
} from "lucide-react"
import { toast } from "react-hot-toast"

interface BackupInfo {
  id: string
  filename: string
  size: number
  type: "manual" | "auto"
  status: "completed" | "in_progress" | "failed"
  createdAt: string
  description?: string
}

interface SystemInfo {
  databaseSize: number
  totalUsers: number
  totalCourses: number
  totalFiles: number
  lastBackup?: string
  autoBackupEnabled: boolean
  storageUsed: number
  storageLimit: number
}

export default function AdminBackupsPage() {
  const { data: session } = useSession()
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchBackups()
      fetchSystemInfo()
    }
  }, [session])

  const fetchBackups = async () => {
    try {
      const response = await fetch("/api/admin/backups")
      if (response.ok) {
        const data = await response.json()
        setBackups(data.backups || [])
      }
    } catch (error) {
      console.error("Error fetching backups:", error)
      toast.error("Error al cargar los backups")
    }
  }

  const fetchSystemInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/system-info")
      if (response.ok) {
        const data = await response.json()
        setSystemInfo(data)
      }
    } catch (error) {
      console.error("Error fetching system info:", error)
      toast.error("Error al cargar información del sistema")
    } finally {
      setLoading(false)
    }
  }

  const createBackup = async (description?: string) => {
    try {
      setCreating(true)
      const response = await fetch("/api/admin/backups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "manual",
          description: description || "Backup manual creado desde el panel de admin"
        }),
      })

      if (response.ok) {
        toast.success("Backup creado correctamente")
        fetchBackups()
        fetchSystemInfo()
      } else {
        toast.error("Error al crear el backup")
      }
    } catch (error) {
      console.error("Error creating backup:", error)
      toast.error("Error al crear el backup")
    } finally {
      setCreating(false)
    }
  }

  const downloadBackup = async (backupId: string, filename: string) => {
    try {
      const response = await fetch(`/api/admin/backups/${backupId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Backup descargado")
      } else {
        toast.error("Error al descargar el backup")
      }
    } catch (error) {
      console.error("Error downloading backup:", error)
      toast.error("Error al descargar el backup")
    }
  }

  const deleteBackup = async (backupId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este backup?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/backups/${backupId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast.success("Backup eliminado")
        fetchBackups()
        fetchSystemInfo()
      } else {
        toast.error("Error al eliminar el backup")
      }
    } catch (error) {
      console.error("Error deleting backup:", error)
      toast.error("Error al eliminar el backup")
    }
  }

  const restoreBackup = async (backupId: string) => {
    if (!confirm("¿Estás seguro de que quieres restaurar este backup? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      setRestoring(true)
      const response = await fetch(`/api/admin/backups/${backupId}/restore`, {
        method: "POST"
      })

      if (response.ok) {
        toast.success("Backup restaurado correctamente")
        fetchBackups()
        fetchSystemInfo()
      } else {
        toast.error("Error al restaurar el backup")
      }
    } catch (error) {
      console.error("Error restoring backup:", error)
      toast.error("Error al restaurar el backup")
    } finally {
      setRestoring(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "in_progress":
        return <Clock className="w-4 h-4" />
      case "failed":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
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
          <h1 className="text-3xl font-bold">Gestión de Backups</h1>
          <p className="text-muted-foreground">
            Administra copias de seguridad del sistema y datos
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchBackups()}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button 
            onClick={() => createBackup()}
            disabled={creating}
          >
            <Database className="w-4 h-4 mr-2" />
            {creating ? "Creando..." : "Crear Backup"}
          </Button>
        </div>
      </div>

      {/* Información del Sistema */}
      {systemInfo && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Base de Datos</p>
                  <p className="text-2xl font-bold">{formatFileSize(systemInfo.databaseSize)}</p>
                </div>
                <Database className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Almacenamiento Usado</p>
                  <p className="text-2xl font-bold">{formatFileSize(systemInfo.storageUsed)}</p>
                  <p className="text-xs text-muted-foreground">
                    de {formatFileSize(systemInfo.storageLimit)}
                  </p>
                </div>
                <HardDrive className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Usuarios Totales</p>
                  <p className="text-2xl font-bold">{systemInfo.totalUsers}</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold">U</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Último Backup</p>
                  <p className="text-lg font-bold">
                    {systemInfo.lastBackup 
                      ? new Date(systemInfo.lastBackup).toLocaleDateString()
                      : "Nunca"
                    }
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Estado del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Estado del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Backup Automático</p>
                <p className="text-sm text-muted-foreground">
                  {systemInfo?.autoBackupEnabled ? "Activado" : "Desactivado"}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                systemInfo?.autoBackupEnabled ? "bg-green-500" : "bg-red-500"
              }`} />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Espacio Disponible</p>
                <p className="text-sm text-muted-foreground">
                  {systemInfo ? formatFileSize(systemInfo.storageLimit - systemInfo.storageUsed) : "Calculando..."}
                </p>
              </div>
              <HardDrive className="w-5 h-5 text-blue-500" />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Total de Backups</p>
                <p className="text-sm text-muted-foreground">
                  {backups.length} archivos
                </p>
              </div>
              <Database className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Backups */}
      <Card>
        <CardHeader>
          <CardTitle>Backups Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : backups.length > 0 ? (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(backup.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{backup.filename}</h4>
                        <Badge className={getStatusColor(backup.status)}>
                          {backup.status === "completed" ? "Completado" :
                           backup.status === "in_progress" ? "En progreso" : "Fallido"}
                        </Badge>
                        <Badge variant={backup.type === "manual" ? "default" : "secondary"}>
                          {backup.type === "manual" ? "Manual" : "Automático"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(backup.size)} • {new Date(backup.createdAt).toLocaleString()}
                      </p>
                      {backup.description && (
                        <p className="text-sm text-gray-600 mt-1">{backup.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {backup.status === "completed" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadBackup(backup.id, backup.filename)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Descargar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreBackup(backup.id)}
                          disabled={restoring}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          {restoring ? "Restaurando..." : "Restaurar"}
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBackup(backup.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay backups</h3>
              <p className="text-gray-600 mb-4">
                No se han encontrado copias de seguridad. Crea tu primer backup.
              </p>
              <Button onClick={() => createBackup()} disabled={creating}>
                <Database className="w-4 h-4 mr-2" />
                {creating ? "Creando..." : "Crear Primer Backup"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
