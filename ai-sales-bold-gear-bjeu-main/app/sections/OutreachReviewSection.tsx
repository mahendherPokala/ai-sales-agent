'use client'

import { useState } from 'react'
import { FiMail, FiUser, FiLink, FiCalendar, FiSend, FiEdit2, FiArrowLeft, FiCheck, FiX } from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

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

interface OutreachReviewProps {
  emails: OutreachEmail[]
  onUpdateEmail: (index: number, updated: OutreachEmail) => void
  onSendEmails: () => void
  onBack: () => void
  sending: boolean
  deliveryResults: DeliveryResult[]
  error: string | null
}

export default function OutreachReviewSection({ emails, onUpdateEmail, onSendEmails, onBack, sending, deliveryResults, error }: OutreachReviewProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [editing, setEditing] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [editDraft, setEditDraft] = useState<OutreachEmail | null>(null)

  const safeEmails = Array.isArray(emails) ? emails : []
  const currentEmail = safeEmails[selectedIndex] ?? null

  const handleStartEdit = () => {
    if (!currentEmail) return
    setEditDraft({ ...currentEmail })
    setEditing(true)
  }

  const handleSaveEdit = () => {
    if (editDraft) {
      onUpdateEmail(selectedIndex, editDraft)
      setEditing(false)
      setEditDraft(null)
    }
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setEditDraft(null)
  }

  const getDeliveryStatus = (email: string) => {
    return deliveryResults.find(d => d.recipient_email === email)
  }

  if (safeEmails.length === 0) {
    return (
      <div className="p-6 text-center">
        <FiMail className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
        <h3 className="text-base font-semibold mb-1">No Outreach Emails</h3>
        <p className="text-sm text-muted-foreground mb-4">Approve outreach from a qualification report to generate emails</p>
        <Button onClick={onBack}>Go to Research</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 border-r border-border bg-card/50 shrink-0">
          <div className="p-3 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground">{safeEmails.length} Email{safeEmails.length !== 1 ? 's' : ''} Generated</p>
          </div>
          <ScrollArea className="h-[calc(100%-44px)]">
            <div className="p-2 space-y-1">
              {safeEmails.map((email, idx) => {
                const delivery = getDeliveryStatus(email.recipient_email)
                return (
                  <button
                    key={idx}
                    onClick={() => { setSelectedIndex(idx); setEditing(false); setEditDraft(null) }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${selectedIndex === idx ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50 border border-transparent'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{email.recipient_name || 'Unknown'}</span>
                      {delivery && (
                        <Badge variant="outline" className={`text-xs shrink-0 ml-1 ${delivery.status === 'sent' || delivery.status === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {delivery.status === 'sent' || delivery.status === 'success' ? 'Sent' : 'Failed'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{email.recipient_title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{email.subject}</p>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 overflow-hidden">
          {currentEmail && (
            <ScrollArea className="h-full">
              <div className="p-6 max-w-3xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Email Preview</h2>
                  {!editing && (
                    <Button variant="outline" size="sm" onClick={handleStartEdit}>
                      <FiEdit2 className="mr-1.5 h-3.5 w-3.5" />Edit
                    </Button>
                  )}
                </div>

                <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-sm">
                  <CardContent className="pt-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Recipient</Label>
                        <div className="flex items-center gap-2">
                          <FiUser className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium">{currentEmail.recipient_name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-6">{currentEmail.recipient_title}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <div className="flex items-center gap-2">
                          <FiMail className="h-3.5 w-3.5 text-muted-foreground" />
                          {editing ? (
                            <Input value={editDraft?.recipient_email ?? ''} onChange={(e) => setEditDraft(prev => prev ? { ...prev, recipient_email: e.target.value } : prev)} className="h-8 text-sm" />
                          ) : (
                            <span className="text-sm">{currentEmail.recipient_email}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Subject</Label>
                      {editing ? (
                        <Input value={editDraft?.subject ?? ''} onChange={(e) => setEditDraft(prev => prev ? { ...prev, subject: e.target.value } : prev)} className="text-sm" />
                      ) : (
                        <p className="text-sm font-medium">{currentEmail.subject}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Body</Label>
                      {editing ? (
                        <Textarea value={editDraft?.body ?? ''} onChange={(e) => setEditDraft(prev => prev ? { ...prev, body: e.target.value } : prev)} rows={12} className="text-sm font-mono" />
                      ) : (
                        <div className="bg-muted/30 rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed">{currentEmail.body}</div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1"><FiLink className="h-3 w-3" />Survey Link</Label>
                        {editing ? (
                          <Input value={editDraft?.survey_link ?? ''} onChange={(e) => setEditDraft(prev => prev ? { ...prev, survey_link: e.target.value } : prev)} className="h-8 text-xs" />
                        ) : (
                          <p className="text-xs text-blue-600 truncate">{currentEmail.survey_link || 'Not set'}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1"><FiCalendar className="h-3 w-3" />Calendar Link</Label>
                        {editing ? (
                          <Input value={editDraft?.calendar_link ?? ''} onChange={(e) => setEditDraft(prev => prev ? { ...prev, calendar_link: e.target.value } : prev)} className="h-8 text-xs" />
                        ) : (
                          <p className="text-xs text-blue-600 truncate">{currentEmail.calendar_link || 'Not set'}</p>
                        )}
                      </div>
                    </div>

                    {editing && (
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}><FiX className="mr-1 h-3.5 w-3.5" />Cancel</Button>
                        <Button size="sm" onClick={handleSaveEdit}><FiCheck className="mr-1 h-3.5 w-3.5" />Save Changes</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
                )}

                {deliveryResults.length > 0 && (
                  <Card className="mt-4 bg-card/80 backdrop-blur-md border-border/50 shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Delivery Results</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {deliveryResults.map((dr, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded border border-border/50">
                            <div>
                              <p className="text-sm font-medium">{dr.recipient_name}</p>
                              <p className="text-xs text-muted-foreground">{dr.recipient_email}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className={`text-xs ${dr.status === 'sent' || dr.status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                {dr.status}
                              </Badge>
                              {dr.message && <p className="text-xs text-muted-foreground mt-0.5">{dr.message}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-card/90 backdrop-blur-md px-6 py-3 flex items-center justify-between shrink-0">
        <Button variant="ghost" onClick={onBack}><FiArrowLeft className="mr-1.5 h-4 w-4" />Back</Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack}>Cancel</Button>
          <Button onClick={() => setShowConfirmModal(true)} disabled={sending || safeEmails.length === 0} className="min-w-[140px]">
            {sending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>) : (<><FiSend className="mr-1.5 h-4 w-4" />Send Emails</>)}
          </Button>
        </div>
      </div>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Email Send</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">You are about to send {safeEmails.length} outreach email{safeEmails.length !== 1 ? 's' : ''} via Gmail. This action cannot be undone.</p>
          <div className="space-y-1 mt-2">
            {safeEmails.map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <FiMail className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{e.recipient_name}</span>
                <span className="text-muted-foreground">({e.recipient_email})</span>
              </div>
            ))}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
            <Button onClick={() => { setShowConfirmModal(false); onSendEmails() }}>
              <FiSend className="mr-1.5 h-4 w-4" />Confirm Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
