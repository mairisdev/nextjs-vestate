import AgentsSectionClient from "./AgentsSectionClient"
import { getAgents } from "@/lib/queries/agents"

export default async function AgentsSectionServer() {
  const agents = await getAgents()
  return <AgentsSectionClient agents={agents} />
}
