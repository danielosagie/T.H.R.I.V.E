"use client";

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const HERO_IMAGE = "https://utfs.io/f/azdjmzDIYeboABc3dGr6vMQuERNKGxq9XlSJWAhVmYpHC7PZ"

export default function Hero() {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="bg-background py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
          <div className="flex flex-col justify-center min-h-[400px] gap-6 lg:min-h-[600px] p-6">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Decode Your Past,<br /> Design Your Future <br />
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              AI-powered tool assisting military spouses to self-reflect and translate their unique experiences and skills for career growth  
            </p>
            <div className="flex items-center gap-x-6">
              <Link href="/fork" passHref>
                <Button size="lg">Create New</Button>
              </Link>
              <Link href="/continue" passHref>
                <Button variant="outline" size="lg">Continue Editing</Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center min-h-[400px] lg:min-h-[600px]">
            <div className="relative w-full h-full min-h-[550px]">
              <Image
                src={HERO_IMAGE}
                alt="Hero illustration"
                fill
                priority
                className="object-contain"
                onError={() => setImageError(true)}
                unoptimized // Try this if the optimization is causing issues
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
