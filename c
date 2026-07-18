[1mdiff --git a/apps/rentedge/app/adaptive-profile/page.tsx b/apps/rentedge/app/adaptive-profile/page.tsx[m
[1mindex ff9c5b7..09cf3a7 100644[m
[1m--- a/apps/rentedge/app/adaptive-profile/page.tsx[m
[1m+++ b/apps/rentedge/app/adaptive-profile/page.tsx[m
[36m@@ -41,6 +41,24 @@[m [mconst EMPTY_ANSWERS: ProfileAnswers = {[m
   guarantorSupport: '',[m
 }[m
 [m
[32m+[m[32m// Human-readable labels used by the progress header and the "editing"[m
[32m+[m[32m// state — separate from the longer labels used in the answered-items list[m
[32m+[m[32m// below, since these need to fit on one line next to a Back/Cancel button.[m
[32m+[m[32mconst QUESTION_LABELS: Record<string, string> = {[m
[32m+[m[32m  incomeSource: 'Income source',[m
[32m+[m[32m  incomeStructure: 'Income structure',[m
[32m+[m[32m  monthlyIncome: 'Monthly income',[m
[32m+[m[32m  employmentStability: 'Stability',[m
[32m+[m[32m  rentalHistory: 'Rental history',[m
[32m+[m[32m  referenceLikelihood: 'Reference likelihood',[m
[32m+[m[32m  referenceAvailability: 'References',[m
[32m+[m[32m  occupancy: 'Occupancy',[m
[32m+[m[32m  moveTiming: 'Move timing',[m
[32m+[m[32m  depositReadiness: 'Deposit',[m
[32m+[m[32m  documentationGaps: 'Documentation',[m
[32m+[m[32m  guarantorSupport: 'Guarantor',[m
[32m+[m[32m}[m
[32m+[m
 export default function AdaptiveProfilePage() {[m
   const router = useRouter()[m
   const [properties, setProperties] = useState<Property[]>([])[m
[36m@@ -107,6 +125,27 @@[m [mexport default function AdaptiveProfilePage() {[m
 [m
   const profileComplete = !currentQuestion[m
 [m
[32m+[m[32m  // Explains, on the question itself, why a branch-only question showed up[m
[32m+[m[32m  // — otherwise a question appearing that wasn't there a moment ago can[m
[32m+[m[32m  // read as the form getting longer rather than getting smarter.[m
[32m+[m[32m  const branchReason: Partial<Record<string, string>> = {}[m
[32m+[m[32m  if (needsReferences) {[m
[32m+[m[32m    branchReason.referenceLikelihood = "Asked because you've rented before"[m
[32m+[m[32m    branchReason.referenceAvailability = "Asked because you've rented before"[m
[32m+[m[32m  }[m
[32m+[m[32m  if (needsGuarantor) {[m
[32m+[m[32m    branchReason.guarantorSupport =[m
[32m+[m[32m      answers.incomeSource === 'Student'[m
[32m+[m[32m        ? "Asked because you're a student"[m
[32m+[m[32m        : answers.rentalHistory === 'First-time renter'[m
[32m+[m[32m        ? "Asked because this is your first time renting"[m
[32m+[m[32m        : "Asked because affordability looks tight for the properties you're tracking"[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  const isEditing = Boolean(editingField)[m
[32m+[m[32m  const currentIndex = currentQuestion ? questionQueue.indexOf(currentQuestion) : -1[m
[32m+[m[32m  const previousKey = !isEditing && currentIndex > 0 ? questionQueue[currentIndex - 1] : null[m
[32m+[m
   const updateAnswer = (field: keyof ProfileAnswers, value: any) => {[m
     setAnswers(prev => ({ ...prev, [field]: value }))[m
     setEditingField(null)[m
[36m@@ -189,23 +228,6 @@[m [mexport default function AdaptiveProfilePage() {[m
         <p className="section-subtitle">Let's understand your rental position against the properties you are targeting.</p>[m
       </section>[m
 [m
[31m-      <div className="card card-elevated">[m
[31m-        <p className="label">Property market</p>[m
[31m-        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>[m
[31m-          {[[m
[31m-            { label: 'Tracked',      value: String(properties.length) },[m
[31m-            { label: 'Highest rent', value: `R${highestRent.toLocaleString()}` },[m
[31m-            { label: 'Lowest rent',  value: `R${lowestRent.toLocaleString()}` },[m
[31m-            { label: 'Average rent', value: `R${averageRent.toLocaleString()}` },[m
[31m-          ].map(item => ([m
[31m-            <div key={item.label} className="card-inner">[m
[31m-              <p className="label">{item.label}</p>[m
[31m-              <p className="section-title" style={{ marginTop: 6, fontSize: 17 }}>{item.value}</p>[m
[31m-            </div>[m
[31m-          ))}[m
[31m-        </div>[m
[31m-      </div>[m
[31m-[m
       <div className="card-accent">[m
         <p className="label">Guidance</p>[m
         <p className="body-text" style={{ marginTop: 8 }}>{guidance}</p>[m
[36m@@ -213,7 +235,56 @@[m [mexport default function AdaptiveProfilePage() {[m
 [m
       {!profileComplete && ([m
         <div className="card card-elevated">[m
[31m-          <p className="label" style={{ marginBottom: 14, color: 'var(--accent-primary)' }}>Next question</p>[m
[32m+[m
[32m+[m[32m          {/* Progress / edit header — replaces the old static "Next question"[m
[32m+[m[32m              label. In the normal forward flow this shows a growing[m
[32m+[m[32m              progress bar (grows when a branch adds a question, rather than[m
[32m+[m[32m              lying with a fixed total) plus a Back button to the previous[m
[32m+[m[32m              question. When editing a past answer from the list below, it[m
[32m+[m[32m              switches to a simple "Editing: X" + Cancel affordance instead,[m
[32m+[m[32m              since forward progress doesn't apply there. */}[m
[32m+[m[32m          {isEditing ? ([m
[32m+[m[32m            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>[m
[32m+[m[32m              <p className="label" style={{ color: 'var(--accent-primary)' }}>[m
[32m+[m[32m                Editing: {QUESTION_LABELS[editingField!] || editingField}[m
[32m+[m[32m              </p>[m
[32m+[m[32m              <button onClick={() => setEditingField(null)} className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}>[m
[32m+[m[32m                Cancel[m
[32m+[m[32m              </button>[m
[32m+[m[32m            </div>[m
[32m+[m[32m          ) : ([m
[32m+[m[32m            <div style={{ marginBottom: 14 }}>[m
[32m+[m[32m              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>[m
[32m+[m[32m                <p className="label" style={{ color: 'var(--accent-primary)' }}>[m
[32m+[m[32m                  Question {currentIndex + 1}[m
[32m+[m[32m                </p>[m
[32m+[m[32m                {previousKey && ([m
[32m+[m[32m                  <button onClick={() => setEditingField(previousKey)} className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}>[m
[32m+[m[32m                    ← Back[m
[32m+[m[32m                  </button>[m
[32m+[m[32m                )}[m
[32m+[m[32m              </div>[m
[32m+[m[32m              <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>[m
[32m+[m[32m                {questionQueue.map((q, i) => ([m
[32m+[m[32m                  <div key={q} style={{[m
[32m+[m[32m                    flex: 1, height: 4, borderRadius: 2,[m
[32m+[m[32m                    background: i < currentIndex ? 'var(--success)' : i === currentIndex ? 'var(--accent-primary)' : 'var(--border-soft)',[m
[32m+[m[32m                  }} />[m
[32m+[m[32m                ))}[m
[32m+[m[32m              </div>[m
[32m+[m[32m              {currentQuestion && branchReason[currentQuestion] && ([m
[32m+[m[32m                <div style={{[m
[32m+[m[32m                  display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,[m
[32m+[m[32m                  padding: '5px 10px', borderRadius: 'var(--radius-pill)',[m
[32m+[m[32m                  background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',[m
[32m+[m[32m                }}>[m
[32m+[m[32m                  <span style={{ fontSize: 11, color: 'var(--accent-primary)' }}>[m
[32m+[m[32m                    ✦ {branchReason[currentQuestion]}[m
[32m+[m[32m                  </span>[m
[32m+[m[32m                </div>[m
[32m+[m[32m              )}[m
[32m+[m[32m            </div>[m
[32m+[m[32m          )}[m
 [m
           {currentQuestion === 'incomeSource' && (<>[m
             <p className="section-title">How do you currently earn your income?</p>[m
[36m@@ -236,7 +307,7 @@[m [mexport default function AdaptiveProfilePage() {[m
           {currentQuestion === 'monthlyIncome' && (<>[m
             <p className="section-title">What is your average monthly income before deductions?</p>[m
             <p className="section-subtitle" style={{ marginTop: 4 }}>[m
[31m-              Enter your gross monthly amount. We use this to check the 3x income rule agents apply.[m
[32m+[m[32m              Enter your gross monthly amount. We use this to check the income-to-rent ratio agents look at.[m
             </p>[m
             <input[m
               value={incomeBuffer}[m
[36m@@ -381,6 +452,23 @@[m [mexport default function AdaptiveProfilePage() {[m
         </div>[m
       )}[m
 [m
[32m+[m[32m      <div className="card card-elevated">[m
[32m+[m[32m        <p className="label">Property market</p>[m
[32m+[m[32m        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>[m
[32m+[m[32m          {[[m
[32m+[m[32m            { label: 'Tracked',      value: String(properties.length) },[m
[32m+[m[32m            { label: 'Highest rent', value: `R${highestRent.toLocaleString()}` },[m
[32m+[m[32m            { label: 'Lowest rent',  value: `R${lowestRent.toLocaleString()}` },[m
[32m+[m[32m            { label: 'Average rent', value: `R${averageRent.toLocaleString()}` },[m
[32m+[m[32m          ].map(item => ([m
[32m+[m[32m            <div key={item.label} className="card-inner">[m
[32m+[m[32m              <p className="label">{item.label}</p>[m
[32m+[m[32m              <p className="section-title" style={{ marginTop: 6, fontSize: 17 }}>{item.value}</p>[m
[32m+[m[32m            </div>[m
[32m+[m[32m          ))}[m
[32m+[m[32m        </div>[m
[32m+[m[32m      </div>[m
[32m+[m
       {answeredItems.length > 0 && ([m
         <div className="card">[m
           <p className="label" style={{ marginBottom: 14 }}>Your answers</p>[m
[1mdiff --git a/apps/rentedge/app/unlock/page.tsx b/apps/rentedge/app/unlock/page.tsx[m
[1mindex 1753716..1c8da50 100644[m
[1m--- a/apps/rentedge/app/unlock/page.tsx[m
[1m+++ b/apps/rentedge/app/unlock/page.tsx[m
[36m@@ -1,9 +1,11 @@[m
 'use client'[m
 [m
[31m-import { useEffect, useMemo, useState } from 'react'[m
[32m+[m[32mimport { useEffect, useId, useMemo, useState } from 'react'[m
 import { useRouter } from 'next/navigation'[m
 import { evaluateProperty } from '@/lib/evaluation'[m
[32m+[m[32mimport { evaluateProperties } from '@/lib/evaluation/portfolio'[m
 import { evaluateUnlock } from '@/lib/evaluation/unlock'[m
[32m+[m[32mimport { getAffordabilityThresholds, getPropertyClass } from '@/lib/evaluation/helpers'[m
 import posthog from 'posthog-js'[m
 import PdfCaptureModal from './PdfCaptureModal'[m
 import PropertyHeader from './PropertyHeader'[m
[36m@@ -54,6 +56,40 @@[m [mfunction cleanTitle(value?: string) {[m
     .trim()[m
 }[m
 [m
[32m+[m[32m// Upfront costs shown on Overview. Deposit is estimated at 1.5x-2x rent[m
[32m+[m[32m// (typical local range), first month is the rent itself, admin fee is a[m
[32m+[m[32m// flat estimate since the profile doesn't currently capture a specific[m
[32m+[m[32m// agency's fee. The headline total uses the low end of each range with a[m
[32m+[m[32m// "+" suffix, since the true number depends on the specific landlord.[m
[32m+[m[32mfunction computeUpfrontCosts(rent: number) {[m
[32m+[m[32m  const depositLow = Math.round(rent * 1.5)[m
[32m+[m[32m  const depositHigh = rent * 2[m
[32m+[m[32m  const firstMonth = rent[m
[32m+[m[32m  const adminLow = 800[m
[32m+[m[32m  const adminHigh = 1200[m
[32m+[m[32m  const total = depositLow + firstMonth + adminLow[m
[32m+[m[32m  return { depositLow, depositHigh, firstMonth, adminLow, adminHigh, total }[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mconst FINANCIAL_STRENGTH_LABEL: Record<string, string> = {[m
[32m+[m[32m  strong: 'Strong',[m
[32m+[m[32m  stable: 'Stable',[m
[32m+[m[32m  stretched: 'Stretched',[m
[32m+[m[32m  pressured: 'Pressured',[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mconst FIT_LABEL: Record<string, string> = {[m
[32m+[m[32m  strong: 'Strong',[m
[32m+[m[32m  borderline: 'Competitive',[m
[32m+[m[32m  weak: 'Needs work',[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mconst FIT_COLOUR: Record<string, string> = {[m
[32m+[m[32m  strong: 'var(--success)',[m
[32m+[m[32m  borderline: 'var(--warning)',[m
[32m+[m[32m  weak: 'var(--danger)',[m
[32m+[m[32m}[m
[32m+[m
 // ── PDF payload helpers ─────────────────────────────────────[m
 // depositReadiness only ever holds these three exact strings from the[m
 // adaptive profile question — never a specific rand amount.[m
[36m@@ -66,9 +102,13 @@[m [mfunction mapDepositStatus(value: string): 'ready' | 'partial' | 'not-ready' {[m
 // guarantorSupport and referenceAvailability are status-only fields — no[m
 // contact details are captured anywhere in the profile — so these produce[m
 // plain status sentences rather than inventing contact info that isn't there.[m
[31m-function buildGuarantorText(value: string): string {[m
[31m-  if (value === 'Yes') return 'A guarantor is available if required.'[m
[31m-  if (value === 'Possibly') return 'Guarantor support may be available — happy to confirm if needed.'[m
[32m+[m[32m// Now reads the resolved status from renter.guarantorStatus (built once in[m
[32m+[m[32m// buildRenterProfile) instead of re-parsing the raw profile answer here —[m
[32m+[m[32m// previously this and the readiness engine could disagree on what[m
[32m+[m[32m// "Possibly" meant.[m
[32m+[m[32mfunction buildGuarantorText(status: 'yes' | 'possibly' | 'no'): string {[m
[32m+[m[32m  if (status === 'yes') return 'A guarantor is available if required.'[m
[32m+[m[32m  if (status === 'possibly') return 'Guarantor support may be available — happy to confirm if needed.'[m
   return 'No guarantor currently arranged.'[m
 }[m
 [m
[36m@@ -96,6 +136,29 @@[m [mfunction CopyBtn({ text, label = 'Copy introduction message' }: { text: string;[m
   )[m
 }[m
 [m
[32m+[m[32m// ── Affordability dial — real gauge, real ratio, used in the switcher and explorer ──[m
[32m+[m[32mfunction AffordabilityDial({ ratio, size = 70, highlight = false }: { ratio: number; size?: number; highlight?: boolean }) {[m
[32m+[m[32m  const gradientId = useId()[m
[32m+[m[32m  const clamped = Math.max(0, Math.min(ratio, 5))[m
[32m+[m[32m  const angle = (clamped / 5) * 180 - 90[m
[32m+[m[32m  const height = size * (40 / 70)[m
[32m+[m[32m  return ([m
[32m+[m[32m    <svg width={size} height={height} viewBox="0 0 70 40" role="img" aria-label={`Affordability dial, ${ratio.toFixed(1)} times rent`}>[m
[32m+[m[32m      <defs>[m
[32m+[m[32m        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">[m
[32m+[m[32m          <stop offset="0%" stopColor="#E24B4A" />[m
[32m+[m[32m          <stop offset="35%" stopColor="#EF9F27" />[m
[32m+[m[32m          <stop offset="65%" stopColor="#639922" />[m
[32m+[m[32m          <stop offset="100%" stopColor="#1D9E75" />[m
[32m+[m[32m        </linearGradient>[m
[32m+[m[32m      </defs>[m
[32m+[m[32m      <path d="M 5 35 A 30 30 0 0 1 65 35" fill="none" stroke={`url(#${gradientId})`} strokeWidth={highlight ? 6 : 5} strokeLinecap="round" />[m
[32m+[m[32m      <line x1="35" y1="35" x2="24" y2="14" stroke="#fff" strokeWidth={2} strokeLinecap="round" transform={`rotate(${angle} 35 35)`} />[m
[32m+[m[32m      <circle cx="35" cy="35" r="2.5" fill="#fff" />[m
[32m+[m[32m    </svg>[m
[32m+[m[32m  )[m
[32m+[m[32m}[m
[32m+[m
 // ── Focus item — collapsible, used on the Strategy tab ─────[m
 function FocusItem({ index, what, why, impact }: { index: number; what: string; why: string; impact: string }) {[m
   const [open, setOpen] = useState(false)[m
[36m@@ -312,6 +375,15 @@[m [mexport default function UnlockPage() {[m
   // payment, not just localStorage on the client.[m
   const [unlockState, setUnlockState] = useState<{ all: boolean; propertyIds: number[] }>({ all: false, propertyIds: [] })[m
 [m
[32m+[m[32m  // ── Explorer state ────────────────────────────────────[m
[32m+[m[32m  // Drives the "explore your affordability" section on Overview. Starts out[m
[32m+[m[32m  // null so it can be seeded from the real profile once it loads; every[m
[32m+[m[32m  // recalculation calls the real evaluateProperty/evaluateProperties[m
[32m+[m[32m  // functions with this hypothetical income instead of approximating the[m
[32m+[m[32m  // math client-side, so the numbers shown are always genuinely correct.[m
[32m+[m[32m  const [exploreIncome, setExploreIncome] = useState<number | null>(null)[m
[32m+[m[32m  const [exploreGuarantor, setExploreGuarantor] = useState(false)[m
[32m+[m
   useEffect(() => {[m
     const savedProfile    = JSON.parse(localStorage.getItem('rentedge_profile_answers') || 'null')[m
     const savedProperties = JSON.parse(localStorage.getItem('rentedge_properties') || '[]')[m
[36m@@ -331,6 +403,13 @@[m [mexport default function UnlockPage() {[m
     setReady(true)[m
   }, [])[m
 [m
[32m+[m[32m  useEffect(() => {[m
[32m+[m[32m    if (ready && profile && exploreIncome === null) {[m
[32m+[m[32m      setExploreIncome(Number(profile?.monthlyIncome || 0))[m
[32m+[m[32m      setExploreGuarantor(profile?.guarantorSupport === 'Yes')[m
[32m+[m[32m    }[m
[32m+[m[32m  }, [ready, profile, exploreIncome])[m
[32m+[m
   const persistUnlockState = (next: { all: boolean; propertyIds: number[] }) => {[m
     setUnlockState(next)[m
     localStorage.setItem('rentedge_unlock_state', JSON.stringify(next))[m
[36m@@ -445,18 +524,16 @@[m [mexport default function UnlockPage() {[m
   const income      = renter.income[m
   const ratio       = income > 0 && rent > 0 ? income / rent : 0[m
   const rentBurden  = income > 0 ? Math.round((rent / income) * 100) : 0[m
[31m-  const isSelfEmpl  = ['self', 'freelance', 'contract'].some(k =>[m
[31m-    (profile?.incomeSource || '').toLowerCase().includes(k))[m
 [m
[31m-  const posLabel =[m
[31m-    evaluation.fit === 'strong'     ? 'Strong'[m
[31m-    : evaluation.fit === 'borderline' ? 'Competitive'[m
[31m-    : 'Needs work'[m
[32m+[m[32m  // Now reads renter.employment directly instead of re-matching keywords[m
[32m+[m[32m  // against the raw profile.incomeSource — renter.employment is already[m
[32m+[m[32m  // normalized to "self-employed" for self-employed/freelance/contract by[m
[32m+[m[32m  // buildRenterProfile, so this now agrees with what the scoring engine[m
[32m+[m[32m  // (getFinancialRank / evaluatePressure) actually used.[m
[32m+[m[32m  const isSelfEmpl  = renter.employment === 'self-employed'[m
 [m
[31m-  const posColour =[m
[31m-    evaluation.fit === 'strong'     ? 'var(--success)'[m
[31m-    : evaluation.fit === 'borderline' ? 'var(--warning)'[m
[31m-    : 'var(--danger)'[m
[32m+[m[32m  const posLabel  = FIT_LABEL[evaluation.fit][m
[32m+[m[32m  const posColour = FIT_COLOUR[evaluation.fit][m
 [m
   const posBg =[m
     evaluation.fit === 'strong'     ? 'var(--success-soft)'[m
[36m@@ -474,11 +551,44 @@[m [mexport default function UnlockPage() {[m
     { doc: 'Certified ID copy',                                              done: !gaps.includes('ID Document') },[m
     { doc: isSelfEmpl ? '6 months bank statements' : '3 months bank statements', done: !gaps.includes('Bank Statements') },[m
     { doc: isSelfEmpl ? '6 months payslip