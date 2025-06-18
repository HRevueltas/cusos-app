import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Redireccionar según el rol del usuario
  switch (session.user.role) {
    case "STUDENT":
      redirect("/dashboard/student")
      break
    case "INSTRUCTOR":
      redirect("/dashboard/instructor")
      break
    case "ADMIN":
      redirect("/dashboard/admin")
      break
    default:
      redirect("/dashboard/student")
  }

  return null
}
