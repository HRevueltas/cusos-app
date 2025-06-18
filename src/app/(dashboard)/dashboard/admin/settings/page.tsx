"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Shield,
  Globe,
  FileText,
  Database,
  Activity,
  Trash2
} from "lucide-react"
import { toast } from "react-hot-toast"

interface SystemSettings {
  general: {
    siteName: string
    siteDescription: string
    siteUrl: string
    logoUrl: string
    faviconUrl: string
    supportEmail: string
    contactEmail: string
    socialMedia: {
      facebook?: string
      twitter?: string
      instagram?: string
      linkedin?: string
    }
  }
  features: {
    registrationEnabled: boolean
    courseCreationEnabled: boolean
    reviewsEnabled: boolean
    certificatesEnabled: boolean
    notificationsEnabled: boolean
    multiLanguageEnabled: boolean
  }
  security: {
    sessionTimeout: number
    passwordMinLength: number
    requireEmailVerification: boolean
    enableTwoFactor: boolean
    maxLoginAttempts: number
    blockDuration: number
  }
  content: {
    maxCourseSize: number
    allowedFileTypes: string[]
    maxVideoLength: number
    autoApproval: boolean
    contentModerationEnabled: boolean
  }
}

export default function AdminSettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchSettings()
    }
  }, [session])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast.error("Error al cargar la configuración")
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!settings) return
    
    try {
      setSaving(true)
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success("Configuración guardada correctamente")
      } else {
        toast.error("Error al guardar la configuración")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Error al guardar la configuración")
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = async () => {
    if (confirm("¿Estás seguro de que quieres restaurar la configuración por defecto?")) {
      try {
        setSaving(true)
        const response = await fetch("/api/admin/settings/reset", {
          method: "POST",
        })

        if (response.ok) {
          await fetchSettings()
          toast.success("Configuración restaurada a valores por defecto")
        } else {
          toast.error("Error al restaurar la configuración")
        }
      } catch (error) {
        console.error("Error resetting settings:", error)
        toast.error("Error al restaurar la configuración")
      } finally {
        setSaving(false)
      }
    }
  }

  const updateSettings = (section: keyof SystemSettings, field: string, value: any) => {
    if (!settings) return
    
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value
      }
    }))
  }

  const updateNestedSettings = (section: keyof SystemSettings, nestedField: string, field: string, value: any) => {
    if (!settings) return
    
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [nestedField]: {
          ...(prev![section] as any)[nestedField],
          [field]: value
        }
      }
    }))
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

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
          <p className="text-muted-foreground">
            Configura y personaliza la plataforma según tus necesidades
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={resetToDefaults}
            disabled={saving}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Restaurar
          </Button>
          <Button 
            onClick={saveSettings}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Funciones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="content">Contenido</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Información General del Sitio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="siteName">Nombre del Sitio</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => updateSettings("general", "siteName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="siteUrl">URL del Sitio</Label>
                  <Input
                    id="siteUrl"
                    value={settings.general.siteUrl}
                    onChange={(e) => updateSettings("general", "siteUrl", e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="siteDescription">Descripción del Sitio</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSettings("general", "siteDescription", e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="logoUrl">URL del Logo</Label>
                  <Input
                    id="logoUrl"
                    value={settings.general.logoUrl}
                    onChange={(e) => updateSettings("general", "logoUrl", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="faviconUrl">URL del Favicon</Label>
                  <Input
                    id="faviconUrl"
                    value={settings.general.faviconUrl}
                    onChange={(e) => updateSettings("general", "faviconUrl", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="supportEmail">Email de Soporte</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => updateSettings("general", "supportEmail", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Email de Contacto</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => updateSettings("general", "contactEmail", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Redes Sociales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={settings.general.socialMedia.facebook || ""}
                    onChange={(e) => updateNestedSettings("general", "socialMedia", "facebook", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={settings.general.socialMedia.twitter || ""}
                    onChange={(e) => updateNestedSettings("general", "socialMedia", "twitter", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={settings.general.socialMedia.instagram || ""}
                    onChange={(e) => updateNestedSettings("general", "socialMedia", "instagram", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={settings.general.socialMedia.linkedin || ""}
                    onChange={(e) => updateNestedSettings("general", "socialMedia", "linkedin", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Funcionalidades de la Plataforma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Registro de Usuarios</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir que nuevos usuarios se registren
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.registrationEnabled}
                    onCheckedChange={(checked: boolean) => updateSettings("features", "registrationEnabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Creación de Cursos</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir a instructores crear cursos
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.courseCreationEnabled}
                    onCheckedChange={(checked: boolean) => updateSettings("features", "courseCreationEnabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sistema de Reseñas</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir reseñas y calificaciones
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.reviewsEnabled}
                    onCheckedChange={(checked: boolean) => updateSettings("features", "reviewsEnabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Certificados</Label>
                    <p className="text-sm text-muted-foreground">
                      Generar certificados de finalización
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.certificatesEnabled}
                    onCheckedChange={(checked: boolean) => updateSettings("features", "certificatesEnabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones</Label>
                    <p className="text-sm text-muted-foreground">
                      Sistema de notificaciones internas
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.notificationsEnabled}
                    onCheckedChange={(checked: boolean) => updateSettings("features", "notificationsEnabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Multi-idioma</Label>
                    <p className="text-sm text-muted-foreground">
                      Soporte para múltiples idiomas
                    </p>
                  </div>                  <Switch
                    checked={settings.features.multiLanguageEnabled}
                    onCheckedChange={(checked: boolean) => updateSettings("features", "multiLanguageEnabled", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Configuración de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSettings("security", "sessionTimeout", parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="passwordMinLength">Longitud Mínima de Contraseña</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSettings("security", "passwordMinLength", parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="maxLoginAttempts">Máximos Intentos de Login</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSettings("security", "maxLoginAttempts", parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="blockDuration">Duración de Bloqueo (minutos)</Label>
                  <Input
                    id="blockDuration"
                    type="number"
                    value={settings.security.blockDuration}
                    onChange={(e) => updateSettings("security", "blockDuration", parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Verificación de Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Requiere verificación de email al registrarse
                    </p>
                  </div>                  <Switch
                    checked={settings.security.requireEmailVerification}
                    onCheckedChange={(checked: boolean) => updateSettings("security", "requireEmailVerification", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Autenticación de Dos Factores</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilitar 2FA para administradores
                    </p>
                  </div>                  <Switch
                    checked={settings.security.enableTwoFactor}
                    onCheckedChange={(checked: boolean) => updateSettings("security", "enableTwoFactor", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Gestión de Contenido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="maxCourseSize">Tamaño Máximo de Curso (MB)</Label>
                  <Input
                    id="maxCourseSize"
                    type="number"
                    value={settings.content.maxCourseSize}
                    onChange={(e) => updateSettings("content", "maxCourseSize", parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxVideoLength">Duración Máxima de Video (minutos)</Label>
                  <Input
                    id="maxVideoLength"
                    type="number"
                    value={settings.content.maxVideoLength}
                    onChange={(e) => updateSettings("content", "maxVideoLength", parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label>Tipos de Archivo Permitidos</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["mp4", "avi", "mov", "pdf", "docx", "pptx", "xlsx", "zip", "rar"].map((type) => (
                    <Badge
                      key={type}
                      variant={settings.content.allowedFileTypes.includes(type) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const current = settings.content.allowedFileTypes
                        const updated = current.includes(type)
                          ? current.filter(t => t !== type)
                          : [...current, type]
                        updateSettings("content", "allowedFileTypes", updated)
                      }}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Aprobación Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Aprobar cursos automáticamente al publicar
                    </p>
                  </div>                  <Switch
                    checked={settings.content.autoApproval}
                    onCheckedChange={(checked: boolean) => updateSettings("content", "autoApproval", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Moderación de Contenido</Label>
                    <p className="text-sm text-muted-foreground">
                      Revisar contenido antes de publicar
                    </p>
                  </div>
                  <Switch
                    checked={settings.content.contentModerationEnabled}
                    onCheckedChange={(checked) => updateSettings("content", "contentModerationEnabled", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Mantenimiento del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Limpieza Automática</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Configurar la limpieza automática de logs y archivos temporales del sistema.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Limpiar Logs Antiguos
                  </Button>
                  <Button variant="outline" size="sm">
                    Optimizar Base de Datos
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Respaldo de Datos</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Gestionar respaldos automáticos y manuales del sistema.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Crear Respaldo Manual
                  </Button>
                  <Button variant="outline" size="sm">
                    Ver Respaldos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
