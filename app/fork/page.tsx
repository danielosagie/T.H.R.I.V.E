import ForkClient from './ForkClient'
import { Footer } from "@/components/footer"

export const metadata = {
  title: 'Choose Your Path | THRIVE Toolkit',
  description: 'Select whether you\'re a new job seeker or an experienced professional looking to grow.',
}

export default function ForkPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
      <main className="flex-grow">
        <ForkClient />
      </main>
      <Footer />
    </div>
  )
}
