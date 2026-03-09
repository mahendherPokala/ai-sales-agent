'use client'

import { useState } from 'react'
import { FiCheck, FiX, FiExternalLink, FiChevronDown, FiChevronUp, FiAlertTriangle, FiShield, FiStar, FiMapPin, FiGlobe, FiUsers, FiDollarSign, FiCalendar, FiCpu } from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface DecisionMaker {
  name: string
  title: string
  department: string
  linkedin_url: string
  influence_level: string
  relevance_notes: string
}

interface Opportunity {
  service_name: string
  business_impact: string
  match_reasoning: string
  priority: string
}

interface QualificationReportProps {
  report: any
  companyName: string
  selectedDecisionMakers: DecisionMaker[]
  onSelectDecisionMaker: (dm: DecisionMaker, selected: boolean) => void
  onApproveOutreach: () => void
  onReject: () => void
  onBack: () => void
  loading: boolean
}

function getScoreColor(score: number) {
  if (score >= 85) return { bg: 'bg-emerald-500', text: 'text-emerald-700', ring: 'ring-emerald-200', label: 'Strong Fit' }
  if (score >= 70) return { bg: 'bg-blue-500', text: 'text-blue-700', ring: 'ring-blue-200', label: 'Good Fit' }
  if (score >= 50) return { bg: 'bg-amber-500', text: 'text-amber-700', ring: 'ring-amber-200', label: 'Moderate Fit' }
  return { bg: 'bg-red-500', text: 'text-red-700', ring: 'ring-red-200', label: 'Weak Fit' }
}

function getPriorityBadge(priority: string) {
  const p = (priority ?? '').toLowerCase()
  if (p === 'high') return <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">High</Badge>
  if (p === 'medium') return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Medium</Badge>
  return <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">Low</Badge>
}

function getInfluenceBadge(level: string) {
  const l = (level ?? '').toLowerCase()
  if (l === 'high' || l.includes('decision')) return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">High</Badge>
  if (l === 'medium' || l.includes('influenc')) return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Medium</Badge>
  return <Badge variant="outline" className="text-xs">{level || 'Unknown'}</Badge>
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part)
}

