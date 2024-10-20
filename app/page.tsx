//import Link from 'next/link'
//import { Button } from "@/components/ui/button"
import Hero from "@/components/ui/hero"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Footer } from '@/components/footer'
import { HomeHeader } from '@/components/HomeHeader'

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Hero />
        <div className="container mx-auto px-4 py-5">
          <h2 className="text-3xl font-bold mb-6">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Career Transition Tips</CardTitle>
                <CardDescription>Advice for military spouses</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Learn about the best practices for transitioning your career as a military spouse.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Remote Work Opportunities</CardTitle>
                <CardDescription>Flexible jobs for mobile lifestyles</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Discover remote work opportunities that fit well with the military lifestyle.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Education Resources</CardTitle>
                <CardDescription>Continuing education for spouses</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Explore educational resources and programs available to military spouses.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
