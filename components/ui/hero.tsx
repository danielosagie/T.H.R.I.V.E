"use client";

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import posterImage from "@/public/assets/poster.svg";

const Hero = () => {
  return (
    <div className="bg-background py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 items-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Decode Your Past,<br /> Design Your Future
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
            AI-powered tool assisting military spouses to self-reflect and translate their unique experiences and skills for career growth  
            </p>
            <div className="flex items-center gap-x-6">
              <Link href="/fork" passHref>
                <Button size="lg">Create New</Button>
              </Link>
              <Link href="/view" passHref>
                <Button variant="outline" size="lg">Continue Editing</Button>
              </Link>
            </div>
          </div>
          <div className="relative bg-muted rounded-lg overflow-hidden">
            <Image src={posterImage}
              alt="Hero image"
              className="w-full h-auto object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
