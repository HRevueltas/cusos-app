import { Metadata } from "next"
import { PublicNavbar } from "@/components/layout/public-navbar"
import { PublicFooter } from "@/components/layout/public-footer"
import { BookOpen, Users, Award, Zap, Heart, Target } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Acerca de CursosApp",
  description: "Conoce más sobre nuestra plataforma de educación online"
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Acerca de CursosApp
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Una plataforma de aprendizaje online moderna, diseñada para conectar estudiantes e instructores 
            en una experiencia educativa interactiva y personalizada.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center mb-6">
              <Target className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Nuestra Misión</h2>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              Democratizar el acceso a la educación de calidad mediante una plataforma tecnológica 
              que facilite el intercambio de conocimientos entre instructores expertos y estudiantes 
              motivados, creando una comunidad de aprendizaje continuo.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Cursos Interactivos</h3>
            </div>
            <p className="text-gray-600">
              Contenido multimedia con videos, lecciones estructuradas y material complementario 
              para un aprendizaje completo.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Comunidad de Aprendizaje</h3>
            </div>
            <p className="text-gray-600">
              Conecta con instructores expertos y compañeros de estudio para una experiencia 
              de aprendizaje colaborativa.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Award className="w-8 h-8 text-purple-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Certificaciones</h3>
            </div>
            <p className="text-gray-600">
              Obtén certificados de finalización que validen tu progreso y nuevas habilidades 
              adquiridas.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Zap className="w-8 h-8 text-yellow-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Progreso Personalizado</h3>
            </div>
            <p className="text-gray-600">
              Seguimiento detallado de tu avance con métricas personalizadas y recomendaciones 
              adaptadas a tu ritmo.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Heart className="w-8 h-8 text-red-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Experiencia Intuitiva</h3>
            </div>
            <p className="text-gray-600">
              Interfaz moderna y fácil de usar, diseñada para que te enfoques en lo que realmente 
              importa: aprender.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <BookOpen className="w-8 h-8 text-indigo-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Variedad de Contenido</h3>
            </div>
            <p className="text-gray-600">
              Desde programación hasta diseño, encuentra cursos en múltiples categorías 
              para desarrollar tus habilidades.
            </p>
          </div>
        </div>

     

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Listo para comenzar tu viaje de aprendizaje?
            </h2>
            <p className="text-gray-600 mb-6">
              Únete a nuestra comunidad y descubre todo lo que puedes lograr.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/courses"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Explorar Cursos
              </Link>
              <a
                href="/contact"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Contáctanos
              </a>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
