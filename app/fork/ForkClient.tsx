'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from 'next/image'
import Link from 'next/link'

export default function ForkClient() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center space-x-2 mb-8">
        <Image src="/assets/logo.svg" alt="THRIVE Toolkit Logo" width={24} height={24} />
        <h1 className="text-2xl font-bold">THRIVE Toolkit</h1>
      </header>

      <h2 className="text-3xl font-bold text-center mb-6">Which of the following best describes you?</h2>
      <p className="text-center mb-8 text-gray-600">
        Click on one of the two descriptions below. This will help us guide you through self-reflection of
        your experiences or translation of specific experiences using the STAR format.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/input" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-fit">
            <CardContent className="p-6">
              <div className="relative w-full aspect-[4/3] max-w-[400px] mx-auto mb-4">
                <Image 
                  src="/assets/exp.png" 
                  alt="Searcher Icon" 
                  fill
                  className="object-contain rounded-md"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">New Job Seeker/Career Transitioner</h3>
              <p className="text-sm text-green-600 mb-4">&quot;I&apos;m just starting out and exploring my career options&quot;</p>
              <p className="mb-4">
                You&apos;re at the beginning of your journey, curious about different professions and eager to uncover your
                potential. We&apos;ll guide you through self-reflection, helping you create a personalized Experience Card
                that highlights the unique value you bring to employers.
              </p>
              <Button className="w-full">
                Create Experience Card
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/star" className="block transition-transform hover:scale-[1.02]">
          <Card>
            <CardContent className="p-6">
              <div className="relative w-full aspect-[4/3] max-w-[400px] mx-auto mb-4">
                <Image 
                  src="/assets/star.png" 
                  alt="Experienced Professional Icon" 
                  fill
                  className="object-contain rounded-md"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
                />
              </div>
              <h3 className="text-xl font-bold mb-2">Experienced and Looking to Grow</h3>
              <p className="text-sm mb-4">&quot;I have experience and want to take the next step.&quot;</p>
              <p className="mb-4">
                You&apos;re returning to the workforce or considering a career shift. We&apos;ll guide you through building targeted
                STAR Bullets to highlight your transferable skills and help you connect with new opportunities.
              </p>
              <Button className="w-full">
                Create STAR Bullets
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
