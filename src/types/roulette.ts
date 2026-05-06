export type TeamMember = {
  name: string
  role: string
}

export type TeamResult = {
  name: string
  members: TeamMember[]
}

export type StoredInputs = {
  names: string
  roles: string
  teamCount: number
}
