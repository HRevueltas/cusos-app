import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Users, Award, ArrowRight, Star, Search } from "lucide-react"
import { CourseCard } from "@/components/courses/course-card"
import { PublicNavbar } from "@/components/layout/public-navbar"
import { PublicFooter } from "@/components/layout/public-footer"
import { db } from "@/lib/db"

async function getFeaturedCourses() {
  try {
    // Intentar conectar con un timeout más corto
    const courses = await Promise.race([
      db.course.findMany({
        where: {
          isPublished: true,
        },
        include: {
          instructor: true,
          _count: {
            select: {
              enrollments: true,
              modules: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: [
          { enrollments: { _count: "desc" } },
          { createdAt: "desc" },
        ],
        take: 6,
      }),
      // Timeout después de 8 segundos
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database timeout')), 8000)
      ),
    ])

    const coursesWithRating = courses.map((course) => ({
      ...course,
      averageRating: course.reviews.length > 0
        ? course.reviews.reduce((acc, review) => acc + review.rating, 0) / course.reviews.length
        : 0,
    }))

    return coursesWithRating
  } catch (error) {
    console.error("Error fetching featured courses:", error)
    // Retornar array vacío en caso de error para que la página siga funcionando
    return []
  }
}

async function getStats() {
  try {
    // Agregar timeout también para las estadísticas
    const stats = await Promise.race([
      Promise.all([
        db.course.count({ where: { isPublished: true } }),
        db.user.count({ where: { role: "STUDENT" } }),
        db.user.count({ where: { role: "INSTRUCTOR" } }),
      ]),
      // Timeout después de 5 segundos para estadísticas
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Stats timeout')), 5000)
      ),
    ])

    const [coursesCount, studentsCount, instructorsCount] = stats

    return {
      courses: coursesCount,
      students: studentsCount,
      instructors: instructorsCount,
    }
  } catch (error) {
    console.error("Error fetching stats:", error)
    // Retornar estadísticas por defecto
    return {
      courses: 0,
      students: 0,
      instructors: 0,
    }
  }
}

export default async function HomePage() {
  const [featuredCourses, stats] = await Promise.all([
    getFeaturedCourses(),
    getStats(),
  ])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <PublicNavbar />
      
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Aprende y Enseña con
            <span className="text-primary block">Nuestra Plataforma</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Únete a miles de estudiantes e instructores en la mejor plataforma de cursos online. 
            Aprende nuevas habilidades o comparte tu conocimiento con el mundo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register">
              <Button size="lg" className="px-8 py-3">
                Comenzar Gratis
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Explorar Cursos
              </Button>
            </Link>
          </div>          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <form 
                action="/courses" 
                method="GET" 
                className="relative"
              >
                <Input
                  name="search"
                  placeholder="¿Qué quieres aprender hoy?"
                  className="pl-12 pr-4 py-3 text-lg rounded-full border-2 border-gray-200 focus:border-primary"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-6"
                >
                  Buscar
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Featured Courses Section */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Cursos Destacados
              </h2>
              <p className="text-gray-600">
                Los cursos más populares de nuestra plataforma
              </p>
            </div>
            <Link href="/courses">
              <Button variant="outline" className="flex items-center gap-2">
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ¡Próximamente!
              </h3>
              <p className="text-gray-600">
                Estamos preparando increíbles cursos para ti. Regístrate para ser notificado.
              </p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Cursos de Calidad</h3>
            <p className="text-gray-600">
              Accede a cursos creados por expertos en diferentes áreas del conocimiento.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Comunidad Activa</h3>
            <p className="text-gray-600">
              Conecta con otros estudiantes e instructores en nuestra comunidad de aprendizaje.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Certificaciones</h3>
            <p className="text-gray-600">
              Obtén certificados verificables al completar tus cursos exitosamente.
            </p>
          </div>
        </div>        {/* Stats */}
        <div className="mt-20 bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Únete a Nuestra Comunidad
            </h2>
            <p className="text-gray-600">
              Miles de personas ya están aprendiendo y enseñando en nuestra plataforma
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-primary mr-2" />
                <div className="text-3xl font-bold text-primary">{stats.students.toLocaleString()}+</div>
              </div>
              <div className="text-gray-600">Estudiantes Activos</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="w-6 h-6 text-primary mr-2" />
                <div className="text-3xl font-bold text-primary">{stats.courses.toLocaleString()}+</div>
              </div>
              <div className="text-gray-600">Cursos Disponibles</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-6 h-6 text-primary mr-2" />
                <div className="text-3xl font-bold text-primary">{stats.instructors.toLocaleString()}+</div>
              </div>
              <div className="text-gray-600">Instructores Expertos</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-primary mr-2" />
                <div className="text-3xl font-bold text-primary">4.8</div>
              </div>
              <div className="text-gray-600">Calificación Promedio</div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explora por Categorías
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre cursos en las áreas que más te interesan
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Programación", icon: "💻", color: "bg-blue-100 text-blue-800" },
              { name: "Diseño", icon: "🎨", color: "bg-purple-100 text-purple-800" },
              { name: "Marketing", icon: "📈", color: "bg-green-100 text-green-800" },
              { name: "Fotografía", icon: "📸", color: "bg-yellow-100 text-yellow-800" },
              { name: "Música", icon: "🎵", color: "bg-pink-100 text-pink-800" },
              { name: "Idiomas", icon: "🌍", color: "bg-indigo-100 text-indigo-800" },
            ].map((category) => (
              <Link
                key={category.name}
                href={`/courses?category=${encodeURIComponent(category.name)}`}
                className={`p-6 rounded-xl text-center hover:shadow-md transition-shadow ${category.color} group`}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="font-semibold">{category.name}</div>
              </Link>
            ))}
          </div>        </div>
      </main>

      <PublicFooter />
    </div>
  )
}