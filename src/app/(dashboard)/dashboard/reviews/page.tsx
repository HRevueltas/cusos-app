import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { StudentReviews } from '@/components/reviews/student-reviews'

export default async function MyReviewsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <StudentReviews />
    </div>
  )
}
