'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-neutral-500">
          Designed by Georgia Tech Research Institute
        </div>
        <div className="text-neutral-500">
          <Link href="/about" className="mr-4">About</Link>
          <Link href="/feedback">Feedback</Link>
        </div>
      </div>
    </footer>
  )
}