'use client'

import { FiTarget, FiUsers, FiMail, FiClipboard, FiCalendar, FiTrendingUp, FiTrendingDown, FiArrowRight, FiSearch, FiActivity } from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface CompanyData {
  id: string
  companyName: string
  website: string
  industry: string
  status: string
  report: any
  createdAt: string
}

interface EngagementRow {
  id: string
  company: string
  recipientEmail: string
  recipientName: string
  emailSentDate: string
  emailOpened: string
  surveyCompleted: string
  surveyScore: number | null
  followUpSent: string
  meetingScheduled: string
  surveyData: any
  followUpData: any
}

interface DashboardProps {
  companies: CompanyData[]
  engagementData: EngagementRow[]
  sampleMode: boolean
  onNavigate: (screen: string) => void
}

const SAMPLE_STATS = {
  companiesAnalyzed: 24,
  qualifiedLeads: 18,
  emailsSent: 42,
  surveyResponses: 15,
  meetingsScheduled: 7,
}

const SAMPLE_ACTIVITIES = [
  { id: '1', action: 'Research completed', company: 'TechCorp Inc.', time: '2 hours ago', type: 'research' },
  { id: '2', action: 'Email sent to', company: 'Global Finance Ltd.', time: '3 hours ago', type: 'email' },
  { id: '3', action: 'Survey response from', company: 'DataFlow Systems', time: '5 hours ago', type: 'survey' },
  { id: '4', action: 'Meeting scheduled with', company: 'AI Innovations', time: '1 day ago', type: 'meeting' },
  { id: '5', action: 'Follow-up sent to', company: 'CloudBase Corp', time: '1 day ago', type: 'followup' },
]

const SAMPLE_QUALIFICATION = [
  { label: 'Strong Fit (85-100)', value: 35, color: 'bg-emerald-500' },
  { label: 'Good Fit (70-84)', value: 30, color: 'bg-blue-500' },
  { label: 'Moderate (50-69)', value: 20, color: 'bg-amber-500' },
  { label: 'Weak Fit (<50)', value: 15, color: 'bg-red-500' },
]

const SAMPLE_INDUSTRIES = [
  { name: 'Technology', count: 8 },
  { name: 'Finance', count: 5 },
  { name: 'Healthcare', count: 4 },
  { name: 'Manufacturing', count: 3 },
  { name: 'Retail', count: 2 },
  { name: 'Other', count: 2 },
]

