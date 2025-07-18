import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Activity } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ResonanceData {
  timestamp: number
  resonance: number
  phase: 'beginning' | 'buildup' | 'climax' | 'release' | 'echo'
  emergenceScore: number
  symbolDensity: number
}

interface ResonanceChartProps {
  data: ResonanceData[]
}

const phaseColors = {
  beginning: 'rgba(139, 92, 246, 0.8)',
  buildup: 'rgba(59, 130, 246, 0.8)',
  climax: 'rgba(239, 68, 68, 0.8)',
  release: 'rgba(34, 197, 94, 0.8)',
  echo: 'rgba(168, 85, 247, 0.8)'
}

export default function ResonanceChart({ data }: ResonanceChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null)

  const chartData = {
    labels: data.map((_, index) => index.toString()),
    datasets: [
      {
        label: 'Resonance',
        data: data.map(d => d.resonance),
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: data.map(d => phaseColors[d.phase]),
        pointBorderColor: 'rgba(139, 92, 246, 1)',
        pointBorderWidth: 2
      },
      {
        label: 'Emergence Score',
        data: data.map(d => d.emergenceScore),
        borderColor: 'rgba(6, 182, 212, 1)',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        fill: false,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderDash: [5, 5]
      },
      {
        label: 'Symbol Density',
        data: data.map(d => d.symbolDensity),
        borderColor: 'rgba(245, 158, 11, 1)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: false,
        tension: 0.2,
        pointRadius: 1,
        pointHoverRadius: 3,
        borderWidth: 1
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(139, 92, 246, 0.5)',
        borderWidth: 1,
        callbacks: {
          afterLabel: function(context: any) {
            const dataIndex = context.dataIndex
            const phase = data[dataIndex]?.phase
            return phase ? `Phase: ${phase}` : ''
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Temporal Sequence',
          color: 'rgba(255, 255, 255, 0.6)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Resonance Intensity',
          color: 'rgba(255, 255, 255, 0.6)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)'
        },
        min: 0,
        max: 1
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const
    }
  }

  return (
    <Card className="border-border/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-primary" />
          <span>Resonance Visualization</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(phaseColors).map(([phase, color]) => (
            <div key={phase} className="flex items-center space-x-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-muted-foreground capitalize">{phase}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}