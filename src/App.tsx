import { useState, useCallback, useRef, useEffect } from 'react'
import { ResultsSection } from './components/ResultsSection'
import { SlotMachine } from './components/SlotMachine'
import type { TeamResult } from './types/roulette'
import { parseList } from './utils/list'
import { shuffle } from './utils/random'
import { assignRolesToTeams } from './utils/roles'
import { buildResultImage, toShareText } from './utils/share'
import { loadStoredInputs, storeInputs } from './utils/storage'

function App() {
  const stored = loadStoredInputs()
  const [names, setNames] = useState(stored?.names ?? '')
  const [roles, setRoles] = useState(stored?.roles ?? '')
  const [teamCount, setTeamCount] = useState<number>(stored?.teamCount ?? 2)

  useEffect(() => {
    storeInputs({ names, roles, teamCount })
  }, [names, roles, teamCount])
  const [results, setResults] = useState<TeamResult[] | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [slotNames, setSlotNames] = useState<string[]>([])
  const [slotRoles, setSlotRoles] = useState<string[]>([])
  const [shareStatus, setShareStatus] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)

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

      const withRoles = assignRolesToTeams(teams, roleList)
      setResults(withRoles)
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

  const handleRerollRoles = useCallback(() => {
    if (!results) return
    const roleList = parseList(roles)
    if (roleList.length === 0) {
      alert('役割が未入力です')
      return
    }
    const next = assignRolesToTeams(results, roleList)
    setResults(next)
    setShareStatus('役割だけ再抽選しました')
  }, [results, roles])

  const handleCopyResults = useCallback(async () => {
    if (!results) return
    const text = toShareText(results)
    try {
      await navigator.clipboard.writeText(text)
      setShareStatus('結果をコピーしました')
    } catch {
      alert('コピーに失敗しました')
    }
  }, [results, toShareText])

  const handleDownloadImage = useCallback(async () => {
    try {
      if (!results) return
      const canvas = buildResultImage(results)
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `roulette-result-${Date.now()}.png`
      link.click()
      setShareStatus('画像を保存しました')
    } catch {
      alert('画像の作成に失敗しました（別ブラウザで再試行してください）')
    }
  }, [results])

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
              spinning={isSpinning}
              label="メンバー"
            />
            <SlotMachine
              items={slotRoles}
              spinning={isSpinning}
              label="役割"
            />
          </div>
        )}

        {/* Results */}
        {results && (
          <ResultsSection
            results={results}
            showResults={showResults}
            shareStatus={shareStatus}
            onRerollRoles={handleRerollRoles}
            onCopyResults={handleCopyResults}
            onDownloadImage={handleDownloadImage}
            onSpinAgain={handleSpin}
            resultRef={resultRef}
          />
        )}
      </div>
    </div>
  )
}

export default App
