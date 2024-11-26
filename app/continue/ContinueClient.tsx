'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from 'next/image'
import { HomeHeader } from "@/components/HomeHeader"
import Link from 'next/link'

export default function ForkClient() {
  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <header className="flex items-center m-5 space-x-2 mb-8">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/assets/logo.svg" alt="THRIVE Toolkit Logo" width={24} height={24} />
          <h1 className="text-2xl font-bold">THRIVE Toolkit</h1>
        </Link>
      </header>

      <h2 className="text-3xl font-bold text-center mb-6">Which do you want to continue editing?</h2>
      <p className="text-center mb-8 text-gray-600">
        Click on one of the two cards below to continue editing. 
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <Link href="/view" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full">
            <CardContent className="p-4 sm:p-6 flex flex-col">
              <div 
                className="w-full rounded-md bg-gradient-to-br from-purple-500 via-pink-500 to-red-500"
                style={{ aspectRatio: '16 / 9' }}
              />
              <div className="flex flex-col flex-grow">
                <h3 className="text-lg sm:text-xl text-center mt-4 font-bold">Experience Card</h3>
                <p className="text-sm text-center font-semibold mb-2">Your Career Journey, Your Control</p>
                <p className="text-sm sm:text-base mb-4 flex-grow">
                  Build a secure, dynamic portfolio of your professional experiences that evolves with you. Track growth, highlight achievements, and manage your data locally with flexible export options.
                </p>
                <Button className="w-full mt-auto">
                  Edit Experience Card
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/star" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full">
            <CardContent className="p-4 sm:p-6 flex flex-col">
              <div 
                className="w-full rounded-md bg-gradient-to-br from-blue-500 via-teal-500 to-emerald-500"
                style={{ aspectRatio: '16 / 9' }}
              />
              <div className="flex flex-col flex-grow">
                <h3 className="text-lg sm:text-xl font-bold text-center mt-4">STAR Bullets</h3>
                <p className="text-sm font-semibold text-center mb-2">Transform Your Experience into Impact</p>
                <p className="text-sm sm:text-base mb-4 flex-grow">
                  Helps you turn your work, school, and volunteer experiences into powerful resume bullet points that captivate employers. Turn your career story into compelling resumes using proven STAR and XYZ frameworks
                </p>
                <Button className="w-full hmt-auto">
                  Edit STAR Bullets
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
