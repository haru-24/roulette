import type { RefObject } from 'react'
import {
  ROLE_BADGE_COLORS,
  TEAM_BG_COLORS,
  TEAM_COLORS,
} from '../constants/colors'
import type { TeamResult } from '../types/roulette'

type ResultsSectionProps = {
  results: TeamResult[]
  showResults: boolean
  shareStatus: string
  onRerollRoles: () => void
  onCopyResults: () => void
  onDownloadImage: () => void
  onSpinAgain: () => void
  resultRef: RefObject<HTMLDivElement | null>
}

export function ResultsSection({
  results,
  showResults,
  shareStatus,
  onRerollRoles,
  onCopyResults,
  onDownloadImage,
  onSpinAgain,
  resultRef,
}: ResultsSectionProps) {
  return (
    <div
      ref={resultRef}
      className={`transition-all duration-700 ${
        showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">結果</h2>
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
              <h3 className="font-bold text-lg text-gray-800">{team.name}</h3>
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
                  <span className="font-medium text-gray-700">{member.name}</span>
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

      <div className="flex flex-wrap justify-center gap-3 mt-8">
        <button
          onClick={onRerollRoles}
          className="px-6 py-3 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold transition-colors"
        >
          役割だけ再抽選
        </button>
        <button
          onClick={onCopyResults}
          className="px-6 py-3 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-700 font-semibold transition-colors"
        >
          結果をコピー
        </button>
        <button
          onClick={onDownloadImage}
          className="px-6 py-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold transition-colors"
        >
          画像で保存
        </button>
        <button
          onClick={onSpinAgain}
          className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition-colors"
        >
          もう一回!
        </button>
      </div>
      {shareStatus && (
        <p className="text-center text-sm text-gray-500 mt-3">{shareStatus}</p>
      )}
    </div>
  )
}
