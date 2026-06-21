# 🧠 NeuroPuzzle - Neural Network Puzzle Game

**Design. Train. Optimize.** An interactive browser-based puzzle game where you build, train, and optimize neural networks to solve increasingly complex challenges. Learn machine learning concepts through hands-on gameplay with stunning 3D visualizations.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-0.184-black?logo=threejs)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22-orange?logo=tensorflow)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)
![License](https://img.shields.io/badge/license-ISC-green)

---

## 📖 Table of Contents 

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Game Modes](#game-modes)
- [Educational Value](#educational-value)
- [Contributing](#contributing)
- [License](#license)

---

## 📋 Overview

NeuroPuzzle is a premium, game-like experience that teaches neural network concepts through interactive puzzle-solving. Players design neural architectures using a visual node editor, watch real-time training simulations, and optimize models to meet level objectives. The game combines cyberpunk-meets-neuroscience aesthetics with educational depth.

**Core Gameplay Loop:**
1. Receive a puzzle with input/output examples
2. Design neural architecture using visual editor
3. Train the network and watch it learn in real-time
4. Test against hidden test cases
5. Optimize for accuracy, speed, or network size

---

## ✨ Features

### 🎮 Gameplay
- **Campaign Mode**: 40+ progressive levels across 3 acts (Foundations, Specialization, Mastery)
- **Sandbox Mode**: Free-form experimentation with datasets like MNIST, Iris, and custom uploads
- **Daily Challenge**: Timed puzzles with global leaderboards
- **Custom Puzzle Builder**: Create and share your own datasets and challenges
- **Multiplayer Race** (planned): Real-time competition against friends

### 🎨 Visual Design
- **3D Network Visualization**: Real-time Three.js/Fiber rendering of neural networks
- **Cyberpunk Aesthetic**: Neon glow effects, glass-morphism panels, particle systems
- **Animated Training**: Watch weights update, neurons fire, and loss decrease
- **Data Visualization**: Interactive charts, heatmaps, sparklines, and gauges

### 🛠 Technical
- **TensorFlow.js**: All training runs in the browser
- **Web Workers**: Off-main-thread training for smooth animations
- **Responsive UI**: Desktop, tablet, and mobile-friendly layouts
- **Themes**: Unlockable color schemes (Dark Neon, Ocean, Forest, Synthwave)
- **Audio**: Howler.js integration for sound effects and music

---

## 🚀 Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | React 19 + TypeScript | Component architecture, type safety |
| **Build Tool** | Vite | Fast HMR, optimized builds |
| **3D Rendering** | Three.js + React Three Fiber | Neural network visualization |
| **Animations** | Framer Motion | UI transitions, micro-interactions |
| **Charts** | Recharts | Real-time training metrics |
| **Styling** | Tailwind CSS v4 | Utility-first CSS |
| **State Management** | Zustand | Game state, network state, UI preferences |
| **ML Engine** | TensorFlow.js | Browser-based neural network training |
| **Drag & Drop** | @dnd-kit | Layer and node manipulation |
| **Notifications** | canvas-confetti | Achievement celebrations |
| **Audio** | Howler.js | Sound effects and music |
| **Linting** | ESLint + TypeScript strict | Code quality |

---

## 📁 Project Structure

```
neuropuzzle/
├── src/
│   ├── components/          # Reusable UI & 3D components
│   │   ├── ui/              # Buttons, cards, badges (Radix UI primitives)
│   │   ├── layout/          # App shell, navigation
│   │   ├── network/         # Three.js neuron spheres, connections
│   │   ├── charts/          # Recharts wrappers, sparklines
│   │   ├── editor/          # Drag-drop layer panel
│   │   ├── training/        # Loss charts, epoch sliders
│   │   └── game/            # Achievements, star ratings
│   ├── screens/             # Page-level components
│   │   ├── MainMenu.tsx
│   │   ├── CampaignMap.tsx
│   │   ├── NetworkBuilder.tsx
│   │   ├── TrainingMonitor.tsx (embedded)
│   │   ├── ResultsScreen.tsx
│   │   ├── Sandbox.tsx
│   │   ├── DailyChallenge.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── ProfileAchievements.tsx
│   │   ├── Settings.tsx
│   │   └── CustomPuzzleBuilder.tsx
│   ├── stores/              # Zustand state management
│   │   ├── appStore.ts      # Navigation, player progress, settings
│   │   └── networkStore.ts  # Network architecture, training state
│   ├── lib/                 # Utilities
│   │   ├── levels.ts        # Level definitions & puzzles
│   │   └── playerProgress.ts # Save/load, local storage
│   ├── workers/             # Web Workers
│   │   └── trainingWorker.ts # TensorFlow.js training off main thread
│   ├── types/               # TypeScript declarations
│   ├── App.tsx              # Main app with screen routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles, theme variables
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── frontend.md              # Detailed frontend implementation strategy
├── NEURAL_PUZZLE_GAME_DESIGN.md | Complete game design document
└── README.md               # This file
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0 (recommended: 20.x LTS)
- **npm** >= 8.x or **yarn** / **pnpm**
- Modern browser with WebGL support (Chrome, Firefox, Edge, Safari)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/neuropuzzle.git
   cd neuropuzzle
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production**
   ```bash
   npm run build
   ```
   Output will be in the `dist/` folder.

5. **Preview production build**
   ```bash
   npm run preview
   ```

---

## 🛠 Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build for production (output to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint (if configured) |
| `npm run typecheck` | Run TypeScript type checking |

### Configuration Files

- **`vite.config.ts`**: Vite build configuration with React plugin
- **`tsconfig.json`**: TypeScript compiler options (strict mode enabled)
- **`tailwind.config.js`**: Tailwind CSS theme and plugin setup
- **`postcss.config.js`**: PostCSS with autoprefixer
- **`package.json`**: Dependencies and scripts

### Theming

The game uses CSS custom properties for theming. Current themes are defined in `src/index.css`:

```css
:root {
  --bg-app: #0A0E27;
  --neural-blue: #00D9FF;
  --neural-purple: #B800FF;
  --neural-green: #00FF88;
  /* ... */
}

html[data-theme='ocean'] { /* overrides */ }
html[data-theme='forest'] { /* overrides */ }
```

Add new themes by extending the CSS variables.

---

## 🎮 Game Modes

| Mode | Description |
|------|-------------|
| **Campaign** | 40+ levels progressing from basic perceptrons to advanced architectures |
| **Sandbox** | Unlimited experimentation with pre-loaded datasets (MNIST, Iris) |
| **Daily Challenge** | New puzzle every 24 hours with leaderboard competition |
| **Custom Builder** | Create and share your own puzzles with CSV uploads |
| **Multiplayer** *(planned)* | Real-time race to solve puzzles |

---

## 🎓 Educational Value

NeuroPuzzle teaches core machine learning concepts through interactive visualization:

- **Act I**: Neurons, layers, weights, bias, activation functions (ReLU, Sigmoid, Tanh)
- **Act II**: Backpropagation, loss functions, optimization, regularization, dropout
- **Act III**: Convolutional layers, RNNs, attention mechanisms, transfer learning
- **Advanced**: Multi-task learning, reinforcement learning intro

Each level includes:
- Real training data visualization
- Live network activity rendering
- Performance metrics (accuracy, loss, F1-score, confusion matrix)

---

## 📊 Requirements

### Runtime Dependencies

Production dependencies are listed in `package.json`:

```json
{
  "dependencies": {
    "react": "^19.2.5",
    "react-dom": "^19.2.5",
    "three": "^0.184.0",
    "@react-three/fiber": "^9.6.1",
    "@react-three/drei": "^10.7.7",
    "@tensorflow/tfjs": "^4.22.0",
    "zustand": "^5.0.12",
    "recharts": "^3.8.1",
    "framer-motion": "^12.38.0",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "tailwindcss": "^4.2.4",
    "howler": "^2.2.4",
    "canvas-confetti": "^1.9.4",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@vitejs/plugin-react": "^6.0.1",
    "autoprefixer": "^10.5.0",
    "postcss": "^8.5.12",
    "typescript": "^6.0.3",
    "vite": "^8.0.10"
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "@tailwindcss/postcss": "^4.2.4"
  }
}
```

### Browser Support

- Chrome 90+ (recommended)
- Firefox 88+
- Safari 16+
- Edge 90+

Requires WebGL 2.0 for 3D visualizations.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Code Style

- TypeScript strict mode
- ESLint rules enforced (when configured)
- Prettier formatting recommended
- Follow React best practices and functional components

### Areas for Contribution

- New level puzzles and datasets
- UI/UX improvements and accessibility
- Performance optimization
- Mobile responsiveness
- Audio/visual assets
- Documentation and tutorials

---

## 📜 License

ISC License - see `package.json` for details.

---

## 🙏 Acknowledgments

- **Design灵感**: Cyberpunk 2077, NEXUS Neural Visualizer, DeepDream
- **Gameplay灵感**: Human Resource Machine, Universal Paperclips, Opus Magnum
- **Built with**: React, Three.js, TensorFlow.js, and the amazing open-source community

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/neuropuzzle/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/neuropuzzle/discussions)
- **Email**: support@neuropuzzle.game

---

**Ready to train your brain?** Run `npm run dev` and dive into the world of neural networks. 🚀
