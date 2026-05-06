import type { TeamResult } from '../types/roulette'
import { shuffle } from './random'
import { loadLastRoles, storeLastRoles } from './storage'

export function assignRolesToTeams(
  teams: TeamResult[],
  roleList: string[],
): TeamResult[] {
  if (roleList.length === 0) return teams

  const lastRoles = loadLastRoles()
  const nextLastRoles: Record<string, string> = { ...lastRoles }

  const updatedTeams = teams.map((team) => {
    const members = team.members.map((member) => ({ ...member, role: '' }))
    const availableRoles = shuffle(roleList)

    members.forEach((member) => {
      if (availableRoles.length === 0) return

      const prevRole = lastRoles[member.name]
      let pickIdx = 0
      if (prevRole) {
        const altIdx = availableRoles.findIndex((r) => r !== prevRole)
        if (altIdx !== -1) pickIdx = altIdx
      }

      const picked = availableRoles.splice(pickIdx, 1)[0]
      member.role = picked
      nextLastRoles[member.name] = picked
    })

    return { ...team, members }
  })

  storeLastRoles(nextLastRoles)
  return updatedTeams
}
