"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export function useStats(role: string) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { data: session } = useSession()
  useEffect(() => {
    if (!session) {
      setLoading(false)
      return
    }

    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const endpoint = {
          STUDENT: "/api/student/stats",
          INSTRUCTOR: "/api/instructor/stats", 
          ADMIN: "/api/admin/stats"
        }[role]

        if (!endpoint) {
          throw new Error("Rol no válido")
        }

        const response = await fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al obtener estadísticas")
        }

        const data = await response.json()
        setStats(data)
      } catch (err: any) {
        setError(err.message)
        console.error("Error fetching stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [session, role])
  return { 
    stats, 
    loading, 
    error, 
    refetch: () => {
      if (session) {
        setLoading(true)
        setError(null)
        // Trigger re-fetch by updating a dependency
        setStats(null)
      }
    }
  }
}
