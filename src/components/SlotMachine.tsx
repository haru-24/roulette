import { useEffect, useRef, useState } from 'react'

type SlotMachineProps = {
  items: string[]
  spinning: boolean
  label: string
}

export function SlotMachine({ items, spinning, label }: SlotMachineProps) {
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
