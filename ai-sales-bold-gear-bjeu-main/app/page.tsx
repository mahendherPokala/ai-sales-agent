'use client'

import React, { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { callAIAgent } from '@/lib/aiAgent'

import Sidebar from './sections/Sidebar'
import Header from './sections/Header'

// Dynamic imports to prevent SSR hydration mismatches on heavy components
const DashboardSection = dynamic(() => import('./sections/DashboardSection'), { ssr: false })
const ResearchSection = dynamic(() => import('./sections/ResearchSection'), { ssr: false })
const QualificationReportSection = dynamic(() => import('./sections/QualificationReportSection'), { ssr: false })
const OutreachReviewSection = dynamic(() => import('./sections/OutreachReviewSection'), { ssr: false })
const EngagementDashboardSection = dynamic(() => import('./sections/EngagementDashboardSection'), { ssr: false })

// --- Agent IDs ---
const SALES_INTELLIGENCE_MANAGER = '69ae8a5e02d449101273a2d1'
const OUTREACH_EMAIL_AGENT = '69ae8a9402d449101273a2d3'
const EMAIL_DELIVERY_AGENT = '69ae8aaa27c3c93e13e20786'
const SURVEY_ANALYSIS_AGENT = '69ae8a95fee5a76ed56614b9'
const FOLLOW_UP_AGENT = '69ae8a9501d1193bde72d0ef'
const FOLLOW_UP_DELIVERY_AGENT = '69ae8aab27c3c93e13e20788'

// --- Types ---
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

interface DecisionMaker {
  name: string
  title: string
  department: string
  linkedin_url: string
  influence_level: string
  relevance_notes: string
}

interface OutreachEmail {
  recipient_name: string
  recipient_title: string
  recipient_email: string
  subject: string
  body: string
  survey_link: string
  calendar_link: string
}

interface DeliveryResult {
  recipient_email: string
  recipient_name: string
  status: string
  message: string
}

// --- ErrorBoundary ---
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// --- LocalStorage helpers ---
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota errors
  }
}

