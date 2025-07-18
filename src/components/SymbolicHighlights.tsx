import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Sparkles, Eye, Heart, Brain } from 'lucide-react'

interface SymbolicElement {
  text: string
  type: 'archetypal' | 'emotional' | 'cognitive'
  intensity: number
}

interface SymbolicHighlightsProps {
  elements: SymbolicElement[]
}

const typeConfig = {
  archetypal: {
    icon: Eye,
    color: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    label: 'Archetypal',
    description: 'Universal patterns'
  },
  emotional: {
    icon: Heart,
    color: 'text-pink-400 bg-pink-400/10 border-pink-400/30',
    label: 'Emotional',
    description: 'Feeling resonance'
  },
  cognitive: {
    icon: Brain,
    color: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    label: 'Cognitive',
    description: 'Thought patterns'
  }
}

export default function SymbolicHighlights({ elements }: SymbolicHighlightsProps) {
  const sortedElements = [...elements].sort((a, b) => b.intensity - a.intensity)
  const maxIntensity = Math.max(...elements.map(e => e.intensity), 0.1)
  
  const getIntensitySize = (intensity: number) => {
    const normalized = intensity / maxIntensity
    if (normalized > 0.8) return 'text-lg'
    if (normalized > 0.6) return 'text-base'
    if (normalized > 0.4) return 'text-sm'
    return 'text-xs'
  }

  const groupedElements = elements.reduce((acc, element) => {
    if (!acc[element.type]) acc[element.type] = []
    acc[element.type].push(element)
    return acc
  }, {} as Record<string, SymbolicElement[]>)

  return (
    <Card className="border-border/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>Symbolic Elements</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {elements.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Sparkles className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No symbolic elements detected</p>
          </div>
        ) : (
          <>
            {/* Symbolic cloud */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Resonance Cloud</h4>
              <div className="flex flex-wrap gap-2 p-4 rounded-lg bg-muted/5 border border-border/10">
                {sortedElements.map((element, index) => {
                  const config = typeConfig[element.type]
                  const Icon = config.icon
                  
                  return (
                    <div
                      key={index}
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full border transition-all duration-300 hover:scale-105 cursor-pointer ${config.color} ${getIntensitySize(element.intensity)}`}
                      title={`${config.label}: ${(element.intensity * 100).toFixed(1)}% intensity`}
                    >
                      <Icon className="h-3 w-3" />
                      <span className="font-medium">{element.text}</span>
                      <div className="w-1 h-1 rounded-full bg-current opacity-60" />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Type breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Type Analysis</h4>
              {Object.entries(groupedElements).map(([type, typeElements]) => {
                const config = typeConfig[type as keyof typeof typeConfig]
                const Icon = config.icon
                const avgIntensity = typeElements.reduce((sum, e) => sum + e.intensity, 0) / typeElements.length
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${config.color.split(' ')[0]}`} />
                        <span className="text-sm font-medium">{config.label}</span>
                        <span className="text-xs text-muted-foreground">({typeElements.length})</span>
                      </div>
                      <Badge variant="outline" className={`text-xs ${config.color}`}>
                        {(avgIntensity * 100).toFixed(0)}% avg
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {typeElements.slice(0, 4).map((element, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 rounded bg-muted/20 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {element.text}
                        </span>
                      ))}
                      {typeElements.length > 4 && (
                        <span className="text-xs px-2 py-1 text-muted-foreground">
                          +{typeElements.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Intensity distribution */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Intensity Spectrum</h4>
              <div className="space-y-1">
                {sortedElements.slice(0, 6).map((element, index) => {
                  const config = typeConfig[element.type]
                  const widthPercent = (element.intensity / maxIntensity) * 100
                  
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-16 text-xs text-muted-foreground truncate">
                        {element.text}
                      </div>
                      <div className="flex-1 bg-muted/20 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${config.color.split(' ')[0].replace('text-', 'bg-')}`}
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground w-8 text-right">
                        {(element.intensity * 100).toFixed(0)}%
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}