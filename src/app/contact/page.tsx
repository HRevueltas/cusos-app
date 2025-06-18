import { Metadata } from "next"
import { PublicNavbar } from "@/components/layout/public-navbar"
import { PublicFooter } from "@/components/layout/public-footer"
import { Mail, MessageSquare, HelpCircle, BookOpen, Users, Lightbulb } from "lucide-react"

export const metadata: Metadata = {
  title: "Contacto - CursosApp",
  description: "Ponte en contacto con el equipo de CursosApp"
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contáctanos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ¿Tienes preguntas, sugerencias o necesitas ayuda? Estamos aquí para ayudarte.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Información de Contacto
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email General</h3>
                    <p className="text-gray-600">contacto@cursosapp.com</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Para consultas generales y información sobre la plataforma
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Soporte Técnico</h3>
                    <p className="text-gray-600">soporte@cursosapp.com</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Para problemas técnicos y ayuda con la plataforma
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Instructores</h3>
                    <p className="text-gray-600">instructores@cursosapp.com</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Para información sobre cómo crear y gestionar cursos
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Sugerencias</h3>
                    <p className="text-gray-600">feedback@cursosapp.com</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Comparte tus ideas para mejorar la plataforma
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white p-8">
              <h3 className="text-xl font-bold mb-4">¿Eres Instructor?</h3>
              <p className="mb-4">
                Si estás interesado en crear y compartir tu conocimiento a través de cursos, 
                nos encantaría conocerte.
              </p>
              <div className="flex items-center space-x-2 text-sm">
                <Users className="w-4 h-4" />
                <span>Únete a nuestra comunidad de instructores</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Envíanos un mensaje
            </h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Asunto
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona un asunto</option>
                  <option value="general">Consulta general</option>
                  <option value="technical">Soporte técnico</option>
                  <option value="instructor">Información para instructores</option>
                  <option value="feedback">Sugerencias y feedback</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Escribe tu mensaje aquí..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>Enviar Mensaje</span>
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Este es un formulario de ejemplo. En un entorno de producción, 
                estaría conectado a un sistema de gestión de emails para procesar los mensajes.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Preguntas Frecuentes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">¿Cómo me registro como instructor?</h3>
                <p className="text-gray-600 text-sm">
                  Contacta con nuestro equipo a través de instructores@cursosapp.com para obtener 
                  información sobre el proceso de registro y los requisitos.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">¿Puedo acceder a los cursos desde móvil?</h3>
                <p className="text-gray-600 text-sm">
                  Sí, nuestra plataforma es completamente responsive y funciona perfectamente 
                  en dispositivos móviles y tablets.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">¿Los certificados tienen validez oficial?</h3>
                <p className="text-gray-600 text-sm">
                  Los certificados son de finalización de curso y representan el logro de haber 
                  completado el contenido educativo.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">¿Cómo reporto un problema técnico?</h3>
                <p className="text-gray-600 text-sm">
                  Envía un email a soporte@cursosapp.com con una descripción detallada del problema 
                  y te ayudaremos lo antes posible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
