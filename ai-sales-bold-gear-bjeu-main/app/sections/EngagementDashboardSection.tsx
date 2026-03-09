'use client'

import { useState } from 'react'
import { FiChevronDown, FiChevronUp, FiSend, FiSearch, FiFileText, FiCalendar, FiBarChart2 } from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

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

interface EngagementDashboardProps {
  engagementData: EngagementRow[]
  sampleMode: boolean
  onAnalyzeSurvey: (rowId: string, surveyText: string) => void
  onGenerateFollowUp: (rowId: string) => void
  onSendFollowUp: (rowId: string) => void
  activeAction: { rowId: string; action: string } | null
  error: string | null
}

const SAMPLE_ENGAGEMENT: EngagementRow[] = [
  { id: 'se1', company: 'TechCorp Inc.', recipientEmail: 'j.smith@techcorp.com', recipientName: 'John Smith', emailSentDate: '2025-03-07', emailOpened: 'Opened', surveyCompleted: 'Completed', surveyScore: 85, followUpSent: 'Sent', meetingScheduled: 'Scheduled', surveyData: { ai_readiness_score: 85, readiness_category: 'Ready', project_urgency: 'High', key_insights: ['Strong data infrastructure', 'Leadership buy-in'], recommended_next_steps: ['Schedule technical discovery', 'Prepare ROI analysis'] }, followUpData: { subject: 'Follow-up: AI Transformation Discussion', body: 'Dear John, thank you for completing our survey...', follow_up_strategy: 'Technical deep-dive focus' } },
  { id: 'se2', company: 'Global Finance Ltd.', recipientEmail: 'a.johnson@globalfin.com', recipientName: 'Alice Johnson', emailSentDate: '2025-03-06', emailOpened: 'Opened', surveyCompleted: 'Completed', surveyScore: 72, followUpSent: 'Pending', meetingScheduled: 'Pending', surveyData: { ai_readiness_score: 72, readiness_category: 'Emerging', project_urgency: 'Medium', key_insights: ['Regulatory concerns', 'Limited ML experience'], recommended_next_steps: ['Share compliance case studies', 'Offer pilot program'] }, followUpData: null },
  { id: 'se3', company: 'DataFlow Systems', recipientEmail: 'm.chen@dataflow.io', recipientName: 'Michael Chen', emailSentDate: '2025-03-05', emailOpened: 'Opened', surveyCompleted: 'Pending', surveyScore: null, followUpSent: 'Pending', meetingScheduled: 'Pending', surveyData: null, followUpData: null },
  { id: 'se4', company: 'MediTech Solutions', recipientEmail: 'r.patel@meditech.com', recipientName: 'Rachel Patel', emailSentDate: '2025-03-04', emailOpened: 'Pending', surveyCompleted: 'Pending', surveyScore: null, followUpSent: 'Pending', meetingScheduled: 'Pending', surveyData: null, followUpData: null },
]

function getStatusBadge(status: string) {
  switch (status) {
    case 'Opened': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Opened</Badge>
    case 'Completed': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Completed</Badge>
    case 'Sent': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Sent</Badge>
    case 'Scheduled': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">Scheduled</Badge>
    case 'Pending': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Pending</Badge>
    case 'Failed': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">Failed</Badge>
    default: return <Badge variant="outline" className="text-xs">{status}</Badge>
  }
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{line.slice(2)}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{line}</p>
      })}
    </div>
  )
}

