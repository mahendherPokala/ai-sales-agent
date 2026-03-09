'use client'

import { FiHome, FiSearch, FiFileText, FiMail, FiActivity, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface SidebarProps {
  activeScreen: string
  onNavigate: (screen: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
  companiesCount: number
  emailsSent: number
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FiHome },
  { id: 'research', label: 'Research', icon: FiSearch },
  { id: 'report', label: 'Reports', icon: FiFileText },
  { id: 'outreach', label: 'Outreach', icon: FiMail },
  { id: 'engagement', label: 'Engagement', icon: FiActivity },
]

export default function Sidebar({ activeScreen, onNavigate, collapsed, onToggleCollapse, companiesCount, emailsSent }: SidebarProps) {
  return (
    <div className={`flex flex-col h-full bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className="flex items-center justify-between px-4 py-5">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-[hsl(var(--sidebar-foreground))] tracking-tight">Pronix AI</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-sm">P</span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="h-7 w-7 shrink-0">
          {collapsed ? <FiChevronRight className="h-4 w-4" /> : <FiChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <Separator className="bg-[hsl(var(--sidebar-border))]" />

      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeScreen === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))]' : 'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]'}`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[hsl(var(--sidebar-primary))]' : ''}`} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.id === 'research' && companiesCount > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs h-5 px-1.5">{companiesCount}</Badge>
                )}
                {!collapsed && item.id === 'outreach' && emailsSent > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs h-5 px-1.5">{emailsSent}</Badge>
                )}
              </button>
            )
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-[hsl(var(--sidebar-border))]" />

      <div className="px-3 py-4">
        {!collapsed && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-[hsl(var(--sidebar-foreground))]">Sales Qualification</p>
            <p>AI-Powered Pipeline</p>
          </div>
        )}
      </div>
    </div>
  )
}
