import { useState, useCallback, useRef, useEffect } from 'react'

type TeamResult = {
  name: string
  members: { name: string; role: string }[]
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const TEAM_COLORS = [
  'from-rose-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-purple-500',
  'from-red-500 to-rose-500',
  'from-sky-500 to-blue-500',
  'from-lime-500 to-green-500',
]

const TEAM_BG_COLORS = [
  'bg-rose-50 border-rose-200',
  'bg-blue-50 border-blue-200',
  'bg-emerald-50 border-emerald-200',
  'bg-amber-50 border-amber-200',
  'bg-violet-50 border-violet-200',
  'bg-red-50 border-red-200',
  'bg-sky-50 border-sky-200',
  'bg-lime-50 border-lime-200',
]

const ROLE_BADGE_COLORS = [
  'bg-rose-100 text-rose-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-red-100 text-red-700',
  'bg-sky-100 text-sky-700',
  'bg-lime-100 text-lime-700',
]

function SlotMachine({
  items,
  spinning,
  label,
}: {
  items: string[]
  finalIndex: number
  spinning: boolean
  label: string
}) {
  const [displayIndex, setDisplayIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (spinning && items.length > 0) {
      let speed = 50
      const tick = () => {
        setDisplayIndex((prev) => (prev + 1) % items.length)
        speed = Math.min(speed + 2, 200)
        intervalRef.current = setTimeout(tick, speed)
      }
      intervalRef.current = setTimeout(tick, speed)
      return () => {
        if (intervalRef.current) clearTimeout(intervalRef.current)
      }
    }
  }, [spinning, items])

  if (items.length === 0) return null

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-gray-400 mb-1">{label}</span>
      <div className="bg-white rounded-lg px-4 py-2 min-w-[120px] text-center overflow-hidden border border-gray-200 shadow-sm">
        <span
          className={`text-xl font-bold transition-all ${
            spinning ? 'text-pink-500 animate-pulse' : 'text-gray-800'
          }`}
        >
          {items[displayIndex] || '?'}
        </span>
      </div>
    </div>
  )
}

const STORAGE_KEY = 'roulette-inputs-v1'

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      names: typeof parsed.names === 'string' ? parsed.names : '',
      roles: typeof parsed.roles === 'string' ? parsed.roles : '',
      teamCount:
        typeof parsed.teamCount === 'number' && parsed.teamCount >= 1
          ? parsed.teamCount
          : 2,
    }
  } catch {
    return null
  }
}

