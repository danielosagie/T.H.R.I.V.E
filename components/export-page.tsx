"use client"

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExperienceCard } from "@/components/experience-card"
import { PersonaData } from "@/types/types"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import { useRouter } from "next/navigation"
import { getExperienceData } from "@/lib/data"
import styled from "styled-components"
import { 
  Document, 
  Paragraph, 
  HeadingLevel, 
  AlignmentType,
  TextRun,
  Packer,
} from "docx";
import { saveAs } from "file-saver";
import type { ConfettiRef } from "@/components/ui/confetti"
import { Confetti, ConfettiButton } from "@/components/ui/confetti"
import confetti from "canvas-confetti"
import { ArrowLeft, Home } from "lucide-react"

const GradientPicker = dynamic(
  () => import('@/components/app-picker-gradient-picker').then(mod => mod.GradientPicker),
  { ssr: false }
)

interface ExportPageComponentProps {
  experienceData?: PersonaData
}

const ExportContainer = styled.div`
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  
  @media print {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
`

const sharedTagStyles = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1.3;
  margin: 0.15rem 0.15rem 0.15rem 0.15rem;
  padding: 0.25rem 0.75rem 1.05rem 0.75rem;
  height: auto;
  min-height: 1.8rem;
  font-size: 14px;
  max-width: calc(100% - 1rem);
  word-wrap: break-word;
  white-space: normal;
  overflow-wrap: break-word;
  vertical-align: top;
