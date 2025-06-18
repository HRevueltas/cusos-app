"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  Users,
  BarChart3,
  Settings,
  LogOut,
  User,
  GraduationCap,
  Shield,
  Award,
  FileText,
  Star,
  Activity,
} from "lucide-react"

interface User {
  id: string
  name?: string | null
  email?: string | null
  role: string
}

interface DashboardNavProps {
  user: User
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()

  const getNavItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        href: `/dashboard/${user.role.toLowerCase()}`,
        icon: BarChart3,
      },
    ]

    switch (user.role) {
      case "ADMIN":
        return [
          ...baseItems,
          {
            title: "Usuarios",
            href: "/dashboard/admin/users",
            icon: Users,
          },
          {
            title: "Cursos",
            href: "/dashboard/admin/courses",
            icon: BookOpen,
          },          {
            title: "Reportes",
            href: "/dashboard/admin/reports",
            icon: FileText,
          },
          {
            title: "Logs de Actividad",
            href: "/dashboard/admin/activity-logs",
            icon: Activity,
          },
          {
            title: "Configuración",
            href: "/dashboard/admin/settings",
            icon: Settings,
          },
        ]

      case "INSTRUCTOR":
        return [
          ...baseItems,
          {
            title: "Mis Cursos",
            href: "/dashboard/instructor/courses",
            icon: BookOpen,
          },
          {
            title: "Estudiantes",
            href: "/dashboard/instructor/students",
            icon: Users,
          },
          {
            title: "Analytics",
            href: "/dashboard/instructor/analytics",
            icon: BarChart3,
          },
        ]

      case "STUDENT":
        return [
          ...baseItems,
          {
            title: "Mis Cursos",
            href: "/dashboard/student/courses",
            icon: BookOpen,
          },
          {
            title: "Progreso",
            href: "/dashboard/student/progress",
            icon: BarChart3,
          },
          {
            title: "Certificados",
            href: "/dashboard/student/certificates",
            icon: GraduationCap,
          },
          {
            title: "Mis Reseñas",
            href: "/dashboard/reviews",
            icon: Star,
          },
        ]

      default:
        return baseItems
    }
  }

  const navItems = getNavItems()

  const getRoleIcon = () => {
    switch (user.role) {
      case "ADMIN":
        return Shield
      case "INSTRUCTOR":
        return GraduationCap
      case "STUDENT":
        return User
      default:
        return User
    }
  }

  const RoleIcon = getRoleIcon()

  const getRoleLabel = () => {
    switch (user.role) {
      case "ADMIN":
        return "Administrador"
      case "INSTRUCTOR":
        return "Instructor"
      case "STUDENT":
        return "Estudiante"
      default:
        return "Usuario"
    }
  }

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <RoleIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{getRoleLabel()}</p>
          </div>
        </div>
      </div>

      <nav className="mt-6">
        <div className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="absolute bottom-6 left-6">
        <Button
          variant="outline"
          className="flex items-center"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