// --- Main Page ---
export default function Page() {
  const [activeScreen, setActiveScreen] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sampleMode, setSampleMode] = useState(true)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Shared state
  const [companies, setCompanies] = useState<CompanyData[]>([])
  const [activeReport, setActiveReport] = useState<any>(null)
  const [activeCompanyName, setActiveCompanyName] = useState('')
  const [selectedDecisionMakers, setSelectedDecisionMakers] = useState<DecisionMaker[]>([])
  const [outreachEmails, setOutreachEmails] = useState<OutreachEmail[]>([])
  const [deliveryResults, setDeliveryResults] = useState<DeliveryResult[]>([])
  const [engagementData, setEngagementData] = useState<EngagementRow[]>([])

  // Loading/error
  const [researchLoading, setResearchLoading] = useState(false)
  const [researchError, setResearchError] = useState<string | null>(null)
  const [outreachLoading, setOutreachLoading] = useState(false)
  const [sendingEmails, setSendingEmails] = useState(false)
  const [outreachError, setOutreachError] = useState<string | null>(null)
  const [engagementAction, setEngagementAction] = useState<{ rowId: string; action: string } | null>(null)
  const [engagementError, setEngagementError] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const storedCompanies = loadFromStorage<CompanyData[]>('pronix_companies', [])
    const storedEngagement = loadFromStorage<EngagementRow[]>('pronix_engagement', [])
    setCompanies(storedCompanies)
    setEngagementData(storedEngagement)
    setMounted(true)
  }, [])

  // Persist to localStorage only after initial mount
  useEffect(() => { if (mounted) saveToStorage('pronix_companies', companies) }, [companies, mounted])
  useEffect(() => { if (mounted) saveToStorage('pronix_engagement', engagementData) }, [engagementData, mounted])

  // --- Research Handler ---
  const handleResearch = useCallback(async (companyName: string, website: string, industry: string) => {
    setResearchLoading(true)
    setResearchError(null)
    setActiveAgentId(SALES_INTELLIGENCE_MANAGER)

    const newCompany: CompanyData = {
      id: `c-${Date.now()}`,
      companyName, website, industry,
      status: 'researching', report: null,
      createdAt: new Date().toISOString(),
    }
    setCompanies(prev => [newCompany, ...prev])

    try {
      const message = `Research the company: ${companyName}. Website: ${website}.${industry ? ` Industry: ${industry}.` : ''} Provide a comprehensive intelligence report including company profile, ICP qualification score, opportunity analysis, and decision maker discovery.`
      const result = await callAIAgent(message, SALES_INTELLIGENCE_MANAGER)

      if (result.success) {
        const data = result?.response?.result
        setCompanies(prev => prev.map(c => c.id === newCompany.id ? { ...c, status: 'completed', report: data } : c))
        setActiveReport(data)
        setActiveCompanyName(companyName)
        setSelectedDecisionMakers([])
        setActiveScreen('report')
      } else {
        setCompanies(prev => prev.map(c => c.id === newCompany.id ? { ...c, status: 'failed' } : c))
        setResearchError(result?.error ?? 'Research failed. Please try again.')
      }
    } catch {
      setCompanies(prev => prev.map(c => c.id === newCompany.id ? { ...c, status: 'failed' } : c))
      setResearchError('An unexpected error occurred.')
    } finally {
      setResearchLoading(false)
      setActiveAgentId(null)
    }
  }, [])

  // --- View Report ---
  const handleViewReport = useCallback((company: CompanyData) => {
    setActiveReport(company.report)
    setActiveCompanyName(company.companyName)
    setSelectedDecisionMakers([])
    setActiveScreen('report')
  }, [])

  // --- Decision Maker Selection ---
  const handleSelectDecisionMaker = useCallback((dm: DecisionMaker, selected: boolean) => {
    setSelectedDecisionMakers(prev =>
      selected ? [...prev, dm] : prev.filter(s => !(s.name === dm.name && s.title === dm.title))
    )
  }, [])

  // --- Approve Outreach ---
  const handleApproveOutreach = useCallback(async () => {
    setOutreachLoading(true)
    setOutreachError(null)
    setActiveAgentId(OUTREACH_EMAIL_AGENT)

    try {
      const message = `Generate personalized outreach emails for the following decision makers at ${activeCompanyName}.\n\nCompany Research Data: ${JSON.stringify(activeReport)}\n\nSelected Decision Makers: ${JSON.stringify(selectedDecisionMakers)}\n\nCreate tailored emails referencing specific company initiatives, industry insights, and relevant Pronix AI use cases for each decision maker.`
      const result = await callAIAgent(message, OUTREACH_EMAIL_AGENT)

      if (result.success) {
        const data = result?.response?.result
        const emails = Array.isArray(data?.emails) ? data.emails : []
        setOutreachEmails(emails)
        setDeliveryResults([])
        setActiveScreen('outreach')
      } else {
        setOutreachError(result?.error ?? 'Failed to generate outreach emails.')
      }
    } catch {
      setOutreachError('An unexpected error occurred.')
    } finally {
      setOutreachLoading(false)
      setActiveAgentId(null)
    }
  }, [activeCompanyName, activeReport, selectedDecisionMakers])

  // --- Update Email ---
  const handleUpdateEmail = useCallback((index: number, updated: OutreachEmail) => {
    setOutreachEmails(prev => prev.map((e, i) => i === index ? updated : e))
  }, [])

  // --- Send Emails ---
  const handleSendEmails = useCallback(async () => {
    setSendingEmails(true)
    setOutreachError(null)
    setActiveAgentId(EMAIL_DELIVERY_AGENT)
    const results: DeliveryResult[] = []

    try {
      for (const email of outreachEmails) {
        const message = `Send this email to ${email.recipient_email}. Subject: ${email.subject}. Body: ${email.body}`
        const result = await callAIAgent(message, EMAIL_DELIVERY_AGENT)
        if (result.success) {
          const dr = result?.response?.result
          const deliveries = Array.isArray(dr?.delivery_results) ? dr.delivery_results : [{ recipient_email: email.recipient_email, recipient_name: email.recipient_name, status: 'sent', message: 'Email sent successfully' }]
          results.push(...deliveries)
        } else {
          results.push({ recipient_email: email.recipient_email, recipient_name: email.recipient_name, status: 'failed', message: result?.error ?? 'Send failed' })
        }

        const newEngagement: EngagementRow = {
          id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          company: activeCompanyName,
          recipientEmail: email.recipient_email,
          recipientName: email.recipient_name,
          emailSentDate: new Date().toISOString().split('T')[0],
          emailOpened: 'Pending',
          surveyCompleted: 'Pending',
          surveyScore: null,
          followUpSent: 'Pending',
          meetingScheduled: 'Pending',
          surveyData: null,
          followUpData: null,
        }
        setEngagementData(prev => {
          const exists = prev.some(e => e.recipientEmail === email.recipient_email && e.company === activeCompanyName)
          return exists ? prev : [...prev, newEngagement]
        })
      }

      setDeliveryResults(results)
    } catch {
      setOutreachError('An error occurred while sending emails.')
    } finally {
      setSendingEmails(false)
      setActiveAgentId(null)
    }
  }, [outreachEmails, activeCompanyName])

  // --- Survey Analysis ---
  const handleAnalyzeSurvey = useCallback(async (rowId: string, surveyText: string) => {
    setEngagementAction({ rowId, action: 'survey' })
    setEngagementError(null)
    setActiveAgentId(SURVEY_ANALYSIS_AGENT)

    try {
      const row = engagementData.find(r => r.id === rowId)
      const message = `Analyze the following survey response from ${row?.recipientName ?? 'Unknown'} at ${row?.company ?? 'Unknown Company'}:\n\n${surveyText}`
      const result = await callAIAgent(message, SURVEY_ANALYSIS_AGENT)

      if (result.success) {
        const data = result?.response?.result
        setEngagementData(prev => prev.map(r => r.id === rowId ? {
          ...r, surveyCompleted: 'Completed',
          surveyScore: data?.ai_readiness_score ?? null,
          surveyData: data,
        } : r))
      } else {
        setEngagementError(result?.error ?? 'Survey analysis failed.')
      }
    } catch {
      setEngagementError('An unexpected error occurred.')
    } finally {
      setEngagementAction(null)
      setActiveAgentId(null)
    }
  }, [engagementData])

  // --- Generate Follow-up ---
  const handleGenerateFollowUp = useCallback(async (rowId: string) => {
    setEngagementAction({ rowId, action: 'followup' })
    setEngagementError(null)
    setActiveAgentId(FOLLOW_UP_AGENT)

    try {
      const row = engagementData.find(r => r.id === rowId)
      const message = `Generate a follow-up email for ${row?.recipientName ?? 'Unknown'} (${row?.recipientEmail ?? ''}) at ${row?.company ?? 'Unknown Company'}.\n\nSurvey Analysis: ${JSON.stringify(row?.surveyData)}\n\nCreate a personalized follow-up based on their survey responses and AI readiness assessment.`
      const result = await callAIAgent(message, FOLLOW_UP_AGENT)

      if (result.success) {
        const data = result?.response?.result
        setEngagementData(prev => prev.map(r => r.id === rowId ? { ...r, followUpData: data } : r))
      } else {
        setEngagementError(result?.error ?? 'Follow-up generation failed.')
      }
    } catch {
      setEngagementError('An unexpected error occurred.')
    } finally {
      setEngagementAction(null)
      setActiveAgentId(null)
    }
  }, [engagementData])

  // --- Send Follow-up ---
  const handleSendFollowUp = useCallback(async (rowId: string) => {
    setEngagementAction({ rowId, action: 'sendFollowup' })
    setEngagementError(null)
    setActiveAgentId(FOLLOW_UP_DELIVERY_AGENT)

    try {
      const row = engagementData.find(r => r.id === rowId)
      const fu = row?.followUpData
      const message = `Send this follow-up email to ${fu?.recipient_email ?? row?.recipientEmail ?? ''}. Subject: ${fu?.subject ?? 'Follow-up'}. Body: ${fu?.body ?? ''}`
      const result = await callAIAgent(message, FOLLOW_UP_DELIVERY_AGENT)

      if (result.success) {
        setEngagementData(prev => prev.map(r => r.id === rowId ? { ...r, followUpSent: 'Sent' } : r))
      } else {
        setEngagementError(result?.error ?? 'Follow-up delivery failed.')
      }
    } catch {
      setEngagementError('An unexpected error occurred.')
    } finally {
      setEngagementAction(null)
      setActiveAgentId(null)
    }
  }, [engagementData])

  // --- Reject Company ---
  const handleRejectCompany = useCallback(() => {
    setActiveReport(null)
    setSelectedDecisionMakers([])
    setActiveScreen('research')
  }, [])

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gradient-to-br from-[hsl(210,20%,97%)] via-[hsl(220,25%,95%)] to-[hsl(200,20%,96%)] text-foreground font-sans">
        <Sidebar
          activeScreen={activeScreen}
          onNavigate={setActiveScreen}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
          companiesCount={companies.length}
          emailsSent={engagementData.length}
        />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header
            activeScreen={activeScreen}
            sampleMode={sampleMode}
            onToggleSample={setSampleMode}
            activeAgentId={activeAgentId}
          />
          <main className="flex-1 overflow-y-auto">
            {activeScreen === 'dashboard' && (
              <DashboardSection
                companies={companies}
                engagementData={engagementData}
                sampleMode={sampleMode}
                onNavigate={setActiveScreen}
              />
            )}
            {activeScreen === 'research' && (
              <ResearchSection
                companies={companies}
                loading={researchLoading}
                error={researchError}
                onResearch={handleResearch}
                onViewReport={handleViewReport}
                sampleMode={sampleMode}
              />
            )}
            {activeScreen === 'report' && (
              <QualificationReportSection
                report={activeReport}
                companyName={activeCompanyName}
                selectedDecisionMakers={selectedDecisionMakers}
                onSelectDecisionMaker={handleSelectDecisionMaker}
                onApproveOutreach={handleApproveOutreach}
                onReject={handleRejectCompany}
                onBack={() => setActiveScreen('research')}
                loading={outreachLoading}
              />
            )}
            {activeScreen === 'outreach' && (
              <OutreachReviewSection
                emails={outreachEmails}
                onUpdateEmail={handleUpdateEmail}
                onSendEmails={handleSendEmails}
                onBack={() => setActiveScreen('report')}
                sending={sendingEmails}
                deliveryResults={deliveryResults}
                error={outreachError}
              />
            )}
            {activeScreen === 'engagement' && (
              <EngagementDashboardSection
                engagementData={engagementData}
                sampleMode={sampleMode}
                onAnalyzeSurvey={handleAnalyzeSurvey}
                onGenerateFollowUp={handleGenerateFollowUp}
                onSendFollowUp={handleSendFollowUp}
                activeAction={engagementAction}
                error={engagementError}
              />
            )}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
