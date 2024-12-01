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
import confetti from "canvas-confetti"
import { ArrowLeft, Home } from "lucide-react"

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
        const element = cardRef.current;
        const margin = 40;
        
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          background: ${background};
          width: fit-content;
          position: absolute;
          left: 0;
          top: 0;
          display: inline-block;
        `;
        
        const clone = element.cloneNode(true) as HTMLElement;
        clone.style.cssText = `
          width: auto;
          height: auto;
          display: block;
          max-width: none;
          margin: 0;
          background: transparent;
        `;
        
        // Fix bullet point styling
        const bullets = clone.getElementsByClassName('bullet');
        Array.from(bullets).forEach(bullet => {
          (bullet as HTMLElement).style.cssText = `
            display: block;
            line-height: 1.5;
            margin: 0.5rem 0;
            padding: 0.25rem 0;
          `;
        });
        
        tempContainer.appendChild(clone);
        document.body.appendChild(tempContainer);

        const canvas = await html2canvas(tempContainer, {
          scale: 4,
          useCORS: true,
          backgroundColor: null,
          width: tempContainer.offsetWidth + margin,
          height: tempContainer.offsetHeight + margin
        });

        document.body.removeChild(tempContainer);
        
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.href = image;
        link.download = 'star-bullets.png';
        link.click();
      } catch (error) {
        console.error('Error exporting image:', error);
      }
    }
  };

  const exportAsPDF = async () => {
    if (cardRef.current) {
      try {
        const element = cardRef.current;
        const margin = 0;
        
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
          padding: 1.5rem;
          border-radius: 2px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          background: ${background};
          width: fit-content;
          position: absolute;
          left: 0;
          top: 0;
          display: inline-block;
        `;
        
        const clone = element.cloneNode(true) as HTMLElement;
        clone.style.cssText = `
          width: auto;
          height: auto;
          display: block;
          max-width: none;
          margin: 0;
          background: transparent;
        `;
        
        // Fix bullet point styling
        const bullets = clone.getElementsByClassName('bullet');
        Array.from(bullets).forEach(bullet => {
          (bullet as HTMLElement).style.cssText = `
            display: block;
            line-height: 1.5;
            margin: 0.5rem 0;
            padding: 0.25rem 0;
          `;
        });
        
        tempContainer.appendChild(clone);
        document.body.appendChild(tempContainer);

        const contentWidth = tempContainer.offsetWidth;
        const contentHeight = tempContainer.offsetHeight;

        const canvas = await html2canvas(tempContainer, {
          scale: 4,
          useCORS: true,
          backgroundColor: null,
          width: contentWidth,
          height: contentHeight
        });

        document.body.removeChild(tempContainer);

        const pdf = new jsPDF({
          orientation: contentWidth > contentHeight ? 'landscape' : 'portrait',
          unit: 'px',
          format: [contentWidth + (margin), contentHeight + (margin)]
        });

        pdf.addImage(
          canvas.toDataURL('image/png'), 
          'PNG',
          margin / 2,
          margin / 2,
          contentWidth,
          contentHeight
        );
        
        pdf.save('star-bullets.pdf');
      } catch (error) {
        console.error('Error exporting PDF:', error);
      }
    }
  };

  const exportAsDOCX = () => {
    // Define consistent styles
    const headingStyle = {
      size: 32,
      bold: true,
    };

    const subHeadingStyle = {
      size: 28,
      bold: true,
    };

    const normalStyle = {
      size: 24,
    };

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "STAR EXPERIENCE BULLETS",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            style: headingStyle,
          }),
          
          // Map through selected experiences
          ...selectedExperiences.flatMap(exp => [
            // Company and Position Header
            new Paragraph({
              text: exp.company,
              style: subHeadingStyle,
              spacing: {
                before: 400,
              },
            }),
            new Paragraph({
              text: exp.title,
              style: normalStyle,
              italic: true,
            }),
            new Paragraph({
              text: `${exp.dateRange.startMonth} ${exp.dateRange.startYear} - ${exp.dateRange.endMonth} ${exp.dateRange.endYear}`,
              style: normalStyle,
            }),
            
            // Experience Bullets
            ...exp.bullets.map(bullet => 
              new Paragraph({
                text: `• ${bullet}`,
                style: normalStyle,
                indent: {
                  left: 720, // 0.5 inch indent
                },
                spacing: {
                  before: 200,
                  after: 200,
                },
              })
            ),
            
            // Add spacing between experiences
            new Paragraph({
              text: "",
              spacing: {
                before: 400,
              },
            }),
          ]),
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, "star-bullets.docx");
    });
  };

  const handleConfetti = () => {
    const end = Date.now() + 3 * 1000; // 3 seconds
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

  // Fire confetti on page load
  useEffect(() => {
    handleConfetti();
  }, []);

  return (
    <div className="h-screen overflow-hidden flex w-full">
      <div className="w-[30%] bg-white p-8 sticky top-0 h-screen overflow-y-auto">
        <Button 
          variant="outline" 
          className="mb-4"
          onClick={handleGoToSTAR}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to STAR Bullets
        </Button>
        
        {/* Center container */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <Button
                onClick={handleConfetti}
                className="text-2xl font-bold mb-4 bg-transparent hover:bg-transparent p-0 border-none shadow-none text-black w-full text-center whitespace-normal"
              >
                Congratulations, {firstName}! 🎉
              </Button>
              <p className="text-sm text-center mt-2">
                This is only the beginning. You are going to go so far.
              </p>
            </div>

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

              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">
                  Experience Card
                </h1>
                <p className="text-sm mb-4">
                  Want to learn more about yourself & skills?
                </p>
                <Button 
                  variant="outline" 
                  className="w-full mb-4"
                  onClick={handleGoToExp}
                >
                  Build Experience Card
                </Button>
                <Button 
                  className="w-full"
                  onClick={handleGoHome}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Homepage
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side content remains the same */}
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