export default function QualificationReportSection({ report, companyName, selectedDecisionMakers, onSelectDecisionMaker, onApproveOutreach, onReject, onBack, loading }: QualificationReportProps) {
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)

  const profile = report?.company_profile
  const icp = report?.icp_qualification
  const opportunities: Opportunity[] = Array.isArray(report?.opportunities) ? report.opportunities : []
  const decisionMakers: DecisionMaker[] = Array.isArray(report?.decision_makers) ? report.decision_makers : []
  const summary = report?.summary ?? ''
  const score = icp?.icp_score ?? 0
  const scoreInfo = getScoreColor(score)

  const initiatives = Array.isArray(profile?.strategic_initiatives) ? profile.strategic_initiatives : []
  const techStack = Array.isArray(profile?.technology_stack) ? profile.technology_stack : []
  const aiIndicators = Array.isArray(profile?.ai_adoption_indicators) ? profile.ai_adoption_indicators : []
  const recentNews = Array.isArray(profile?.recent_news) ? profile.recent_news : []
  const challenges = Array.isArray(profile?.challenges_pain_points) ? profile.challenges_pain_points : []
  const fitFactors = Array.isArray(icp?.fit_factors) ? icp.fit_factors : []
  const riskFactors = Array.isArray(icp?.risk_factors) ? icp.risk_factors : []

  const isDmSelected = (dm: DecisionMaker) => selectedDecisionMakers.some(s => s.name === dm.name && s.title === dm.title)

  if (!report) {
    return (
      <div className="p-6 text-center">
        <FiAlertTriangle className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
        <h3 className="text-base font-semibold mb-1">No Report Selected</h3>
        <p className="text-sm text-muted-foreground mb-4">Research a company first to view the qualification report</p>
        <Button onClick={onBack}>Go to Research</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-[60%] space-y-4">
              {summary && (
                <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent>{renderMarkdown(summary)}</CardContent>
                </Card>
              )}

              <Accordion type="multiple" defaultValue={['profile', 'initiatives', 'challenges']} className="space-y-2">
                <AccordionItem value="profile" className="border rounded-lg bg-card/80 backdrop-blur-md shadow-sm px-4">
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">Company Profile</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-3 text-sm pb-2">
                      <div className="flex items-center gap-2"><FiGlobe className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Website:</span><span className="font-medium">{profile?.website ?? '-'}</span></div>
                      <div className="flex items-center gap-2"><FiCpu className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Industry:</span><span className="font-medium">{profile?.industry ?? '-'}</span></div>
                      <div className="flex items-center gap-2"><FiUsers className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Size:</span><span className="font-medium">{profile?.company_size ?? '-'}</span></div>
                      <div className="flex items-center gap-2"><FiDollarSign className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Revenue:</span><span className="font-medium">{profile?.revenue_estimate ?? '-'}</span></div>
                      <div className="flex items-center gap-2"><FiMapPin className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">HQ:</span><span className="font-medium">{profile?.headquarters ?? '-'}</span></div>
                      <div className="flex items-center gap-2"><FiCalendar className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Founded:</span><span className="font-medium">{profile?.founded ?? '-'}</span></div>
                    </div>
                    {profile?.description && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{profile.description}</p>}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="initiatives" className="border rounded-lg bg-card/80 backdrop-blur-md shadow-sm px-4">
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">Strategic Initiatives</AccordionTrigger>
                  <AccordionContent>
                    {initiatives.length > 0 ? (
                      <ul className="space-y-1.5 pb-2">{initiatives.map((init, i) => <li key={i} className="flex items-start gap-2 text-sm"><FiStar className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" /><span>{init}</span></li>)}</ul>
                    ) : <p className="text-sm text-muted-foreground pb-2">No strategic initiatives identified</p>}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="challenges" className="border rounded-lg bg-card/80 backdrop-blur-md shadow-sm px-4">
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">Challenges & Pain Points</AccordionTrigger>
                  <AccordionContent>
                    {challenges.length > 0 ? (
                      <ul className="space-y-1.5 pb-2">{challenges.map((ch, i) => <li key={i} className="flex items-start gap-2 text-sm"><FiAlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" /><span>{ch}</span></li>)}</ul>
                    ) : <p className="text-sm text-muted-foreground pb-2">No challenges identified</p>}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tech" className="border rounded-lg bg-card/80 backdrop-blur-md shadow-sm px-4">
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">Technology Stack</AccordionTrigger>
                  <AccordionContent>
                    {techStack.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pb-2">{techStack.map((t, i) => <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>)}</div>
                    ) : <p className="text-sm text-muted-foreground pb-2">No technology stack data</p>}
                  </AccordionContent>
                </AccordionItem>

                {aiIndicators.length > 0 && (
                  <AccordionItem value="ai" className="border rounded-lg bg-card/80 backdrop-blur-md shadow-sm px-4">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">AI Adoption Indicators</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1.5 pb-2">{aiIndicators.map((a, i) => <li key={i} className="flex items-start gap-2 text-sm"><FiCpu className="h-3.5 w-3.5 text-purple-500 mt-0.5 shrink-0" /><span>{a}</span></li>)}</ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {recentNews.length > 0 && (
                  <AccordionItem value="news" className="border rounded-lg bg-card/80 backdrop-blur-md shadow-sm px-4">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">Recent News</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1.5 pb-2">{recentNews.map((n, i) => <li key={i} className="text-sm text-muted-foreground">{n}</li>)}</ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>

            <div className="lg:w-[40%] space-y-4">
              <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-sm">
                <CardContent className="pt-6 flex flex-col items-center">
                  <div className={`relative w-28 h-28 rounded-full flex items-center justify-center ring-4 ${scoreInfo.ring} ${scoreInfo.bg} mb-3`}>
                    <span className="text-3xl font-bold text-white">{score}</span>
                  </div>
                  <Badge className={`${scoreInfo.bg} text-white text-sm px-3 py-0.5 mb-2`}>{scoreInfo.label}</Badge>
                  <p className="text-xs text-muted-foreground">{icp?.qualification_category ?? ''}</p>
                  {icp?.scoring_reasoning && <p className="text-xs text-muted-foreground mt-2 text-center leading-relaxed">{icp.scoring_reasoning}</p>}
                </CardContent>
              </Card>

              {(fitFactors.length > 0 || riskFactors.length > 0) && (
                <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-sm">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Fit & Risk Factors</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {fitFactors.length > 0 && (
                      <div><p className="text-xs font-medium text-emerald-700 mb-1">Fit Factors</p>
                        {fitFactors.map((f, i) => <div key={i} className="flex items-start gap-1.5 text-xs mb-1"><FiCheck className="h-3 w-3 text-emerald-600 mt-0.5 shrink-0" /><span>{f}</span></div>)}
                      </div>
                    )}
                    {riskFactors.length > 0 && (
                      <div><p className="text-xs font-medium text-red-700 mb-1">Risk Factors</p>
                        {riskFactors.map((r, i) => <div key={i} className="flex items-start gap-1.5 text-xs mb-1"><FiX className="h-3 w-3 text-red-600 mt-0.5 shrink-0" /><span>{r}</span></div>)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {opportunities.length > 0 && (
                <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-sm">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Opportunities</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {opportunities.map((opp, i) => (
                      <div key={i} className="p-3 bg-muted/50 rounded-lg border border-border/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{opp.service_name}</span>
                          {getPriorityBadge(opp.priority)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{opp.business_impact}</p>
                        <p className="text-xs text-muted-foreground/80 italic">{opp.match_reasoning}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Decision Makers</CardTitle>
                    <Badge variant="secondary" className="text-xs">{selectedDecisionMakers.length} selected</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {decisionMakers.length > 0 ? decisionMakers.map((dm, i) => (
                    <div key={i} className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors ${isDmSelected(dm) ? 'bg-primary/5 border-primary/20' : 'border-border/50 hover:bg-muted/50'}`}>
                      <Checkbox checked={isDmSelected(dm)} onCheckedChange={(checked) => onSelectDecisionMaker(dm, !!checked)} className="mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium truncate">{dm.name}</span>
                          {getInfluenceBadge(dm.influence_level)}
                        </div>
                        <p className="text-xs text-muted-foreground">{dm.title} - {dm.department}</p>
                        {dm.relevance_notes && <p className="text-xs text-muted-foreground/80 mt-0.5">{dm.relevance_notes}</p>}
                        {dm.linkedin_url && (
                          <a href={dm.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1">
                            <FiExternalLink className="h-3 w-3" />LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No decision makers found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="border-t border-border bg-card/90 backdrop-blur-md px-6 py-3 flex items-center justify-between shrink-0">
        <Button variant="ghost" onClick={onBack} className="text-sm">Back to Research</Button>
        <div className="flex items-center gap-2">
          {showRejectConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Reject this company?</span>
              <Button variant="destructive" size="sm" onClick={() => { onReject(); setShowRejectConfirm(false) }}>Confirm</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowRejectConfirm(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setShowRejectConfirm(true)}>Reject Company</Button>
          )}
          <Button onClick={onApproveOutreach} disabled={selectedDecisionMakers.length === 0 || loading} className="min-w-[160px]">
            {loading ? 'Generating Emails...' : `Approve Outreach (${selectedDecisionMakers.length})`}
          </Button>
        </div>
      </div>
    </div>
  )
}
