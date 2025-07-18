import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Clock } from 'lucide-react'

interface ResonanceData {
  timestamp: number
  resonance: number
  phase: 'beginning' | 'buildup' | 'climax' | 'release' | 'echo'
  emergenceScore: number
  symbolDensity: number
}

interface PhaseTimelineProps {
  data: ResonanceData[]
}

const phaseConfig = {
  beginning: {
    color: 'bg-violet-500',
    label: 'Beginning',
    description: 'Initial thought formation'
  },
  buildup: {
    color: 'bg-blue-500',
    label: 'Buildup',
    description: 'Complexity accumulation'
  },
  climax: {
    color: 'bg-red-500',
    label: 'Climax',
    description: 'Peak resonance'
  },
  release: {
    color: 'bg-green-500',
    label: 'Release',
    description: 'Energy dissipation'
  },
  echo: {
    color: 'bg-purple-500',
    label: 'Echo',
    description: 'Residual patterns'
  }
}

export default function PhaseTimeline({ data }: PhaseTimelineProps) {
  // Group consecutive phases
  const phaseSegments = []
  let currentPhase = data[0]?.phase
  let segmentStart = 0
  
  for (let i = 1; i < data.length; i++) {
    if (data[i].phase !== currentPhase) {
      phaseSegments.push({
        phase: currentPhase,
        start: segmentStart,
        end: i - 1,
        duration: i - segmentStart,
        avgResonance: data.slice(segmentStart, i).reduce((sum, d) => sum + d.resonance, 0) / (i - segmentStart)
      })
      currentPhase = data[i].phase
      segmentStart = i
    }
  }
  
  // Add final segment
  if (data.length > 0) {
    phaseSegments.push({
      phase: currentPhase,
      start: segmentStart,
      end: data.length - 1,
      duration: data.length - segmentStart,
      avgResonance: data.slice(segmentStart).reduce((sum, d) => sum + d.resonance, 0) / (data.length - segmentStart)
    })
  }

  const totalDuration = data.length

  return (
    <Card className="border-border/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-accent" />
          <span>Phase Timeline</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timeline visualization */}
        <div className="relative">
          <div className="flex h-8 rounded-lg overflow-hidden bg-muted/20">
            {phaseSegments.map((segment, index) => {
              const widthPercent = (segment.duration / totalDuration) * 100
              const config = phaseConfig[segment.phase]
              
              return (
                <div
                  key={index}
                  className={`${config.color} relative group cursor-pointer transition-all duration-300 hover:brightness-110`}
                  style={{ width: `${widthPercent}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <div className="bg-black/80 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      <div className="font-medium">{config.label}</div>
                      <div className="text-xs opacity-75">
                        Duration: {segment.duration} | Avg: {(segment.avgResonance * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Timeline markers */}
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>0</span>
            <span>{Math.floor(totalDuration / 2)}</span>
            <span>{totalDuration}</span>
          </div>
        </div>

        {/* Phase breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Phase Breakdown</h4>
          <div className="grid grid-cols-1 gap-2">
            {phaseSegments.map((segment, index) => {
              const config = phaseConfig[segment.phase]
              const percentage = ((segment.duration / totalDuration) * 100).toFixed(1)
              
              return (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${config.color}`} />
                    <div>
                      <div className="text-sm font-medium">{config.label}</div>
                      <div className="text-xs text-muted-foreground">{config.description}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      {percentage}%
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {(segment.avgResonance * 100).toFixed(0)}% avg
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}