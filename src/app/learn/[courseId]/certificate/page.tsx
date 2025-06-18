'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CertificateViewer } from '@/components/learn/certificate-viewer'

interface CertificatePageProps {
  params: Promise<{
    courseId: string
  }>
}

export default function CertificatePage({ params }: CertificatePageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [courseId, setCourseId] = useState<string>('')

  useEffect(() => {
    params.then(({ courseId }) => {
      setCourseId(courseId)
    })
  }, [params])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/login')
      return
    }
    
    setIsLoading(false)
  }, [session, status, router])
  if (isLoading || status === 'loading' || !courseId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando certificado...</p>
        </div>
      </div>
    )
  }
  return (
    <CertificateViewer 
      courseId={courseId}
    />
  )
}
