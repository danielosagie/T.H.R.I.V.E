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

      <h2 className="text-3xl font-bold text-center mb-6">Which do you want to continue editing?</h2>
      <p className="text-center mb-8 text-gray-600">
        Click on one of the two cards below to continue editing. 
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/view" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-fit">
            <CardContent className="p-6">
              <div 
                className="w-full h-full rounded-md bg-gradient-to-br from-purple-500 via-pink-500 to-red-500"
                style={{ aspectRatio: '1 / 1' }}
              />
              <h3 className="text-xl text-center mt-5 font-bold mb-2">Experience Card</h3>
              <p className="text-sm text-center font-semibold mb-4">Your Career Journey, Your Control</p>
              <p className="mb-4">
                Build a secure, dynamic portfolio of your professional experiences that evolves with you. Track growth, highlight achievements, and manage your data locally with flexible export options.
              </p>
              <Button className="w-full">
                Edit Experience Card
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/star" className="block transition-transform hover:scale-[1.02]">
          <Card>
            <CardContent className="p-6">
              <div 
                className="w-full h-full rounded-md bg-gradient-to-br from-blue-500 via-teal-500 to-emerald-500"
                style={{ aspectRatio: '1 / 1' }}
              />
              <h3 className="text-xl font-bold mt-5 text-center mb-2">STAR Bullets</h3>
              <p className="text-sm font-semibold text-center mb-4">Transform Your Experience into Impact</p>
              <p className="mb-4">
                Helps you turn your work, school, and volunteer experiences into powerful resume bullet points that captivate employers.
              </p>
              <Button className="w-full">
                Edit STAR Bullets
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
