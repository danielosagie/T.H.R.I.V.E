/* eslint-disable react-hooks/exhaustive-deps */
// @ts-nocheck
/* eslint-disable */  

import { generateComponents } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"
 
export const { UploadButton, UploadDropzone } = generateComponents<OurFileRouter>() 