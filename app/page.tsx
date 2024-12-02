import Hero from "@/components/ui/hero"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Footer } from '@/components/footer'
import { HomeHeader } from '@/components/HomeHeader'
import Image from "next/image"
import Link from 'next/link'

const SECO_IMAGE = "https://utfs.io/f/azdjmzDIYebozZMmZPQMbHGwPvRBq23TCpnU0fjDdmgYaSyV";
const MILSPOUSE_IMAGE = "https://utfs.io/f/azdjmzDIYeboxttpWAOBQwjEaC6XnmV82IfltD0bkNhy7YcS";
const MSEP_IMAGE = "https://utfs.io/f/azdjmzDIYeboI5Y9u4KbjcdYFXSvJ1PZVuqMnwO3y8AWseit";


const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Hero />
        <div className="container mx-auto px-4 py-5">
          <h2 className="text-3xl font-bold mb-6">Featured Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link 
              href="https://myseco.militaryonesource.mil/portal/" 
              target="_blank" 
              className="block transition-transform hover:-translate-y-1"
            >
              <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
                <div className="relative aspect-[16/9] m-4 w-auto rounded-2xl overflow-hidden">
                  <Image 
                    src={SECO_IMAGE} 
                    alt="MySECO" 
                    fill
                    className="object-cover rounded-2xl hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw"
                  />
                </div>
                <CardHeader>
                  <CardTitle>Education and Career Guidance</CardTitle>
                  <CardDescription>MySECO (Spouse Education and Career Opportunities)</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p>Explore the guidance, comprehensive resources, and tools offered by the DoD for military spouses worldwide at all stages of career progression.</p>
                </CardContent>
              </Card>
            </Link>
            <Link 
              href="https://myseco.militaryonesource.mil/portal/topic/find-a-job" 
              target="_blank"
              className="block transition-transform hover:-translate-y-1"
            >
              <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
                <div className="relative aspect-[16/9] m-4 w-auto rounded-2xl overflow-hidden">
                  <Image 
                    src={MSEP_IMAGE} 
                    alt="MSEP" 
                    fill
                    className="object-scale-down rounded-2xl hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw"
                  />
                </div>
                <CardHeader>
                  <CardTitle>Employment Opportunities</CardTitle>
                  <CardDescription>MSEP (Military Spouse Employment Partnership)</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p>Discover career opportunities with DoD-partnered employers dedicated to recruiting, hiring, and supporting military spouses.</p>
                </CardContent>
              </Card>
            </Link>
            <Link 
              href="https://www.milspouseroadmap.org/" 
              target="_blank"
              className="block transition-transform hover:-translate-y-1"
            >
              <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
                <div className="relative aspect-[16/9] m-4 w-auto rounded-2xl overflow-hidden">
                  <Image 
                    src={MILSPOUSE_IMAGE} 
                    alt="MILSPOUSE" 
                    fill
                    className="object-scale-down rounded-2xl hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw"
                  />
                </div>
                <CardHeader>
                  <CardTitle>Career Resources</CardTitle>
                  <CardDescription>MILSPOUSE by MSEP (Military Spouse Employment Partnership)</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p>Understand three common career paths for military spouses - entrepreneurship, remote work, and upskilling. Each path provides steps, tips, and resources to guide you.</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
