import ForkPage from '@/components/fork-page'
import { Footer } from "@/components/footer"

export default function ForkPageWrapper() {
  return (
    <div className="min-h-screen flex flex-col">
      <ForkPage />
      <Footer />
    </div>
  )
}
