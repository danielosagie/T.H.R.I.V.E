'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from "@/components/ui/button"

export function HomeHeader() {
  const [isAboutOpen, setIsAboutOpen] = useState(false)

  return (
    <header className="py-4 px-6 border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/assets/logo.svg" alt="THRIVE Toolkit Logo" width={24} height={24} />
          <span className="font-semibold">THRIVE Toolkit</span>
        </Link>
        
        <Dialog.Root open={isAboutOpen} onOpenChange={setIsAboutOpen}>
          <Dialog.Trigger asChild>
            <Button variant="outline">About</Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96 max-w-full">
              <Dialog.Title className="text-lg font-semibold mb-2">About THRIVE Toolkit</Dialog.Title>
              <Dialog.Description className="text-sm text-gray-600 mb-4">
                THRIVE Toolkit is a comprehensive platform designed to empower individuals in their career development journey. Our tools help users create personalized experience cards, track their progress, and make informed decisions about their professional growth.
              </Dialog.Description>
              <div className="flex justify-end">
                <Dialog.Close asChild>
                  <Button variant="outline">Close</Button>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  )
}

