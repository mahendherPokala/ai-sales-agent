'use client'

import { useState } from 'react'
import { FiSearch, FiGlobe, FiClock, FiExternalLink, FiLoader } from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2 } from 'lucide-react'

interface CompanyData {
  id: string
  companyName: string
  website: string
  industry: string
  status: string
  report: any
  createdAt: string
}

interface ResearchProps {
  companies: CompanyData[]
  loading: boolean
  error: string | null
  onResearch: (companyName: string, website: string, industry: string) => void
  onViewReport: (company: CompanyData) => void
  sampleMode: boolean
}

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Manufacturing',
  'Retail & E-commerce', 'Energy', 'Telecommunications', 'Education',
  'Real Estate', 'Logistics & Transportation', 'Other'
]

const SAMPLE_COMPANIES: CompanyData[] = [
  { id: 's1', companyName: 'TechCorp Inc.', website: 'techcorp.com', industry: 'Technology', status: 'completed', report: { icp_qualification: { icp_score: 92 } }, createdAt: '2025-03-08T10:30:00Z' },
  { id: 's2', companyName: 'Global Finance Ltd.', website: 'globalfinance.com', industry: 'Finance & Banking', status: 'completed', report: { icp_qualification: { icp_score: 78 } }, createdAt: '2025-03-07T14:20:00Z' },
  { id: 's3', companyName: 'DataFlow Systems', website: 'dataflow.io', industry: 'Technology', status: 'completed', report: { icp_qualification: { icp_score: 85 } }, createdAt: '2025-03-06T09:15:00Z' },
  { id: 's4', companyName: 'MediTech Solutions', website: 'meditech.com', industry: 'Healthcare', status: 'completed', report: { icp_qualification: { icp_score: 63 } }, createdAt: '2025-03-05T16:45:00Z' },
  { id: 's5', companyName: 'RetailPro Global', website: 'retailpro.com', industry: 'Retail & E-commerce', status: 'completed', report: { icp_qualification: { icp_score: 44 } }, createdAt: '2025-03-04T11:00:00Z' },
]

function getScoreColor(score: number) {
  if (score >= 85) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (score >= 70) return 'bg-blue-100 text-blue-700 border-blue-200'
  if (score >= 50) return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-red-100 text-red-700 border-red-200'
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Completed</Badge>
    case 'researching': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs animate-pulse">Researching</Badge>
    case 'failed': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">Failed</Badge>
    default: return <Badge variant="outline" className="text-xs">Unknown</Badge>
  }
}

export default function ResearchSection({ companies, loading, error, onResearch, onViewReport, sampleMode }: ResearchProps) {
  const [companyName, setCompanyName] = useState('')
  const [website, setWebsite] = useState('')
  const [industry, setIndustry] = useState('')

  const displayCompanies = sampleMode ? SAMPLE_COMPANIES : companies

  const handleSubmit = () => {
    if (!companyName.trim() || !website.trim()) return
    onResearch(companyName.trim(), website.trim(), industry)
    setCompanyName('')
    setWebsite('')
    setIndustry('')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FiSearch className="h-5 w-5 text-primary" />
            Research a Company
          </CardTitle>
          <p className="text-sm text-muted-foreground">Enter a company name and website to run AI-powered sales intelligence research. This typically takes 30-60 seconds.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name *</Label>
              <Input id="company-name" placeholder="e.g., Acme Corporation" value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website Domain *</Label>
              <div className="relative">
                <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="website" placeholder="e.g., acme.com" className="pl-9" value={website} onChange={(e) => setWebsite(e.target.value)} disabled={loading} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label>Industry (Optional)</Label>
              <Select value={industry} onValueChange={setIndustry} disabled={loading}>
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(ind => (<SelectItem key={ind} value={ind}>{ind}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSubmit} disabled={loading || !companyName.trim() || !website.trim()} className="h-10">
              {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Researching...</>) : (<><FiSearch className="mr-2 h-4 w-4" />Run Research</>)}
            </Button>
          </div>
          {loading && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              <FiLoader className="h-4 w-4 animate-spin" />
              <span>AI agents are researching this company. This may take 30-60 seconds...</span>
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FiClock className="h-5 w-5 text-muted-foreground" />
            Recent Research
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayCompanies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>ICP Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayCompanies.map((company) => {
                  const score = company.report?.icp_qualification?.icp_score
                  return (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.companyName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{company.website}</TableCell>
                      <TableCell className="text-sm">{company.industry || '-'}</TableCell>
                      <TableCell>
                        {score != null ? (
                          <Badge variant="outline" className={`text-xs ${getScoreColor(score)}`}>{score}/100</Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(company.status)}</TableCell>
                      <TableCell className="text-right">
                        {company.status === 'completed' && (
                          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onViewReport(company)}>
                            <FiExternalLink className="mr-1 h-3 w-3" />View Report
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <FiSearch className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No research submissions yet</p>
              <p className="text-xs">Enter a company above to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
