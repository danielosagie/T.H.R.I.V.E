"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { IndustrySelect } from "@/components/industry-select"
import { FileText, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-hot-toast"

interface Position {
  title: string
  company: string
  industry: string
  description: string
  instructions?: string
  createdAt: number
}

interface TailorPositionDialogProps {
  onTailor: (position: Position) => void
  selectedPosition?: Position
  onPositionSelect: (position: Position | null) => void
}

export function TailorPositionDialog({ onTailor, selectedPosition, onPositionSelect }: TailorPositionDialogProps) {
  const [open, setOpen] = useState(false)
  const [positions, setPositions] = useState<Position[]>([])
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)

  useEffect(() => {
    if (selectedPosition) {
      setEditingPosition(selectedPosition)
      setOpen(true)
    }
  }, [selectedPosition])

  useEffect(() => {
    const savedPositions = localStorage.getItem('tailoredPositions')
    if (savedPositions) {
      const parsed = JSON.parse(savedPositions)
      setPositions(parsed)
    }
  }, [])

  const handleSavePosition = () => {
    if (!editingPosition) return
    
    const updatedPositions = positions.some(p => p.createdAt === editingPosition.createdAt)
      ? positions.map(p => p.createdAt === editingPosition.createdAt ? editingPosition : p)
      : [...positions, { ...editingPosition, createdAt: Date.now() }]
    
    setPositions(updatedPositions)
    localStorage.setItem('tailoredPositions', JSON.stringify(updatedPositions))
    onPositionSelect(editingPosition)
    toast.success("Position saved successfully!")
    setOpen(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => {
          setEditingPosition(selectedPosition || null)
          setOpen(true)
        }}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        {selectedPosition ? `${selectedPosition.company} - ${selectedPosition.title}` : 'No Position Set'}
      </Button>

      <Button
        variant="default"
        onClick={() => {
          if (!selectedPosition) {
            toast.error("Please select or create a position first")
            return
          }
          onTailor(selectedPosition)
        }}
        className="flex items-center gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Tailor to Position
      </Button>

      <Dialog 
        open={open} 
        onOpenChange={(newOpen) => {
          setOpen(newOpen)
          if (!newOpen) {
            setEditingPosition(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Position to Tailor</DialogTitle>
          </DialogHeader>
          
          <Select
            value={selectedPosition?.title || "none"}
            onValueChange={(value) => {
              if (value === "new") {
                setEditingPosition({
                  title: "",
                  company: "",
                  industry: "",
                  description: "",
                  instructions: "",
                  createdAt: Date.now()
                })
              } else if (value === "none") {
                onPositionSelect(null)
                setEditingPosition(null)
                toast.success("Position selection cleared")
              } else {
                const position = positions.find(p => p.title === value)
                if (position) {
                  setEditingPosition({ ...position })
                  onPositionSelect(position)
                }
              }
            }}
          >
            <SelectTrigger className="w-full mb-4">
              <SelectValue placeholder="Select or create position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Position Selected</SelectItem>
              <SelectItem value="new">Create New Position</SelectItem>
              {positions.map((position) => (
                <SelectItem key={position.title} value={position.title}>
                  {position.company} - {position.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {editingPosition && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label>Position Title</label>
                <Input
                  value={editingPosition.title}
                  onChange={(e) => setEditingPosition(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                  placeholder="Enter position title"
                />
              </div>
              <div className="grid gap-2">
                <label>Industry</label>
                <IndustrySelect
                  value={editingPosition.industry}
                  onChange={(value) => setEditingPosition(prev => prev ? ({ ...prev, industry: value }) : null)}
                />
              </div>
              <div className="grid gap-2">
                <label>Company</label>
                <Input
                  value={editingPosition.company}
                  onChange={(e) => setEditingPosition(prev => prev ? ({ ...prev, company: e.target.value }) : null)}
                  placeholder="Enter company name"
                />
              </div>
              <div className="grid gap-2">
                <label>Description</label>
                <Textarea
                  value={editingPosition.description}
                  onChange={(e) => setEditingPosition(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  placeholder="Enter job description"
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <label>Special Instructions</label>
                <Textarea
                  value={editingPosition.instructions}
                  onChange={(e) => setEditingPosition(prev => prev ? ({ ...prev, instructions: e.target.value }) : null)}
                  placeholder="Add any specific tailoring instructions..."
                  rows={3}
                />
              </div>
              <Button onClick={handleSavePosition}>Save Position</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 