export default function DashboardSection({ companies, engagementData, sampleMode, onNavigate }: DashboardProps) {
  const liveStats = {
    companiesAnalyzed: companies.length,
    qualifiedLeads: companies.filter(c => c.status === 'completed').length,
    emailsSent: engagementData.length,
    surveyResponses: engagementData.filter(e => e.surveyCompleted === 'Completed').length,
    meetingsScheduled: engagementData.filter(e => e.meetingScheduled === 'Scheduled').length,
  }

  const stats = sampleMode ? SAMPLE_STATS : liveStats

  const statCards = [
    { label: 'Companies Analyzed', value: stats.companiesAnalyzed, icon: FiTarget, trend: sampleMode ? '+12%' : null, trendUp: true, color: 'text-blue-600' },
    { label: 'Qualified Leads', value: stats.qualifiedLeads, icon: FiUsers, trend: sampleMode ? '+8%' : null, trendUp: true, color: 'text-emerald-600' },
    { label: 'Emails Sent', value: stats.emailsSent, icon: FiMail, trend: sampleMode ? '+24%' : null, trendUp: true, color: 'text-purple-600' },
    { label: 'Survey Responses', value: stats.surveyResponses, icon: FiClipboard, trend: sampleMode ? '-3%' : null, trendUp: false, color: 'text-amber-600' },
    { label: 'Meetings Scheduled', value: stats.meetingsScheduled, icon: FiCalendar, trend: sampleMode ? '+15%' : null, trendUp: true, color: 'text-rose-600' },
  ]

  const activities = sampleMode ? SAMPLE_ACTIVITIES : []
  const qualDist = sampleMode ? SAMPLE_QUALIFICATION : []
  const industries = sampleMode ? SAMPLE_INDUSTRIES : []
  const maxIndustryCount = Math.max(...industries.map(i => i.count), 1)

  const funnelSteps = [
    { label: 'Researched', value: sampleMode ? 24 : companies.length, width: '100%' },
    { label: 'Qualified', value: sampleMode ? 18 : liveStats.qualifiedLeads, width: sampleMode ? '75%' : `${companies.length > 0 ? (liveStats.qualifiedLeads / companies.length * 100) : 0}%` },
    { label: 'Emails Sent', value: sampleMode ? 42 : liveStats.emailsSent, width: sampleMode ? '58%' : `${companies.length > 0 ? Math.min((liveStats.emailsSent / companies.length * 100), 100) : 0}%` },
    { label: 'Survey Done', value: sampleMode ? 15 : liveStats.surveyResponses, width: sampleMode ? '35%' : `${companies.length > 0 ? (liveStats.surveyResponses / companies.length * 100) : 0}%` },
    { label: 'Meetings', value: sampleMode ? 7 : liveStats.meetingsScheduled, width: sampleMode ? '18%' : `${companies.length > 0 ? (liveStats.meetingsScheduled / companies.length * 100) : 0}%` },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="bg-card/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {stat.trend && (
                    <div className={`flex items-center gap-0.5 text-xs font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                      {stat.trendUp ? <FiTrendingUp className="h-3 w-3" /> : <FiTrendingDown className="h-3 w-3" />}
                      {stat.trend}
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Lead Qualification Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {qualDist.length > 0 ? (
              <div className="space-y-3">
                {qualDist.map((q) => (
                  <div key={q.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{q.label}</span>
                      <span className="font-medium">{q.value}%</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${q.color} transition-all duration-500`} style={{ width: `${q.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <FiTarget className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No qualification data yet</p>
                <p className="text-xs">Research companies to see distribution</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Industry Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {industries.length > 0 ? (
              <div className="space-y-2.5">
                {industries.map((ind) => (
                  <div key={ind.name} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-24 shrink-0">{ind.name}</span>
                    <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                      <div className="h-full bg-primary/70 rounded transition-all duration-500" style={{ width: `${(ind.count / maxIndustryCount) * 100}%` }} />
                    </div>
                    <span className="text-xs font-medium w-6 text-right">{ind.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <FiUsers className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No industry data yet</p>
                <p className="text-xs">Research companies to see breakdown</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/80 backdrop-blur-md border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Engagement Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnelSteps.map((step, idx) => (
                <div key={step.label} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{step.label}</span>
                  <div className="flex-1 relative">
                    <div className="h-8 bg-muted rounded-lg overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary/80 to-primary/50 rounded-lg transition-all duration-700 flex items-center px-3" style={{ width: step.width }}>
                        <span className="text-xs font-semibold text-primary-foreground">{step.value}</span>
                      </div>
                    </div>
                  </div>
                  {idx < funnelSteps.length - 1 && (
                    <FiArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onNavigate('engagement')}>View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[220px]">
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((act) => (
                    <div key={act.id} className="flex items-start gap-2.5 text-sm">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${act.type === 'research' ? 'bg-blue-500' : act.type === 'email' ? 'bg-purple-500' : act.type === 'survey' ? 'bg-amber-500' : act.type === 'meeting' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <div className="min-w-0">
                        <p className="text-xs leading-relaxed"><span className="font-medium">{act.action}</span>{' '}<span className="text-muted-foreground">{act.company}</span></p>
                        <p className="text-xs text-muted-foreground">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <FiActivity className="h-6 w-6 mb-2 opacity-40" />
                  <p className="text-xs">No recent activity</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {!sampleMode && companies.length === 0 && (
        <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-sm">
          <CardContent className="py-10 text-center">
            <FiSearch className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-semibold mb-1">Get Started</h3>
            <p className="text-sm text-muted-foreground mb-4">Research your first company to populate your sales pipeline</p>
            <Button onClick={() => onNavigate('research')}>Start Research</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// end of file
