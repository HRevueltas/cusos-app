import Link from "next/link"
import { GraduationCap } from "lucide-react"

export function PublicFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Company info */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">CursosApp</span>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              Plataforma de cursos online diseñada para acelerar tu aprendizaje con contenido de alta calidad.
            </p>
          </div>

          {/* Navigation links */}
          <div className="flex flex-col md:flex-row gap-6">
            <nav className="flex flex-col md:flex-row gap-4 md:gap-6">
              <Link href="/courses" className="text-gray-400 hover:text-white transition-colors text-sm">
                Cursos
              </Link>
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
                Dashboard
              </Link>
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                Acerca de
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                Contacto
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-6">
          <p className="text-gray-400 text-sm text-center md:text-left">
            © {currentYear} CursosApp. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