function App() {
  const stored = loadStored()
  const [names, setNames] = useState(stored?.names ?? '')
  const [roles, setRoles] = useState(stored?.roles ?? '')
  const [teamCount, setTeamCount] = useState<number>(stored?.teamCount ?? 2)

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ names, roles, teamCount }),
      )
    } catch {
      // ignore quota / unavailable
    }
  }, [names, roles, teamCount])
  const [results, setResults] = useState<TeamResult[] | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [slotNames, setSlotNames] = useState<string[]>([])
  const [slotRoles, setSlotRoles] = useState<string[]>([])
  const resultRef = useRef<HTMLDivElement>(null)

  const parseList = (text: string) =>
    text
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

  const validate = useCallback(() => {
    const nameList = parseList(names)
    if (nameList.length === 0) return 'メンバーの名前を入力してください'
    if (teamCount < 1) return 'チーム数は1以上にしてください'
    if (teamCount > nameList.length)
      return 'チーム数がメンバー数を超えています'
    return null
  }, [names, teamCount])

  const handleSpin = useCallback(() => {
    const error = validate()
    if (error) {
      alert(error)
      return
    }

    const nameList = parseList(names)
    const roleList = parseList(roles)

    setSlotNames(nameList)
    setSlotRoles(roleList.length > 0 ? roleList : ['--'])
    setIsSpinning(true)
    setShowResults(false)
    setResults(null)

    setTimeout(() => {
      const shuffledNames = shuffle(nameList)

      const teams: TeamResult[] = Array.from({ length: teamCount }, (_, i) => ({
        name: `チーム ${i + 1}`,
        members: [],
      }))

      shuffledNames.forEach((name, i) => {
        const teamIdx = i % teamCount
        teams[teamIdx].members.push({ name, role: '' })
      })

      if (roleList.length > 0) {
        teams.forEach((team) => {
          const shuffledRoles = shuffle(roleList)
          team.members.forEach((member, idx) => {
            if (idx < shuffledRoles.length) {
              member.role = shuffledRoles[idx]
            }
          })
        })
      }

      setResults(teams)
      setIsSpinning(false)

      setTimeout(() => {
        setShowResults(true)
        setTimeout(() => {
          resultRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }, 100)
      }, 300)
    }, 2500)
  }, [names, roles, teamCount, validate])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-3">
            チーム分けルーレット
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            メンバーをランダムにチーム分け & 役割を割り当て
          </p>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Names Input */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              メンバー名
              <span className="text-gray-400 font-normal ml-1">
                (1行に1人)
              </span>
            </label>
            <textarea
              className="w-full h-44 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none resize-none transition-all"
              placeholder={`まるい\nいちかわ\nなかにし\nさかい\nにしうら\nみやざわ`}
              value={names}
              onChange={(e) => setNames(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-2">
              {parseList(names).length} 人
            </p>
          </div>

          {/* Roles Input */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              役割
              <span className="text-gray-400 font-normal ml-1">
                (1行に1役割 / 任意)
              </span>
            </label>
            <textarea
              className="w-full h-44 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none resize-none transition-all"
              placeholder={`ファシリテータ\n発表者\nスライド作り`}
              value={roles}
              onChange={(e) => setRoles(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-2">
              {parseList(roles).length} 役割
            </p>
          </div>

          {/* Team Count */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              チーム数
            </label>
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold text-gray-600 transition-colors disabled:opacity-30"
                onClick={() => setTeamCount((c) => Math.max(1, c - 1))}
                disabled={teamCount <= 1}
              >
                -
              </button>
              <span className="text-5xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent min-w-[60px] text-center">
                {teamCount}
              </span>
              <button
                className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold text-gray-600 transition-colors"
                onClick={() => setTeamCount((c) => c + 1)}
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">
              {parseList(names).length > 0 && teamCount > 0
                ? `約 ${Math.ceil(parseList(names).length / teamCount)} 人/チーム`
                : ''}
            </p>
          </div>
        </div>

        {/* Spin Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="group relative px-10 py-4 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-opacity group-hover:opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 text-white drop-shadow-md">
              {isSpinning ? 'シャッフル中...' : 'ルーレット スタート!'}
            </span>
          </button>
        </div>

        {/* Slot Machine Animation */}
        {isSpinning && (
          <div className="flex justify-center gap-6 mb-8 animate-bounce">
            <SlotMachine
              items={slotNames}
              finalIndex={0}
              spinning={isSpinning}
              label="メンバー"
            />
            <SlotMachine
              items={slotRoles}
              finalIndex={0}
              spinning={isSpinning}
              label="役割"
            />
          </div>
        )}

        {/* Results */}
        {results && (
          <div
            ref={resultRef}
            className={`transition-all duration-700 ${
              showResults
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">
              結果
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {results.map((team, teamIdx) => (
                <div
                  key={teamIdx}
                  className={`rounded-2xl border-2 p-5 transition-all duration-500 ${TEAM_BG_COLORS[teamIdx % TEAM_BG_COLORS.length]}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${TEAM_COLORS[teamIdx % TEAM_COLORS.length]} flex items-center justify-center font-bold text-white text-lg shadow-lg`}
                    >
                      {teamIdx + 1}
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {team.name}
                    </h3>
                    <span className="text-xs text-gray-400 ml-auto">
                      {team.members.length}人
                    </span>
                  </div>
                  <div className="space-y-2">
                    {team.members.map((member, memberIdx) => (
                      <div
                        key={memberIdx}
                        className="flex items-center justify-between bg-white/80 rounded-xl px-4 py-2.5 shadow-sm"
                      >
                        <span className="font-medium text-gray-700">
                          {member.name}
                        </span>
                        {member.role && (
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_BADGE_COLORS[teamIdx % ROLE_BADGE_COLORS.length]}`}
                          >
                            {member.role}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Re-spin button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={handleSpin}
                className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition-colors"
              >
                もう一回!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
