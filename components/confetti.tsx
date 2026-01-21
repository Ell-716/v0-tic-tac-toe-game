"use client"

import { useEffect, useState } from "react"

interface ConfettiPiece {
  id: number
  x: number
  delay: number
  duration: number
  color: string
  size: number
}

const colors = ["#FFB6C1", "#E6E6FA", "#98FB98", "#FFD700", "#FFC0CB", "#DDA0DD"]

export default function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 8 + Math.random() * 8,
    }))
    setPieces(newPieces)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[100]">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.x}%`,
            top: "-20px",
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        >
          <div
            className="rounded-sm animate-spin"
            style={{
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              animationDuration: `${0.5 + Math.random()}s`,
            }}
          />
        </div>
      ))}
    </div>
  )
}
