# 🌸 Tic Tac Toe — Vibecoded Mini Game 🌸

🔗 **Live demo:**  
https://v0-tic-tac-toe-feminine.vercel.app/

A soft, feminine Tic Tac Toe game built as a **vibecoding experiment** using **v0.dev** and refined manually within a few hours.

The goal of this project was not to over-engineer a classic game, but to explore **rapid UI iteration**, **emotional UX**, and **clean state management** under tight time constraints.

The project also includes a **Telegram bot integration** that sends game result notifications and enables promo code rewards.

---

## ✨ Highlights

- Feminine, calm visual style
- Smooth animations and micro-interactions
- Multiple game modes and difficulty levels
- AI opponent with different behaviors
- Telegram bot integration for game result notifications
- Polished UX with clear game states
- Accessible and performant by design

---

## 🎮 Features

### Game Modes
- **Classic** — 3×3 board, standard rules  
- **Relax** — larger board, slower pace  
- **Daily** — same setup for everyone on that day  

### Difficulty Levels
- **Playful** — playful AI that makes human-like mistakes  
- **Smart** — balanced strategy  
- **Expert** — challenging, near-unbeatable  

### Gameplay Experience
- Clear turn indicators
- Highlighted winning combinations
- Gentle win / lose / draw states (no harsh messaging)
- Restart game at any time

### Telegram Bot Rewards
- Integrated **Telegram Bot API**
- Sends **automatic win/loss notifications**
- Generates **promo code rewards for wins**
- Connects the web game to Telegram for a lightweight engagement loop

---

## 🤖 Telegram Bot Integration

A simple backend service connects the game to a Telegram bot.

When a game finishes:
- The result is sent to the backend
- The backend communicates with the **Telegram Bot API**
- The bot sends a notification with the result and promo code reward

This creates a small **reward loop** where players can receive promo codes via Telegram.

---

## ⚙️ Accessibility

- **High contrast mode** — brighter colors for improved visibility  
- **Reduced motion mode** — disables background animation, confetti, and tile effects  

---

## 🧠 Technical Notes

- Built with **v0.dev** for rapid vibecoding
- UI and core game logic generated and refined in a few hours
- Frontend deployed via **Vercel**
- **Node.js backend** built on **Replit**
- Backend connects the game to the **Telegram Bot API**
- Game settings persisted locally via `localStorage`

The entire project — **game interface, bot integration, and deployment** — was shipped in under a day by combining **v0’s rapid prototyping** with **Replit’s zero-configuration environment**.

---

Built with 💗 as a vibecoding experiment.
