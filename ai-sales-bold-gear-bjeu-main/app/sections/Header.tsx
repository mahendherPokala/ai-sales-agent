'use client'

import { FiBell, FiUser } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

interface HeaderProps {
  activeScreen: string
  sampleMode: boolean
  onToggleSample: (val: boolean) => void
  activeAgentId: string | null
}

const screenTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  research: 'Company Research',
  report: 'Qualification Report',
  outreach: 'Outreach Review',
  engagement: 'Engagement Dashboard',
}

const AGENTS = [
  { id: '69ae8a5e02d449101273a2d1', name: 'Sales Intelligence Manager' },
  { id: '69ae8a43bd885a29b1d7d94d', name: 'Company Research' },
  { id: '69ae8a440e02fcb17f72e903', name: 'ICP Qualification' },
  { id: '69ae8a4485d98e0bc2ef2eb5', name: 'Opportunity Analysis' },
  { id: '69ae8a440e02fcb17f72e905', name: 'Decision Maker Discovery' },
  { id: '69ae8a9402d449101273a2d3', name: 'Outreach Email' },
  { id: '69ae8aaa27c3c93e13e20786', name: 'Email Delivery' },
  { id: '69ae8a95fee5a76ed56614b9', name: 'Survey Analysis' },
  { id: '69ae8a9501d1193bde72d0ef', name: 'Follow-up' },
  { id: '69ae8aab27c3c93e13e20788', name: 'Follow-up Delivery' },
]

export default function Header({ activeScreen, sampleMode, onToggleSample, activeAgentId }: HeaderProps) {
  const activeAgent = AGENTS.find(a => a.id === activeAgentId)

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold tracking-tight">{screenTitles[activeScreen] ?? 'Dashboard'}</h1>
        {activeAgent && (
          <Badge variant="outline" className="animate-pulse bg-blue-50 text-blue-700 border-blue-200 text-xs">
            {activeAgent.name} running...
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch id="sample-toggle" checked={sampleMode} onCheckedChange={onToggleSample} />
          <Label htmlFor="sample-toggle" className="text-sm text-muted-foreground cursor-pointer">Sample Data</Label>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <FiBell className="h-4 w-4" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
          <FiUser className="h-4 w-4 text-primary-foreground" />
        </div>
      </div>
    </header>
  )
}
