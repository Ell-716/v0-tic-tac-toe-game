"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Copy } from "lucide-react"

interface GameModalProps {
  isOpen: boolean
  type: "win" | "lose" | "draw"
  promoCode?: string
  onClose: () => void
}

export default function GameModal({ isOpen, type, promoCode, onClose }: GameModalProps) {
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    if (promoCode) {
      await navigator.clipboard.writeText(promoCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <Card className="w-full max-w-sm bg-white/95 backdrop-blur border-0 shadow-2xl shadow-pink-200/30 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        <CardContent className="p-8 text-center space-y-6">
          {type === "win" && (
            <>
              <div className="space-y-3">
                <div className="text-5xl animate-bounce">✨</div>
                <h2 className="text-2xl font-medium text-gray-700">You're glowing today</h2>
                <p className="text-gray-500 text-sm">Brilliant move, beautiful win</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Your reward</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="px-6 py-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-100">
                    <span className="text-2xl font-mono font-semibold text-gray-700 tracking-widest">{promoCode}</span>
                  </div>
                  <Button
                    onClick={copyCode}
                    variant="outline"
                    size="icon"
                    className="rounded-xl border-pink-200 hover:bg-pink-50 h-12 w-12 bg-transparent"
                  >
                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-gray-400" />}
                  </Button>
                </div>
                {copied && <p className="text-xs text-green-500 animate-in fade-in">Copied!</p>}
              </div>

              <div className="flex justify-center gap-3 text-pink-300">
                <span className="animate-pulse">✿</span>
                <span className="animate-pulse delay-100">❀</span>
                <span className="animate-pulse delay-200">✿</span>
              </div>
            </>
          )}

          {type === "lose" && (
            <div className="animate-in fade-in duration-500">
              <div className="space-y-3">
                <div className="text-5xl">💗</div>
                <h2 className="text-2xl font-medium text-gray-600">Almost there</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Try a softer strategy next time
                </p>
              </div>
              <div className="flex justify-center gap-3 text-purple-300 mt-6">
                <span>✿</span>
                <span>❀</span>
                <span>✿</span>
              </div>
            </div>
          )}

          {type === "draw" && (
            <div className="animate-in fade-in duration-500">
              <div className="space-y-3">
                <div className="text-5xl">🌙</div>
                <h2 className="text-2xl font-medium text-gray-700">Perfect balance</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  A beautiful harmony of minds
                </p>
              </div>
              <div className="flex justify-center gap-3 text-purple-300 mt-6">
                <span>✿</span>
                <span>❀</span>
                <span>✿</span>
              </div>
            </div>
          )}

          <Button
            onClick={onClose}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-pink-300 to-pink-400 hover:from-pink-400 hover:to-pink-500 text-white font-medium shadow-lg shadow-pink-200/50 border-0 transition-all duration-300"
          >
            {type === "win" ? "Play again" : type === "lose" ? "Try again" : "One more round"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
