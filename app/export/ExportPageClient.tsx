"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function ExportPageClient() {
  const [exportFormat, setExportFormat] = useState('pdf')

  const handleExport = () => {
    // Implement export logic here
    console.log(`Exporting in ${exportFormat} format`)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Export Page</h1>
      <select 
        value={exportFormat} 
        onChange={(e) => setExportFormat(e.target.value)}
        className="mb-4 p-2 border rounded"
      >
        <option value="pdf">PDF</option>
        <option value="json">JSON</option>
      </select>
      <div>
        <Button onClick={handleExport} className="mr-2">Export</Button>
        <Link href="/view" passHref>
          <Button variant="outline">Back to View</Button>
        </Link>
      </div>
    </div>
  )
}
