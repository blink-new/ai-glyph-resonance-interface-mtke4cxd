import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Zap, TrendingUp } from 'lucide-react'

interface EmergencePoint {
  timestamp: number
  intensity: number
  description: string
}

interface EmergenceDisplayProps {
  points: EmergencePoint[]
}

export default function EmergenceDisplay({ points }: EmergenceDisplayProps) {
  const sortedPoints = [...points].sort((a, b) => b.intensity - a.intensity)
  const maxIntensity = Math.max(...points.map(p => p.intensity), 0.1)
  
  const getIntensityColor = (intensity: number) => {
    const normalized = intensity / maxIntensity
    if (normalized > 0.8) return 'text-red-400 bg-red-400/10 border-red-400/30'
    if (normalized > 0.6) return 'text-orange-400 bg-orange-400/10 border-orange-400/30'
    if (normalized > 0.4) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
    if (normalized > 0.2) return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
    return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
  }

  const getIntensityLabel = (intensity: number) => {
    const normalized = intensity / maxIntensity
    if (normalized > 0.8) return 'Critical'
    if (normalized > 0.6) return 'High'
    if (normalized > 0.4) return 'Medium'
    if (normalized > 0.2) return 'Low'
    return 'Minimal'
  }

  return (
    <Card className="border-border/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-accent" />
            <span>Emergence Points</span>
          </div>
          <Badge variant="outline" className="text-accent border-accent/30">
            {points.length} detected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {points.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No emergence points detected</p>
            <p className="text-xs opacity-70">Try entering more complex or emotional text</p>
          </div>
        ) : (
          <>
            {/* Intensity distribution */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Intensity Distribution</h4>
              <div className="flex space-x-1 h-2 rounded-full overflow-hidden bg-muted/20">
                {points.map((point, index) => {
                  const width = (point.intensity / maxIntensity) * 100
                  return (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-accent to-primary transition-all duration-300 hover:brightness-110"
                      style={{ width: `${Math.max(width, 2)}%` }}
                      title={`Timestamp ${point.timestamp}: ${(point.intensity * 100).toFixed(1)}%`}
                    />
                  )
                })}
              </div>
            </div>

            {/* Top emergence points */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Top Emergence Events</h4>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {sortedPoints.slice(0, 5).map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getIntensityColor(point.intensity).split(' ')[0].replace('text-', 'bg-')}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          Position {point.timestamp}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getIntensityColor(point.intensity)}`}
                        >
                          {getIntensityLabel(point.intensity)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-foreground leading-relaxed">
                        {point.description}
                      </p>
                      
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="flex-1 bg-muted/20 rounded-full h-1">
                          <div
                            className="bg-gradient-to-r from-accent to-primary h-1 rounded-full transition-all duration-500"
                            style={{ width: `${(point.intensity / maxIntensity) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {(point.intensity * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border/20">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">
                  {(maxIntensity * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Peak</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-accent">
                  {((points.reduce((sum, p) => sum + p.intensity, 0) / points.length) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Average</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {points.filter(p => p.intensity > maxIntensity * 0.7).length}
                </div>
                <div className="text-xs text-muted-foreground">High Impact</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}