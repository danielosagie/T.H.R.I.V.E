"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StarExperienceCard } from "@/components/star-experience-card"
import { PersonaData } from "@/types/types"
import { GradientPicker } from "@/components/app-picker-gradient-picker"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType } from "docx"
import { saveAs } from "file-saver"
import { useRouter } from "next/navigation"
import { getExperienceData } from "@/lib/data"

interface Experience {
  id: number
  title: string
  company: string
  type: 'work' | 'volunteer' | 'school'
  dateRange: {
    startMonth: string
    startYear: string
    endMonth: string
    endYear: string
  }
  bullets: string[]
  selected: boolean
}

export function StarExportPage() {
  const router = useRouter()
  const [background, setBackground] = useState<string>("linear-gradient(to top left,#accbee,#e7f0fd)")
  const [cardView, setCardView] = useState<"experience" | "resume">("experience")
  const cardRef = useRef<HTMLDivElement>(null)
  const [currentExperience, setCurrentExperience] = useState<PersonaData | null>(null)
  const [firstName, setFirstName] = useState<string>("")
  const [selectedExperiences, setSelectedExperiences] = useState<Experience[]>([])

  useEffect(() => {
    // Get the last active experience data
    const loadExperience = async () => {
      const data = await getExperienceData()
      if (data) {
        setCurrentExperience(data)
        // Extract first name from full name
        const firstNameMatch = data.name?.split(' ')[0] || "User"
        setFirstName(firstNameMatch)
      }
    }
    
    loadExperience()
  }, [])

  useEffect(() => {
    // Load selected experiences from localStorage or create example data
    const savedExperiences = localStorage.getItem('starExperiences')
    if (savedExperiences) {
      const allExperiences = JSON.parse(savedExperiences)
      const selected = allExperiences.filter((exp: Experience) => exp.selected)
      setSelectedExperiences(selected)
    } else {
      // Example data
      const exampleExperience = {
        id: 1,
        title: "Lead Project Manager",
        company: "Ruffian Corp.",
        type: "work",
        dateRange: {
          startMonth: "January",
          startYear: "2022",
          endMonth: "December",
          endYear: "2023"
        },
        bullets: [
          "Spearheaded operational overhaul that addressed inefficiencies, employee turnover, and shipping cost spikes, contributing to the company's goal of $20M per store.",
          "Developed and implemented 14 streamlined procedures to optimize daily operations, improving workflow efficiency and reducing redundancies.",
          "Restructured shipping processes, negotiating partnerships that cut shipping costs by $140,000 annually while enhancing delivery times.",
          "Launched an employee engagement initiative, reducing employee churn by 7% through tailored support and satisfaction programs.",
          "Achieved an average increase of $10,000 in monthly sales by improving customer experience and optimizing employee performance, boosting overall store performance."
        ],
        selected: true
      }
      setSelectedExperiences([exampleExperience])
      localStorage.setItem('starExperiences', JSON.stringify([exampleExperience]))
    }
  }, [])

  // Navigation handlers
  const handleGoToSTAR = () => {
    router.push("/star")
  }

  const handleGoHome = () => {
    router.push("/")
  }

  const handleGoToExp = () => {
    router.push("/input")
  }

  const exportAsImage = async () => {
    if (cardRef.current) {
      try {
        const margin = 40;
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null,
          scale: 2,
        });
        const newCanvas = document.createElement("canvas");
        const ctx = newCanvas.getContext("2d");
        if (ctx) {
          newCanvas.width = canvas.width + 2 * margin;
          newCanvas.height = canvas.height + 2 * margin;
          
          const gradientColors = background.match(/rgba?\([\d\s,\.]+\)/g);
          if (gradientColors && gradientColors.length >= 2) {
            const gradient = ctx.createLinearGradient(0, 0, newCanvas.width, newCanvas.height);
            gradient.addColorStop(0, gradientColors[0]);
            gradient.addColorStop(1, gradientColors[1]);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
          }
          
          ctx.drawImage(canvas, margin, margin);
        }
        const image = newCanvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = "experience-card.png";
        link.click();
      } catch (error) {
        console.error("Error exporting image:", error);
      }
    }
  };

  const exportAsPDF = async () => {
    if (cardRef.current) {
      try {
        const margin = 40;
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null,
          scale: 2,
        });
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [canvas.width + 2 * margin, canvas.height + 2 * margin]
        });
        
        const gradientColors = background.match(/rgba?\([\d\s,\.]+\)/g);
        if (gradientColors && gradientColors.length >= 2) {
          const startColor = gradientColors[0];
          const endColor = gradientColors[1];
          const width = pdf.internal.pageSize.getWidth();
          const height = pdf.internal.pageSize.getHeight();
          
          for (let i = 0; i <= height; i++) {
            const factor = i / height;
            const r = Math.round(parseInt(startColor.split(",")[0].slice(5)) * (1 - factor) + parseInt(endColor.split(",")[0].slice(5)) * factor);
            const g = Math.round(parseInt(startColor.split(",")[1]) * (1 - factor) + parseInt(endColor.split(",")[1]) * factor);
            const b = Math.round(parseInt(startColor.split(",")[2]) * (1 - factor) + parseInt(endColor.split(",")[2]) * factor);
            pdf.setDrawColor(r, g, b);
            pdf.line(0, i, width, i);
          }
        }
        
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, margin, canvas.width, canvas.height);
        pdf.save("experience-card.pdf");
      } catch (error) {
        console.error("Error exporting PDF:", error);
      }
    }
  };

  const exportAsDOCX = () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: currentExperience?.name || "",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "City, State ZIP • Professional Email Address Phone Number Portfolio/LinkedIn",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "EDUCATION",
            heading: HeadingLevel.HEADING_2,
          }),
          ...currentExperience?.qualificationsAndEducation.map(qual => 
            new Paragraph({ text: qual })
          ),
          new Paragraph({
            text: "RELEVANT EXPERIENCE",
            heading: HeadingLevel.HEADING_2,
          }),
          ...currentExperience?.lifeExperiences.map(exp => 
            new Paragraph({ text: `• ${exp}` })
          ),
          new Paragraph({
            text: "SKILLS",
            heading: HeadingLevel.HEADING_2,
          }),
          ...currentExperience?.skills.map(skill => 
            new Paragraph({ text: `• ${skill}` })
          ),
          new Paragraph({
            text: "STRENGTHS",
            heading: HeadingLevel.HEADING_2,
          }),
          ...currentExperience?.strengths.map(strength => 
            new Paragraph({ text: `• ${strength}` })
          ),
          new Paragraph({
            text: "VALUE PROPOSITION",
            heading: HeadingLevel.HEADING_2,
          }),
          ...currentExperience?.valueProposition.map(value => 
            new Paragraph({ text: `• ${value}` })
          ),
        ],
      }],
    })

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, "experience-card.docx")
    })
  }

  return (
    <div className="h-screen overflow-hidden flex w-full">
      <div className="w-[30%] bg-white p-8 sticky top-0 h-screen overflow-y-auto">
        <Button 
          variant="outline" 
          className="mb-4"
          onClick={handleGoToSTAR}
        >
          &lt; Back to STAR Bullets
        </Button>
        <div className="flex flex-col items-center justify-between space-y-4">
          <h1 className="text-2xl font-bold mb-4">
            Congratulations, {firstName}!
          </h1>
          <p className="text-sm text-start mt-2 m-1">
            This is only the beginning. You are going to go so far.
          </p>
          <div className="space-y-4">
            <Button className="w-full" onClick={exportAsImage}>Export as Image</Button>
            <Button className="w-full" onClick={exportAsDOCX}>Export as DOCX</Button>
            <Button className="w-full" onClick={exportAsPDF}>Export as PDF</Button>
          </div>
          <div className="mt-8">
            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-gray-300"></div>
              <p className="text-sm text-gray-600 px-3">OR CONTINUE TO</p>
              <div className="flex-grow h-px bg-gray-300"></div>
            </div>
            <div className="items-center">
              <h1 className="text-2xl justify-between text-center font-bold">
                STAR Bullets
              </h1>
              <p className="text-sm text-start mt-2 m-1">
                Ready to fine-tune your experiences for a resume or job interview?
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleGoToSTAR}
              >
                Build STAR Bullets
              </Button>
              <Button 
                className="w-full mt-4"
                onClick={handleGoHome}
              >
                Homepage
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[70%] p-8 h-screen overflow-y-auto" style={{ background }}>
        <div className="flex justify-between items-center mb-6">
          <Tabs value={cardView} onValueChange={(value) => setCardView(value as "experience" | "resume")}>
            <TabsList>
              <TabsTrigger value="resume">Resume Bullets</TabsTrigger>
            </TabsList>
          </Tabs>
          <GradientPicker background={background} setBackground={setBackground} />
        </div>
        <div ref={cardRef}>
          {selectedExperiences.length > 0 ? (
            <StarExperienceCard experiences={selectedExperiences} />
          ) : (
            <div className="text-center text-gray-500 py-8">
              No experiences selected. Return to STAR Bullets to select experiences for export.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}