export default function EngagementDashboardSection({ engagementData, sampleMode, onAnalyzeSurvey, onGenerateFollowUp, onSendFollowUp, activeAction, error }: EngagementDashboardProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [surveyInput, setSurveyInput] = useState<Record<string, string>>({})
  const [showSurveyModal, setShowSurveyModal] = useState<string | null>(null)
  const [showFollowUpConfirm, setShowFollowUpConfirm] = useState<string | null>(null)

  const displayData = sampleMode ? SAMPLE_ENGAGEMENT : engagementData

  const filteredData = displayData.filter(row => {
    if (filterStatus !== 'all') {
      if (filterStatus === 'opened' && row.emailOpened !== 'Opened') return false
      if (filterStatus === 'surveyed' && row.surveyCompleted !== 'Completed') return false
      if (filterStatus === 'followup' && row.followUpSent !== 'Sent') return false
      if (filterStatus === 'meeting' && row.meetingScheduled !== 'Scheduled') return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return row.company.toLowerCase().includes(q) || row.recipientName.toLowerCase().includes(q) || row.recipientEmail.toLowerCase().includes(q)
    }
    return true
  })

  const isActionLoading = (rowId: string, action: string) => activeAction?.rowId === rowId && activeAction?.action === action

  return (
    <div className="p-6 space-y-4">
      <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FiBarChart2 className="h-5 w-5 text-primary" />
              Engagement Tracking
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search company or contact..." className="pl-8 h-8 w-56 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 w-36 text-sm"><SelectValue placeholder="Filter" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="opened">Opened</SelectItem>
                  <SelectItem value="surveyed">Surveyed</SelectItem>
                  <SelectItem value="followup">Follow-up Sent</SelectItem>
                  <SelectItem value="meeting">Meeting Set</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredData.length > 0 ? (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email Sent</TableHead>
                    <TableHead>Opened</TableHead>
                    <TableHead>Survey</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Follow-up</TableHead>
                    <TableHead>Meeting</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row) => {
                    const isExpanded = expandedRow === row.id
                    return (
                      <TableRow key={row.id} className="group">
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpandedRow(isExpanded ? null : row.id)}>
                            {isExpanded ? <FiChevronUp className="h-3.5 w-3.5" /> : <FiChevronDown className="h-3.5 w-3.5" />}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{row.company}</TableCell>
                        <TableCell><div className="text-sm">{row.recipientName}</div><div className="text-xs text-muted-foreground">{row.recipientEmail}</div></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{row.emailSentDate}</TableCell>
                        <TableCell>{getStatusBadge(row.emailOpened)}</TableCell>
                        <TableCell>{getStatusBadge(row.surveyCompleted)}</TableCell>
                        <TableCell>{row.surveyScore != null ? <Badge variant="outline" className={`text-xs ${row.surveyScore >= 75 ? 'bg-emerald-50 text-emerald-700' : row.surveyScore >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{row.surveyScore}</Badge> : <span className="text-xs text-muted-foreground">-</span>}</TableCell>
                        <TableCell>{getStatusBadge(row.followUpSent)}</TableCell>
                        <TableCell>{getStatusBadge(row.meetingScheduled)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {row.surveyCompleted !== 'Completed' && (
                              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setShowSurveyModal(row.id)} disabled={isActionLoading(row.id, 'survey')}>
                                {isActionLoading(row.id, 'survey') ? <Loader2 className="h-3 w-3 animate-spin" /> : <FiFileText className="h-3 w-3" />}
                              </Button>
                            )}
                            {row.surveyCompleted === 'Completed' && row.followUpSent !== 'Sent' && (
                              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onGenerateFollowUp(row.id)} disabled={isActionLoading(row.id, 'followup')}>
                                {isActionLoading(row.id, 'followup') ? <Loader2 className="h-3 w-3 animate-spin" /> : <FiCalendar className="h-3 w-3" />}
                              </Button>
                            )}
                            {row.followUpData && row.followUpSent !== 'Sent' && (
                              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setShowFollowUpConfirm(row.id)} disabled={isActionLoading(row.id, 'sendFollowup')}>
                                {isActionLoading(row.id, 'sendFollowup') ? <Loader2 className="h-3 w-3 animate-spin" /> : <FiSend className="h-3 w-3" />}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {filteredData.map((row) => {
                if (expandedRow !== row.id) return null
                const survey = row.surveyData
                const followUp = row.followUpData
                const insights = Array.isArray(survey?.key_insights) ? survey.key_insights : []
                const nextSteps = Array.isArray(survey?.recommended_next_steps) ? survey.recommended_next_steps : []
                const talkingPoints = Array.isArray(followUp?.key_talking_points) ? followUp.key_talking_points : []

                return (
                  <div key={`detail-${row.id}`} className="border-t border-border p-4 bg-muted/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {survey && (
                        <Card className="bg-card/80 border-border/50">
                          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Survey Analysis</CardTitle></CardHeader>
                          <CardContent className="space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div><span className="text-muted-foreground">Readiness:</span>{' '}<span className="font-medium">{survey.readiness_category ?? '-'}</span></div>
                              <div><span className="text-muted-foreground">Score:</span>{' '}<span className="font-medium">{survey.ai_readiness_score ?? '-'}</span></div>
                              <div><span className="text-muted-foreground">Urgency:</span>{' '}<span className="font-medium">{survey.project_urgency ?? '-'}</span></div>
                              <div><span className="text-muted-foreground">Budget:</span>{' '}<span className="font-medium">{survey.budget_signals ?? '-'}</span></div>
                              <div className="col-span-2"><span className="text-muted-foreground">Data Availability:</span>{' '}<span className="font-medium">{survey.data_availability ?? '-'}</span></div>
                            </div>
                            {insights.length > 0 && (
                              <div><p className="text-xs font-medium mb-1">Key Insights</p><ul className="space-y-0.5">{insights.map((ins: string, i: number) => <li key={i} className="text-xs text-muted-foreground list-disc ml-4">{ins}</li>)}</ul></div>
                            )}
                            {nextSteps.length > 0 && (
                              <div><p className="text-xs font-medium mb-1">Next Steps</p><ul className="space-y-0.5">{nextSteps.map((ns: string, i: number) => <li key={i} className="text-xs text-muted-foreground list-disc ml-4">{ns}</li>)}</ul></div>
                            )}
                            {survey.detailed_analysis && (
                              <div><p className="text-xs font-medium mb-1">Detailed Analysis</p>{renderMarkdown(survey.detailed_analysis)}</div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                      {followUp && (
                        <Card className="bg-card/80 border-border/50">
                          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Follow-up Email</CardTitle></CardHeader>
                          <CardContent className="space-y-2">
                            <div className="text-xs"><span className="text-muted-foreground">Subject:</span>{' '}<span className="font-medium">{followUp.subject ?? '-'}</span></div>
                            <div className="text-xs"><span className="text-muted-foreground">Strategy:</span>{' '}<span className="font-medium">{followUp.follow_up_strategy ?? '-'}</span></div>
                            {followUp.body && <div className="bg-muted/30 rounded p-2 text-xs whitespace-pre-wrap max-h-32 overflow-y-auto">{followUp.body}</div>}
                            {talkingPoints.length > 0 && (
                              <div><p className="text-xs font-medium mb-1">Talking Points</p><ul className="space-y-0.5">{talkingPoints.map((tp: string, i: number) => <li key={i} className="text-xs text-muted-foreground list-disc ml-4">{tp}</li>)}</ul></div>
                            )}
                            {followUp.calendar_link && <p className="text-xs text-blue-600">{followUp.calendar_link}</p>}
                          </CardContent>
                        </Card>
                      )}
                      {!survey && !followUp && (
                        <div className="col-span-2 text-center py-4 text-sm text-muted-foreground">No survey or follow-up data available for this contact yet.</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </ScrollArea>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <FiBarChart2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">{searchQuery || filterStatus !== 'all' ? 'No matching results' : 'No engagement data yet'}</p>
              <p className="text-xs">Send outreach emails to start tracking engagement</p>
            </div>
          )}
        </CardContent>
      </Card>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      <Dialog open={!!showSurveyModal} onOpenChange={() => setShowSurveyModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Analyze Survey Response</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Paste the survey response data for analysis.</p>
          <div className="space-y-2">
            <Label>Survey Response Data</Label>
            <Textarea placeholder="Paste the survey response text or JSON here..." rows={8} value={surveyInput[showSurveyModal ?? ''] ?? ''} onChange={(e) => setSurveyInput(prev => ({ ...prev, [showSurveyModal ?? '']: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSurveyModal(null)}>Cancel</Button>
            <Button onClick={() => { if (showSurveyModal && surveyInput[showSurveyModal]) { onAnalyzeSurvey(showSurveyModal, surveyInput[showSurveyModal]); setShowSurveyModal(null) } }} disabled={!surveyInput[showSurveyModal ?? '']}>
              Analyze Survey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showFollowUpConfirm} onOpenChange={() => setShowFollowUpConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send Follow-up Email</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to send the follow-up email? This will be sent via Gmail.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFollowUpConfirm(null)}>Cancel</Button>
            <Button onClick={() => { if (showFollowUpConfirm) { onSendFollowUp(showFollowUpConfirm); setShowFollowUpConfirm(null) } }}>
              <FiSend className="mr-1.5 h-4 w-4" />Send Follow-up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
