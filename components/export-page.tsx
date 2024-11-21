"'use client'"

import React, { useState, useRef } from "'react'"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExperienceCard } from "'@/components/ExperienceCard'"
import { PersonaData } from "'@/types/types'"
import { GradientPicker } from "'@/app/picker/GradientPicker'"
import html2canvas from "'html2canvas'"
import { jsPDF } from "'jspdf'"
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType } from "'docx'"
import { saveAs } from "'file-saver'"

export function ExportPageComponent() {
  const [background, setBackground] = useState<string>("'linear-gradient(to top left,#accbee,#e7f0fd)'");
  const [cardView, setCardView] = useState<"'experience'" | "'resume'">("'experience'")
  const cardRef = useRef<HTMLDivElement>(null)

  const mockPersona: PersonaData = {
    id: "'1'",
    name: "'Alice Vuong'",
    summary: "'Driven and adaptable military spouse with a proven record in leading household project management, team dynamics, process optimization.'",
    goals: ["'Become a lead project manager'", "'Remote or flexible opportunities'"],
    qualificationsAndEducation: ["'2+ years project management'", "'Project management certification'", "'High school diploma'"],
    skills: ["'Financial and resource management'", "'Adept at optimizing time and tasks'", "'Logistical planning'"],
    strengths: ["'Excellence'", "'Adaptability'", "'Resilience'", "'Innovation'", "'Accountability'", "'Teamwork'"],
    valueProposition: ["'Leverages deep military connections'", "'Committed to long-term employment'", "'Diverse perspectives and expertise'"],
    lifeExperiences: ["'Thrives in dynamic military settings'", "'Manages complex household operations'", "'Adapts to unpredictable challenges'"],
    nextSteps: []
  }

  const exportAsImage = async () => {
    if (cardRef.current) {
      try {
        const margin = 40; // 40px margin
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null,
          scale: 2, // Increase quality
        });
        const newCanvas = document.createElement("'canvas'");
        const ctx = newCanvas.getContext("'2d'");
        if (ctx) {
          newCanvas.width = canvas.width + 2 * margin;
          newCanvas.height = canvas.height + 2 * margin;
          
          // Draw gradient background
          const gradientColors = background.match(/rgba?$$[\d\s,\.]+$$/g);
          if (gradientColors && gradientColors.length >= 2) {
            const gradient = ctx.createLinearGradient(0, 0, newCanvas.width, newCanvas.height);
            gradient.addColorStop(0, gradientColors[0]);
            gradient.addColorStop(1, gradientColors[1]);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
          }
          
          // Draw original canvas content
          ctx.drawImage(canvas, margin, margin);
        }
        const image = newCanvas.toDataURL("'image/png'");
        const link = document.createElement("'a'");
        link.href = image;
        link.download = "'experience-card.png'";
        link.click();
      } catch (error) {
        console.error("'Error exporting image:'", error);
      }
    }
  };

  const exportAsPDF = async () => {
    if (cardRef.current) {
      try {
        const margin = 40; // 40px margin
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null,
          scale: 2, // Increase quality
        });
        const pdf = new jsPDF({
          orientation: "'landscape'",
          unit: "'px'",
          format: [canvas.width + 2 * margin, canvas.height + 2 * margin]
        });
        
        // Add gradient background
        const gradientColors = background.match(/rgba?$$[\d\s,\.]+$$/g);
        if (gradientColors && gradientColors.length >= 2) {
          const startColor = gradientColors[0];
          const endColor = gradientColors[1];
          const width = pdf.internal.pageSize.getWidth();
          const height = pdf.internal.pageSize.getHeight();
          
          for (let i = 0; i <= height; i++) {
            const factor = i / height;
            const r = Math.round(parseInt(startColor.split("','")[0].slice(5)) * (1 - factor) + parseInt(endColor.split("','")[0].slice(5)) * factor);
            const g = Math.round(parseInt(startColor.split("','")[1]) * (1 - factor) + parseInt(endColor.split("','")[1]) * factor);
            const b = Math.round(parseInt(startColor.split("','")[2]) * (1 - factor) + parseInt(endColor.split("','")[2]) * factor);
            pdf.setDrawColor(r, g, b);
            pdf.line(0, i, width, i);
          }
        }
        
        pdf.addImage(canvas.toDataURL("'image/png'"), "'PNG'", margin, margin, canvas.width, canvas.height);
        pdf.save("'experience-card.pdf'");
      } catch (error) {
        console.error("'Error exporting PDF:'", error);
      }
    }
  };

  const exportAsDOCX = () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: mockPersona.name,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "'City, State ZIP • Professional Email Address Phone Number Portfolio/LinkedIn'",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "'EDUCATION'",
            heading: HeadingLevel.HEADING_2,
          }),
          ...mockPersona.qualificationsAndEducation.map(qual => 
            new Paragraph({ text: qual })
          ),
          new Paragraph({
            text: "'RELEVANT EXPERIENCE'",
            heading: HeadingLevel.HEADING_2,
          }),
          ...mockPersona.lifeExperiences.map(exp => 
            new Paragraph({ text: `• ${exp}` })
          ),
          new Paragraph({
            text: "'SKILLS'",
            heading: HeadingLevel.HEADING_2,
          }),
          ...mockPersona.skills.map(skill => 
            new Paragraph({ text: `• ${skill}` })
          ),
          new Paragraph({
            text: "'STRENGTHS'",
            heading: HeadingLevel.HEADING_2,
          }),
          ...mockPersona.strengths.map(strength => 
            new Paragraph({ text: `• ${strength}` })
          ),
          new Paragraph({
            text: "'VALUE PROPOSITION'",
            heading: HeadingLevel.HEADING_2,
          }),
          ...mockPersona.valueProposition.map(value => 
            new Paragraph({ text: `• ${value}` })
          ),
        ],
      }],
    })

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, "'experience-card.docx'")
    })
  }

  return (
    <div className="h-screen overflow-hidden flex w-full">
      <div className="w-[30%] bg-white p-8 sticky top-0 h-screen overflow-y-auto">
        <Button variant="outline" className="mb-4">
          &lt; Back to Edit/View
        </Button>
        <div className="flex flex-col items-center justify-between space-y-4">
          <h1 className="text-2xl font-bold mb-4">Congratulations, Alice!</h1>
          <p className="text-sm text-start mt-2 m-1">This is only the beginning. You are going to go so far.</p>
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
              <h1 className="text-2xl justify-between text-center font-bold">STAR Bullets</h1>
              <p className="text-sm text-start mt-2 m-1">Ready to fine-tune your experiences for a resume or job interview? </p>
              <Button variant="outline" className="w-full">Build STAR Bullets</Button>
              <Button className="w-full mt-4">Homepage</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[70%] p-8 h-screen overflow-y-auto" style={{ background: background }}>
        <div className="flex justify-between items-center mb-6">
          <Tabs value={cardView} onValueChange={(value) => setCardView(value as "'experience'" | "'resume'")}>
            <TabsList>
              <TabsTrigger value="experience">Experience Card</TabsTrigger>
              <TabsTrigger value="resume">Resume Bullets</TabsTrigger>
            </TabsList>
          </Tabs>
          <GradientPicker background={background} setBackground={setBackground} />
        </div>
        <div ref={cardRef}>
          <ExperienceCard
            initialData={mockPersona}
            persona={mockPersona}
            format={cardView === "'experience'" ? "'card'" : "'bullet'"}
            mode="view"
            onEdit={() => {}}
          />
        </div>
      </div>
    </div>
  )
}