import AgentCapture from './AgentCapture'

// Next.js 15+ resolves dynamic route params asynchronously — this stays a
// server component just to unwrap that Promise, then hands a plain string
// down to the client component that actually does the capture + redirect.
export default async function AgentReferralPage({
  params,
}: {
  params: Promise<{ agent: string }>
}) {
  const { agent } = await params
  return <AgentCapture agentSlug={agent} />
}
