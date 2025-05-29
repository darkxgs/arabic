"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function BackButton() {
  const router = useRouter()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => router.back()}
          aria-label="العودة للصفحة السابقة"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>العودة للصفحة السابقة</TooltipContent>
    </Tooltip>
  )
} 