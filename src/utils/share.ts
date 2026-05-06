import type { TeamResult } from '../types/roulette'

export function toShareText(teams: TeamResult[]): string {
  return teams
    .map((team) => {
      const members = team.members
        .map((member) => `- ${member.name}${member.role ? `（${member.role}）` : ''}`)
        .join('\n')
      return `${team.name}\n${members}`
    })
    .join('\n\n')
}

export function buildResultImage(teams: TeamResult[]): HTMLCanvasElement {
  const width = 1200
  const padding = 48
  const headerHeight = 80
  const teamTitleHeight = 36
  const lineHeight = 34
  const teamGap = 24

  const totalLines = teams.reduce((sum, team) => sum + team.members.length, 0)
  const height =
    padding * 2 +
    headerHeight +
    teams.length * teamTitleHeight +
    totalLines * lineHeight +
    Math.max(0, teams.length - 1) * teamGap

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = Math.max(height, 500)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas context unavailable')

  ctx.fillStyle = '#f9fafb'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#111827'
  ctx.font = 'bold 42px sans-serif'
  ctx.fillText('チーム分け結果', padding, padding + 40)

  ctx.fillStyle = '#6b7280'
  ctx.font = '24px sans-serif'
  ctx.fillText(new Date().toLocaleString('ja-JP'), padding, padding + 74)

  let y = padding + headerHeight + 24

  teams.forEach((team) => {
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 30px sans-serif'
    ctx.fillText(team.name, padding, y)
    y += teamTitleHeight

    team.members.forEach((member) => {
      ctx.fillStyle = '#374151'
      ctx.font = '24px sans-serif'
      const roleText = member.role ? `（${member.role}）` : ''
      ctx.fillText(`・${member.name}${roleText}`, padding + 16, y)
      y += lineHeight
    })

    y += teamGap
  })

  return canvas
}