`;

export function ExportPageComponent({ experienceData }: ExportPageComponentProps) {
  const router = useRouter()
  const [background, setBackground] = useState<string>("linear-gradient(to top left,#accbee,#e7f0fd)")
  const [cardView, setCardView] = useState<"experience" | "resume">("experience")
  const cardRef = useRef<HTMLDivElement>(null)
  const [currentExperience, setCurrentExperience] = useState<PersonaData | null>(null)
  const [firstName, setFirstName] = useState<string>("")
  const confettiRef = useRef<ConfettiRef>(null)

  useEffect(() => {
    // Initialize anything that needs window/document here
    const loadExperience = async () => {
      const data = await getExperienceData()
      if (data) {
        setCurrentExperience(data)
        const firstNameMatch = data.name?.split(' ')[0] || "User"
        setFirstName(firstNameMatch)
      }
    }
    
    loadExperience()
  }, [])

  useEffect(() => {
    confettiRef.current?.fire({})
  }, [])

  // Navigation handlers
  const handleBackToView = () => {
    router.push("/view")
  }

  const handleGoHome = () => {
    router.push("/")
  }

  const handleGoToStar = () => {
    router.push("/starinput")
  }

  const exportAsImage = async () => {
    if (cardRef.current) {
      try {
        const element = cardRef.current;
        const margin = 0;
        
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          background: ${background};
          width: 1700px;
          position: absolute;
          left: 0;
          top: 0;
          display: block;
          word-wrap: break-word;
          white-space: normal;
        `;
        
        const clone = element.cloneNode(true) as HTMLElement;
        clone.style.cssText = `
          width: 100%;
          height: auto;
          display: block;
          margin: 0;
          background: transparent;
          word-wrap: break-word;
          white-space: normal;
          max-width: none;
        `;
        
        const tags = clone.getElementsByClassName('tag');
        Array.from(tags).forEach(tag => {
          (tag as HTMLElement).style.cssText = sharedTagStyles;
        });
        
        tempContainer.appendChild(clone);
        document.body.appendChild(tempContainer);

        const canvas = await html2canvas(tempContainer, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          width: tempContainer.offsetWidth,
          height: tempContainer.offsetHeight,
          windowWidth: 1024,
        });

        document.body.removeChild(tempContainer);
        
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.href = image;
        link.download = 'experience-card.png';
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
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          background: ${background};
          width: 1700px;
          position: absolute;
          left: 0;
          top: 0;
          display: block;
          word-wrap: break-word;
          white-space: normal;
        `;
        
        const clone = element.cloneNode(true) as HTMLElement;
        clone.style.cssText = `
          width: 100%;
          height: auto;
          display: block;
          margin: 0;
          background: transparent;
          word-wrap: break-word;
          white-space: normal;
          max-width: none;
        `;
        
        const tags = clone.getElementsByClassName('tag');
        Array.from(tags).forEach(tag => {
          (tag as HTMLElement).style.cssText = sharedTagStyles;
        });
        
        tempContainer.appendChild(clone);
        document.body.appendChild(tempContainer);

        const contentWidth = tempContainer.offsetWidth;
        const contentHeight = tempContainer.offsetHeight;

        const canvas = await html2canvas(tempContainer, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          width: contentWidth,
          height: contentHeight,
          windowWidth: 1024,
        });

        document.body.removeChild(tempContainer);

        const imgWidth = 792;
        const imgHeight = (contentHeight * imgWidth) / contentWidth;

        const pdf = new jsPDF({
          orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
          unit: 'pt',
          format: [imgWidth + margin * 2, imgHeight + margin * 2]
        });

        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          margin,
          margin,
          imgWidth,
          imgHeight
        );
        
        pdf.save('experience-card.pdf');
      } catch (error) {
        console.error('Error exporting PDF:', error);
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
          
          // Contact Info
          new Paragraph({
            text: "City, State ZIP • Professional Email Address • Phone Number",
            alignment: AlignmentType.CENTER,
          }),
          
          // Education Section
          new Paragraph({
            text: "EDUCATION",
            heading: HeadingLevel.HEADING_2,
          }),
          ...(currentExperience?.qualificationsAndEducation || []).map(qual => 
            new Paragraph({ text: qual })
          ),

          // Experience Section
          new Paragraph({
            text: "RELEVANT EXPERIENCE",
            heading: HeadingLevel.HEADING_2,
          }),
          ...(currentExperience?.lifeExperiences || []).map(exp => 
            new Paragraph({ 
              text: `• ${exp}`,
              indent: { left: 720 },
            })
          ),

          // Skills Section
          new Paragraph({
            text: "SKILLS",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: currentExperience?.skills.map((skill, index, array) => [
              new TextRun({ text: skill }),
              ...(index < array.length - 1 ? [new TextRun({ text: " • " })] : []),
            ]).flat(),
          }),

          // Strengths Section
          new Paragraph({
            text: "STRENGTHS",
            heading: HeadingLevel.HEADING_2,
          }),
          ...(currentExperience?.strengths || []).map(strength => 
            new Paragraph({ 
              text: `• ${strength}`,
              indent: { left: 720 },
            })
          ),

          // Value Proposition Section
          new Paragraph({
            text: "VALUE PROPOSITION",
            heading: HeadingLevel.HEADING_2,
          }),
          ...(currentExperience?.valueProposition || []).map(value => 
            new Paragraph({ 
              text: `• ${value}`,
              indent: { left: 720 },
            })
          ),
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `${currentExperience?.name?.toLowerCase().replace(/\s+/g, '-') || 'experience'}-card.docx`);
    });
  };

  const handleConfetti = () => {
    const end = Date.now() + 1 * 1000; // 1 second
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
          onClick={handleBackToView}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Edit/View
        </Button>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <Button
                onClick={handleConfetti}  // Also fire on click
                className="text-xl font-bold bg-transparent hover:bg-transparent p-0 border-none shadow-none text-black w-full text-center whitespace-normal"
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
                  STAR Bullets
                </h1>
                <p className="text-sm mb-4">
                  Ready to fine-tune your experiences for a resume or job interview?
                </p>
                <Button 
                  variant="outline" 
                  className="w-full mb-4"
                  onClick={handleGoToStar}
                >
                  Build STAR Bullets
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
      <div className="w-[70%] p-8 h-screen overflow-y-auto" style={{ background }}>
        <div className="flex justify-between items-center mb-6">
          <Tabs value={cardView} onValueChange={(value) => setCardView(value as "experience" | "resume")}>
            <TabsList>
              <TabsTrigger value="experience">Experience Card</TabsTrigger>
              <TabsTrigger value="resume">Resume Bullets</TabsTrigger>
            </TabsList>
          </Tabs>
          <GradientPicker background={background} setBackground={setBackground} />
        </div>
        <div ref={cardRef} className="max-w-4xl mx-auto" style={{ background }}>
          <div className="w-full">
            <ExperienceCard
              initialData={currentExperience}
              persona={currentExperience}
              format={cardView === "experience" ? "card" : "bullet"}
              mode="view"
              onEdit={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  )
}