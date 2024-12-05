'use client'

import React, { useState, useRef } from 'react'
import { Check, Copy, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Toaster, toast } from 'sonner'
import html2canvas from 'html2canvas'

type ColorBlindnessType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia'

const ColorAccessibilityTool = () => {
  const [baseColor, setBaseColor] = useState('#3498db')
  const [colors, setColors] = useState<string[]>([])
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const [colorBlindnessType, setColorBlindnessType] = useState<ColorBlindnessType>('normal')
  const paletteRef = useRef<HTMLDivElement>(null)

  const generateAccessiblePalette = (base: string) => {
    const palette = [
      base,
      `#${(parseInt(base.slice(1), 16) + 0x333333).toString(16).padStart(6, '0')}`,
      `#${(parseInt(base.slice(1), 16) - 0x333333).toString(16).padStart(6, '0')}`,
      `#${(parseInt(base.slice(1), 16) ^ 0xFFFFFF).toString(16).padStart(6, '0')}`,
    ]
    setColors(palette)
  }

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color)
    setCopiedColor(color)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  const simulateColorBlindness = (color: string, type: ColorBlindnessType) => {
    const rgb = parseInt(color.slice(1), 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = rgb & 0xff

    let simR, simG, simB

    switch (type) {
      case 'protanopia':
        simR = 0.567 * r + 0.433 * g
        simG = 0.558 * r + 0.442 * g
        simB = 0.242 * r + 0.758 * b
        break
      case 'deuteranopia':
        simR = 0.625 * r + 0.375 * g
        simG = 0.7 * r + 0.3 * g
        simB = 0.3 * r + 0.7 * b
        break
      case 'tritanopia':
        simR = 0.95 * r + 0.05 * g
        simG = 0.433 * r + 0.567 * g
        simB = 0.475 * r + 0.525 * g
        break
      default:
        return color
    }

    return `#${Math.round(simR).toString(16).padStart(2, '0')}${Math.round(simG).toString(16).padStart(2, '0')}${Math.round(simB).toString(16).padStart(2, '0')}`
  }

  const generateCSSVariables = () => {
    let cssVariables = ':root {\n'
    colors.forEach((color, index) => {
      cssVariables += `  --color-${index + 1}: ${color};\n`
    })
    cssVariables += '}'
    return cssVariables
  }

  const copyCSSVariables = () => {
    if (colors.length === 0) {
      toast.error('No colors generated', {
        description: 'Please generate a color palette first',
        duration: 2000,
        position: 'bottom-right'
      })
      return
    }

    const cssVariables = generateCSSVariables()
    navigator.clipboard.writeText(cssVariables)
    
    toast.success('CSS Variables Copied', {
      description: 'Variables copied to clipboard successfully',
      duration: 2000,
      position: 'bottom-right'
    })
  }

  const savePaletteAsPNG = async () => {
    if (paletteRef.current) {
      const canvas = await html2canvas(paletteRef.current, {
        width: 400,
        height: 400,
        backgroundColor: null,
        onclone: (document) => {
          const clonedRef = document.querySelector('[data-testid="palette-grid"]') as HTMLElement
          if (clonedRef) {
            clonedRef.style.width = '400px'
            clonedRef.style.height = '400px'
            const icons = clonedRef.querySelectorAll('.color-icons')
            icons.forEach((icon) => (icon as HTMLElement).style.display = 'none')
          }
        }
      })
      const dataURL = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = dataURL
      link.download = 'color-palette.png'
      link.click()
    }
  }

  return (
    <>
      <Toaster />
      <Card className="w-full max-w-lg mx-auto bg-card">
        <CardContent className="p-4 flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <Input 
              type="color" 
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-12 h-12 p-1 rounded"
            />
            <Input 
              type="text" 
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-28 flex-grow"
            />
            <Button 
              onClick={() => generateAccessiblePalette(baseColor)}
              className="w-auto"
            >
              Generate
            </Button>
          </div>

          <div 
            ref={paletteRef} 
            data-testid="palette-grid"
            className="grid grid-cols-2 gap-0 w-full aspect-square"
          >
            {colors.map((color) => (
              <div 
                key={color} 
                className="relative flex flex-col justify-center items-center group"
                style={{ backgroundColor: simulateColorBlindness(color, colorBlindnessType) }}
              >
                <div className="color-icons absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="secondary"
                          size="icon"
                          className="w-6 h-6"
                          onClick={() => copyToClipboard(color)}
                        >
                          {copiedColor === color ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copiedColor === color ? 'Copied!' : 'Copy HEX'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="secondary"
                          size="icon"
                          className="w-6 h-6"
                          onClick={() => setColorBlindnessType(colorBlindnessType === 'normal' ? 'protanopia' : 'normal')}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Color Blindness Simulation</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className={`font-bold ${parseInt(color.slice(1), 16) > 0xFFFFFF / 2 ? 'text-black' : 'text-white'}`}>
                  {color}
                </span>
              </div>
            ))}
          </div>

          {colors.length > 0 && (
            <div className="flex justify-center space-x-4">
              <Button onClick={copyCSSVariables}>
                Copy CSS Variables
              </Button>
              <Button onClick={savePaletteAsPNG}>
                <Download className="h-4 w-4" />
                Image
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default ColorAccessibilityTool
