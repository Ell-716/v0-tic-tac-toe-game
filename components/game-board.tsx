"use client"

type Player = "❤️" | "⭐️" | null

interface GameBoardProps {
  board: Player[]
  onCellClick: (index: number) => void
  disabled: boolean
  winningCells?: number[]
  losingCells?: number[]
  highContrast?: boolean
  reducedMotion?: boolean
}

function getCellColor(index: number, highContrast: boolean): string {
  if (highContrast) {
    // Brighter pastels for high contrast - pink, lavender, mint
    const colors = ["#FFD1D1", "#E0D1FF", "#D1FFE0"]
    return colors[index % colors.length]
  }
  const colors = ["#FFF0F0", "#F0F0FF", "#F0FFF0"]
  return colors[index % colors.length]
}

function getHighContrastWinColor(): string {
  // Brighter pink for win
  return "#FFB8D0"
}

function getHighContrastLoseColor(): string {
  // Brighter lavender for lose
  return "#D8B8FF"
}

// Trigger haptic feedback on mobile devices
function triggerHaptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(10)
  }
}

// Get row and column from index for ARIA label
function getCellPosition(index: number, gridSize: number): { row: number; col: number } {
  return {
    row: Math.floor(index / gridSize) + 1,
    col: (index % gridSize) + 1
  }
}

function getCellAriaLabel(cell: Player, index: number, gridSize: number, disabled: boolean): string {
  const { row, col } = getCellPosition(index, gridSize)
  const position = `Row ${row}, Column ${col}`
  
  if (cell === "❤️") {
    return `${position}: Your heart`
  } else if (cell === "⭐️") {
    return `${position}: Computer star`
  } else if (disabled) {
    return `${position}: Empty, waiting`
  } else {
    return `${position}: Empty, tap to place your heart`
  }
}

export default function GameBoard({ 
  board, 
  onCellClick, 
  disabled, 
  winningCells = [], 
  losingCells = [],
  highContrast = false,
  reducedMotion = false
}: GameBoardProps) {
  const gridSize = board.length === 16 ? 4 : 3
  const is4x4 = gridSize === 4
  
  const isWinningCell = (index: number) => winningCells.includes(index)
  const isLosingCell = (index: number) => losingCells.includes(index)

  const handleCellClick = (index: number) => {
    triggerHaptic()
    onCellClick(index)
  }

  return (
    <div 
      role="grid"
      aria-label={`Tic Tac Toe ${gridSize}x${gridSize} game board`}
      className={`glass-card grid gap-2 md:gap-3 p-3 md:p-4 rounded-3xl ${
        is4x4 ? "grid-cols-4" : "grid-cols-3"
      }`}
    >
      {board.map((cell, index) => (
        <button
          key={index}
          role="gridcell"
          aria-label={getCellAriaLabel(cell, index, gridSize, disabled)}
          aria-disabled={disabled || cell !== null}
          onClick={() => handleCellClick(index)}
          disabled={disabled || cell !== null}
          className={`
            ${reducedMotion ? "" : "tile-interactive"}
            aspect-square rounded-xl md:rounded-2xl
            flex items-center justify-center
            border border-white/60
            disabled:cursor-default
            ${is4x4 ? "text-2xl md:text-3xl" : "text-4xl md:text-5xl"}
            ${!reducedMotion && isWinningCell(index) ? "animate-winning-glow scale-110 z-10" : ""}
            ${!reducedMotion && isLosingCell(index) ? "animate-losing-fade opacity-70" : ""}
            ${reducedMotion && isWinningCell(index) ? "scale-105 z-10" : ""}
            ${reducedMotion && isLosingCell(index) ? "opacity-70" : ""}
            ${!cell && !disabled ? "cursor-pointer" : ""}
            ${highContrast ? "font-bold" : ""}
          `}
          style={{
            backgroundColor: isWinningCell(index) 
              ? (highContrast ? getHighContrastWinColor() : "#FFE0EC")
              : isLosingCell(index) 
                ? (highContrast ? getHighContrastLoseColor() : "#F0E6FF")
                : getCellColor(index, highContrast),
            boxShadow: highContrast 
              ? "none" 
              : isWinningCell(index) 
                ? "0 0 20px rgba(255, 182, 193, 0.8), 0 0 40px rgba(255, 182, 193, 0.4)" 
                : "0 2px 8px rgba(255, 182, 193, 0.15)",
          }}
        >
          <span
            className={`
            ${reducedMotion ? "" : "transition-all duration-300"}
            ${cell ? "scale-100 opacity-100" : "scale-0 opacity-0"}
            ${!reducedMotion && isWinningCell(index) ? "animate-pulse" : ""}
          `}
          >
            {cell}
          </span>
        </button>
      ))}
    </div>
  )
}
