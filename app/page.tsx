"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import GameBoard from "@/components/game-board"
import GameModal from "@/components/game-modal"
import Confetti from "@/components/confetti"

// API URLs for Telegram integration
const WIN_API_URL = "https://f1b72b36-3050-4a60-adfc-52f5899cf7c7-00-2j0khoc516yme.picard.replit.dev/win"
const LOSE_API_URL = "https://f1b72b36-3050-4a60-adfc-52f5899cf7c7-00-2j0khoc516yme.picard.replit.dev/lose"

type Player = "❤️" | "⭐️" | null
type Board = Player[]
type GameStatus = "playing" | "win" | "lose" | "draw"
type Difficulty = "soft" | "smart" | "unbeatable"
type GameMode = "classic" | "relax" | "daily"

// Win patterns for 3x3
const winPatterns3x3 = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

// Win patterns for 4x4 (need 4 in a row)
const winPatterns4x4 = [
  // Rows
  [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
  // Columns
  [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
  // Diagonals
  [0, 5, 10, 15], [3, 6, 9, 12],
]

// Seeded random number generator for Daily Challenge
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function getDailySeed(): number {
  const today = new Date()
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
}

function generatePromoCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString()
}

function getWinPatterns(mode: GameMode): number[][] {
  return mode === "relax" ? winPatterns4x4 : winPatterns3x3
}

function getBoardSize(mode: GameMode): number {
  return mode === "relax" ? 16 : 9
}

function checkWinner(board: Board, player: Player, mode: GameMode): boolean {
  const patterns = getWinPatterns(mode)
  return patterns.some((pattern) => pattern.every((index) => board[index] === player))
}

function getWinningLine(board: Board, player: Player, mode: GameMode): number[] | null {
  const patterns = getWinPatterns(mode)
  for (const pattern of patterns) {
    if (pattern.every((index) => board[index] === player)) {
      return pattern
    }
  }
  return null
}

function getEmptyCells(board: Board): number[] {
  return board.map((cell, index) => (cell === null ? index : -1)).filter((index) => index !== -1)
}

// Minimax algorithm for unbeatable AI (3x3 only, too slow for 4x4)
function minimax(board: Board, depth: number, isMaximizing: boolean, mode: GameMode): number {
  if (checkWinner(board, "⭐️", mode)) return 10 - depth
  if (checkWinner(board, "❤️", mode)) return depth - 10
  if (getEmptyCells(board).length === 0) return 0

  const emptyCells = getEmptyCells(board)

  if (isMaximizing) {
    let bestScore = -Infinity
    for (const cell of emptyCells) {
      board[cell] = "⭐️"
      const score = minimax(board, depth + 1, false, mode)
      board[cell] = null
      bestScore = Math.max(score, bestScore)
    }
    return bestScore
  } else {
    let bestScore = Infinity
    for (const cell of emptyCells) {
      board[cell] = "❤️"
      const score = minimax(board, depth + 1, true, mode)
      board[cell] = null
      bestScore = Math.min(score, bestScore)
    }
    return bestScore
  }
}

function getBestMove(board: Board, mode: GameMode): number {
  const emptyCells = getEmptyCells(board)
  
  // For 4x4, use heuristic instead of full minimax (too slow)
  if (mode === "relax") {
    return getSmartMove4x4(board, mode)
  }
  
  let bestScore = -Infinity
  let bestMove = -1

  for (const cell of emptyCells) {
    board[cell] = "⭐️"
    const score = minimax(board, 0, false, mode)
    board[cell] = null
    if (score > bestScore) {
      bestScore = score
      bestMove = cell
    }
  }
  return bestMove
}

function getSmartMove4x4(board: Board, mode: GameMode): number {
  const emptyCells = getEmptyCells(board)
  const patterns = getWinPatterns(mode)
  
  // Check if AI can win
  for (const cell of emptyCells) {
    board[cell] = "⭐️"
    if (checkWinner(board, "⭐️", mode)) {
      board[cell] = null
      return cell
    }
    board[cell] = null
  }
  
  // Block player's winning move
  for (const cell of emptyCells) {
    board[cell] = "❤️"
    if (checkWinner(board, "❤️", mode)) {
      board[cell] = null
      return cell
    }
    board[cell] = null
  }
  
  // Prefer center positions
  const centerCells = [5, 6, 9, 10].filter(c => emptyCells.includes(c))
  if (centerCells.length > 0) {
    return centerCells[Math.floor(Math.random() * centerCells.length)]
  }
  
  return emptyCells[Math.floor(Math.random() * emptyCells.length)]
}

function getSmartMove(board: Board, mode: GameMode): number {
  if (Math.random() < 0.7) {
    return getBestMove(board, mode)
  }
  const emptyCells = getEmptyCells(board)
  return emptyCells[Math.floor(Math.random() * emptyCells.length)]
}

function getSoftMove(board: Board, mode: GameMode): number {
  const emptyCells = getEmptyCells(board)
  
  if (Math.random() < 0.4) {
    for (const cell of emptyCells) {
      board[cell] = "❤️"
      if (checkWinner(board, "❤️", mode)) {
        board[cell] = null
        return cell
      }
      board[cell] = null
    }
  }
  
  return emptyCells[Math.floor(Math.random() * emptyCells.length)]
}

function getDailyMove(board: Board, mode: GameMode, moveCount: number): number {
  const emptyCells = getEmptyCells(board)
  const seed = getDailySeed() + moveCount
  const randomIndex = Math.floor(seededRandom(seed) * emptyCells.length)
  return emptyCells[randomIndex]
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [playerScore, setPlayerScore] = useState(0)
  const [computerScore, setComputerScore] = useState(0)
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing")
  const [promoCode, setPromoCode] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>("soft")
  const [gameMode, setGameMode] = useState<GameMode>("classic")
  const [gameStarted, setGameStarted] = useState(false)
  const [moveCount, setMoveCount] = useState(0)
  const [winningCells, setWinningCells] = useState<number[]>([])
  const [losingCells, setLosingCells] = useState<number[]>([])
  const [showHelp, setShowHelp] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [showAccessibility, setShowAccessibility] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedDifficulty = localStorage.getItem("ticTacToeDifficulty") as Difficulty | null
    if (savedDifficulty && ["soft", "smart", "unbeatable"].includes(savedDifficulty)) {
      setDifficulty(savedDifficulty)
    }
    const savedMode = localStorage.getItem("ticTacToeGameMode") as GameMode | null
    if (savedMode && ["classic", "relax", "daily"].includes(savedMode)) {
      setGameMode(savedMode)
    }
    const savedHighContrast = localStorage.getItem("ticTacToeHighContrast")
    if (savedHighContrast === "true") {
      setHighContrast(true)
    }
    const savedReducedMotion = localStorage.getItem("ticTacToeReducedMotion")
    if (savedReducedMotion === "true") {
      setReducedMotion(true)
    }
    // Also check system preference for reduced motion
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReducedMotion(true)
    }
  }, [])

  const toggleHighContrast = () => {
    const newValue = !highContrast
    setHighContrast(newValue)
    localStorage.setItem("ticTacToeHighContrast", String(newValue))
  }

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion
    setReducedMotion(newValue)
    localStorage.setItem("ticTacToeReducedMotion", String(newValue))
  }

  // Save difficulty to localStorage when changed
  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty)
    localStorage.setItem("ticTacToeDifficulty", newDifficulty)
  }

  // Save game mode to localStorage when changed
  const handleGameModeChange = (newMode: GameMode) => {
    setGameMode(newMode)
    localStorage.setItem("ticTacToeGameMode", newMode)
  }

  const startGame = () => {
    const size = getBoardSize(gameMode)
    setBoard(Array(size).fill(null))
    setMoveCount(0)
    setGameStarted(true)
  }

  const sendToAPI = async (result: "win" | "lose", code?: string) => {
    try {
      if (result === "win") {
        const promoCodeToSend = code || generatePromoCode()
        await fetch(`${WIN_API_URL}?code=${promoCodeToSend}`)
      } else if (result === "lose") {
        await fetch(LOSE_API_URL)
      }
    } catch (error) {
      // Game continues even if API fails
    }
  }

  const computerMove = useCallback(
    (currentBoard: Board, currentMoveCount: number) => {
      const emptyCells = getEmptyCells(currentBoard)
      if (emptyCells.length === 0) return

      // Start thinking state
      setIsAIThinking(true)

      // Human-like delay before AI makes its move (500-700ms)
      const thinkingDelay = 500 + Math.random() * 200

      setTimeout(() => {
        const boardCopy = [...currentBoard]
        let moveIndex: number

        // Daily mode uses seeded random for consistent gameplay
        if (gameMode === "daily") {
          moveIndex = getDailyMove(boardCopy, gameMode, currentMoveCount)
        } else {
          switch (difficulty) {
            case "unbeatable":
              moveIndex = getBestMove(boardCopy, gameMode)
              break
            case "smart":
              moveIndex = getSmartMove(boardCopy, gameMode)
              break
            case "soft":
            default:
              moveIndex = getSoftMove(boardCopy, gameMode)
              break
          }
        }

        const newBoard = [...currentBoard]
        newBoard[moveIndex] = "⭐️"

        setBoard(newBoard)
        setMoveCount((prev) => prev + 1)
        setIsAIThinking(false)

        if (checkWinner(newBoard, "⭐️", gameMode)) {
          const line = getWinningLine(newBoard, "⭐️", gameMode)
          setLosingCells(line || [])
          setGameStatus("lose")
          setComputerScore((prev) => prev + 1)
          sendToAPI("lose")
        } else if (getEmptyCells(newBoard).length === 0) {
          setGameStatus("draw")
        } else {
          setIsPlayerTurn(true)
        }
      }, thinkingDelay)
    },
    [difficulty, gameMode],
  )

  const handleCellClick = (index: number) => {
    if (board[index] || !isPlayerTurn || gameStatus !== "playing") return

    const newBoard = [...board]
    newBoard[index] = "❤️"
    setBoard(newBoard)
    const newMoveCount = moveCount + 1
    setMoveCount(newMoveCount)

    if (checkWinner(newBoard, "❤️", gameMode)) {
      const code = generatePromoCode()
      const line = getWinningLine(newBoard, "❤️", gameMode)
      setWinningCells(line || [])
      setPromoCode(code)
      setGameStatus("win")
      setPlayerScore((prev) => prev + 1)
      setShowConfetti(true)
      sendToAPI("win", code)
    } else if (getEmptyCells(newBoard).length === 0) {
      setGameStatus("draw")
    } else {
      setIsPlayerTurn(false)
      computerMove(newBoard, newMoveCount)
    }
  }

  const resetGame = () => {
    const size = getBoardSize(gameMode)
    setBoard(Array(size).fill(null))
    setIsPlayerTurn(true)
    setGameStatus("playing")
    setShowConfetti(false)
    setPromoCode("")
    setMoveCount(0)
    setWinningCells([])
    setLosingCells([])
    setIsAIThinking(false)
  }

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])

  // Start Screen
  if (!gameStarted) {
    return (
      <main className="min-h-screen animated-gradient-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-gray-700 tracking-wide">Tic Tac Toe</h1>
            <div className="flex justify-center gap-2 mb-4">
              <span className="text-pink-400 text-2xl">✿</span>
              <span className="text-purple-300 text-2xl">❀</span>
              <span className="text-pink-300 text-2xl">✿</span>
            </div>
            <p className="text-gray-500 text-base font-sans font-light">Elegant and Playful</p>
          </div>

          {/* Game Mode Selector Card */}
          <Card className="glass-card border-0 rounded-3xl">
            <CardContent className="py-6 px-6">
              <p className="text-center text-gray-600 text-lg mb-4 font-sans font-light">Mode</p>
              <div className="flex rounded-2xl bg-gray-100/80 p-1.5">
                <button
                  onClick={() => handleGameModeChange("classic")}
                  className={`flex-1 py-3 px-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    gameMode === "classic"
                      ? "bg-gradient-to-r from-pink-300 to-pink-400 text-white shadow-lg"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Classic
                </button>
                <button
                  onClick={() => handleGameModeChange("relax")}
                  className={`flex-1 py-3 px-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    gameMode === "relax"
                      ? "bg-gradient-to-r from-purple-300 to-purple-400 text-white shadow-lg"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Relax
                </button>
                <button
                  onClick={() => handleGameModeChange("daily")}
                  className={`flex-1 py-3 px-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    gameMode === "daily"
                      ? "bg-gradient-to-r from-amber-300 to-amber-400 text-white shadow-lg"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Daily
                </button>
              </div>

              {/* Game Mode Description */}
              <p className="text-center text-gray-400 text-sm mt-3 font-light">
                {gameMode === "classic" && "3x3 grid, three in a row"}
                {gameMode === "relax" && "4x4 grid, four in a row"}
                {gameMode === "daily" && "Same challenge for everyone today"}
              </p>
            </CardContent>
          </Card>

          {/* Difficulty Selector Card (hidden for daily mode) */}
          {gameMode !== "daily" && (
            <Card className="glass-card border-0 rounded-3xl">
              <CardContent className="py-6 px-6">
                <p className="text-center text-gray-600 text-lg mb-4 font-sans font-light">Level</p>
                <div className="flex rounded-2xl bg-gray-100/80 p-1.5">
                  <button
                    onClick={() => handleDifficultyChange("soft")}
                    className={`flex-1 py-3 px-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      difficulty === "soft"
                        ? "bg-gradient-to-r from-pink-300 to-pink-400 text-white shadow-lg"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Playful
                  </button>
                  <button
                    onClick={() => handleDifficultyChange("smart")}
                    className={`flex-1 py-3 px-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      difficulty === "smart"
                        ? "bg-gradient-to-r from-purple-300 to-purple-400 text-white shadow-lg"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Smart
                  </button>
                  <button
                    onClick={() => handleDifficultyChange("unbeatable")}
                    className={`flex-1 py-3 px-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      difficulty === "unbeatable"
                        ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-lg"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Expert
                  </button>
                </div>

                {/* Difficulty Description */}
                <p className="text-center text-gray-400 text-sm mt-3 font-light">
                  {difficulty === "soft" && "Makes human-like mistakes"}
                  {difficulty === "smart" && "Minimax with randomness"}
                  {difficulty === "unbeatable" && "Pure minimax, unbeatable"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Start Game Button */}
          <Button
            onClick={startGame}
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-medium text-xl shadow-xl shadow-pink-200/50 border-0 transition-all duration-300 hover:scale-[1.02]"
          >
            Start Game
          </Button>
        </div>
      </main>
    )
  }

  const goToSetup = () => {
    setGameStarted(false)
    setBoard(Array(getBoardSize(gameMode)).fill(null))
    setIsPlayerTurn(true)
    setGameStatus("playing")
    setShowConfetti(false)
    setPromoCode("")
    setMoveCount(0)
    setWinningCells([])
    setLosingCells([])
    setShowHelp(false)
    setIsAIThinking(false)
  }

  return (
    <main className={`min-h-screen max-h-screen overflow-hidden flex items-center justify-center p-4 relative ${reducedMotion ? "bg-gradient-to-br from-[#FFE6E6] via-[#F5E6FF] to-[#E6FFE6]" : "animated-gradient-bg"}`}>
      {showConfetti && !reducedMotion && <Confetti />}

      {/* Restart Button - arrow only */}
      <button
        onClick={goToSetup}
        className="absolute top-3 left-3 w-9 h-9 flex items-center justify-center rounded-full glass-card text-gray-500 hover:text-pink-400 font-sans text-lg transition-all duration-300 hover:scale-105 shadow-md z-50"
        aria-label="Back to settings"
      >
        <span>←</span>
      </button>

      <div className="w-full max-w-md space-y-4 md:space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl md:text-4xl font-serif font-medium text-gray-700 tracking-wide">Tic Tac Toe</h1>
          <div className="flex justify-center gap-2 pt-1">
            <span className="text-pink-400 text-sm md:text-base">✿</span>
            <span className="text-purple-300 text-sm md:text-base">❀</span>
            <span className="text-pink-300 text-sm md:text-base">✿</span>
          </div>
          <p className="text-gray-500 text-xs md:text-sm font-sans font-light">
            {gameMode === "classic" && "Classic 3x3"}
            {gameMode === "relax" && "Relax 4x4"}
            {gameMode === "daily" && "Daily Challenge"}
            {gameMode !== "daily" && ` · ${difficulty === "soft" ? "Playful" : difficulty === "smart" ? "Smart" : "Expert"}`}
          </p>
        </div>

        {/* Score Card */}
        <Card className="glass-card border-0 rounded-2xl md:rounded-3xl">
          <CardContent className="py-2 md:py-4">
            <div className="flex items-center justify-center gap-4 md:gap-6 text-base md:text-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl">❤️</span>
                <span className="text-gray-600 font-mono font-bold text-lg md:text-xl">{playerScore}</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-mono font-bold text-lg md:text-xl">{computerScore}</span>
                <span className="text-xl md:text-2xl">⭐️</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <div className="text-center">
          <p className="text-gray-600 font-sans font-light text-base md:text-lg">
            {gameStatus === "playing" && (isPlayerTurn ? "Your turn ❤️" : "Computer thinking... ⭐️")}
          </p>
        </div>

        {/* Game Board */}
        <GameBoard 
          board={board} 
          onCellClick={handleCellClick} 
          disabled={!isPlayerTurn || gameStatus !== "playing" || isAIThinking} 
          winningCells={winningCells}
          losingCells={losingCells}
          highContrast={highContrast}
          reducedMotion={reducedMotion}
        />

        {/* New Game Button */}
        <Button
          onClick={resetGame}
          className="w-full h-12 md:h-14 rounded-2xl bg-gradient-to-r from-pink-300 to-pink-400 hover:from-pink-400 hover:to-pink-500 text-white font-medium text-base md:text-lg shadow-lg shadow-pink-200/50 border-0 transition-all duration-300 hover:scale-[1.02]"
        >
          New Game
        </Button>
      </div>

      {/* Floating Help Button - bottom right */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="absolute bottom-3 right-3 w-9 h-9 md:w-10 md:h-10 rounded-full glass-card flex items-center justify-center text-gray-500 hover:text-pink-400 transition-all duration-300 hover:scale-110 shadow-lg z-50"
        aria-label="Help"
      >
        <span className="text-base md:text-lg font-serif">?</span>
      </button>

      {/* Help Tooltip */}
      {showHelp && (
        <div className="absolute bottom-14 right-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="glass-card rounded-2xl p-3 md:p-4 max-w-[200px] md:max-w-[220px] shadow-xl">
            <p className="font-serif text-gray-700 text-sm font-medium mb-2">How to play</p>
            <ul className="space-y-1.5 text-xs md:text-sm text-gray-600 font-sans">
              <li className="flex items-start gap-2">
                <span>❤️</span>
                <span>Tap to place your move</span>
              </li>
              <li className="flex items-start gap-2">
                <span>⭐</span>
                <span>Computer responds automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✨</span>
                <span>3/4 in a row wins</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Accessibility Button - top right */}
      <button
        onClick={() => setShowAccessibility(!showAccessibility)}
        className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full glass-card text-gray-500 hover:text-pink-400 font-sans transition-all duration-300 hover:scale-105 shadow-md z-50"
        aria-label="Accessibility settings"
        aria-expanded={showAccessibility}
      >
        <span className="text-lg">&#9881;</span>
      </button>

      {/* Accessibility Panel */}
      {showAccessibility && (
        <div className="absolute top-14 right-3 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="glass-card rounded-2xl p-3 md:p-4 w-[220px] md:w-[240px] shadow-xl">
            <p className="font-serif text-gray-700 text-sm font-medium mb-3">Settings</p>
            <div className="space-y-4">
              <div>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs md:text-sm text-gray-600 font-sans">High contrast</span>
                  <button
                    onClick={toggleHighContrast}
                    role="switch"
                    aria-checked={highContrast}
                    className={`w-10 h-5 rounded-full transition-colors duration-200 ${
                      highContrast ? "bg-pink-400" : "bg-gray-300"
                    }`}
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
                      highContrast ? "translate-x-5" : "translate-x-0.5"
                    }`} />
                  </button>
                </label>
                <p className="text-[10px] text-gray-400 mt-1">Brighter colors for visibility</p>
              </div>
              <div>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs md:text-sm text-gray-600 font-sans">Reduced motion</span>
                  <button
                    onClick={toggleReducedMotion}
                    role="switch"
                    aria-checked={reducedMotion}
                    className={`w-10 h-5 rounded-full transition-colors duration-200 ${
                      reducedMotion ? "bg-pink-400" : "bg-gray-300"
                    }`}
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
                      reducedMotion ? "translate-x-5" : "translate-x-0.5"
                    }`} />
                  </button>
                </label>
                <p className="text-[10px] text-gray-400 mt-1">Stops background animation, confetti, and tile effects</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Result Modals */}
      <GameModal isOpen={gameStatus === "win"} type="win" promoCode={promoCode} onClose={resetGame} />
      <GameModal isOpen={gameStatus === "lose"} type="lose" onClose={resetGame} />
      <GameModal isOpen={gameStatus === "draw"} type="draw" onClose={resetGame} />
    </main>
  )
}
