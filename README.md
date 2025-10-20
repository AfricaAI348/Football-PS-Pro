PS2-Style Football Game ⚽

A retro-style football (soccer) game inspired by PS2-era sports games, built with HTML5, CSS3, and JavaScript. This is a fully functional Progressive Web App (PWA) that can be installed on your device and played offline.

https://img.shields.io/badge/Game-PS2%20Style-blue https://img.shields.io/badge/PWA-Enabled-green https://img.shields.io/badge/Multiplayer-Local%20VS-orange

🎮 Features

· Two-Player Mode - Play against a friend on the same device
· AI Teammates - Smart AI players that assist both sides
· Realistic Physics - Ball movement with friction and collision detection
· PS2-Style Graphics - Retro aesthetic with smooth animations
· PWA Support - Installable on any device and works offline
· Responsive Design - Plays well on desktop, tablet, and mobile
· Touch Controls - Mobile-friendly touch interface
· Score Tracking - Live scoreboard with match timer

🚀 Live Demo

Play the Game Here

🕹️ Controls

Player 1 (Home Team - Blue)

· Movement: W A S D keys
· Kick: SPACEBAR

Player 2 (Away Team - Red)

· Movement: Arrow Keys (↑ ↓ ← →)
· Kick: ENTER key

Mobile/Touch Controls

· Movement: Touch and drag on the screen
· Kick: Tap when player has possession

📦 Installation

Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/ps2-football-game.git

# Navigate to project directory
cd ps2-football-game

# Serve using a local server (required for PWA)
python -m http.server 8000
# or
npx http-server
# or
php -S localhost:8000
```

Then open http://localhost:8000 in your browser.

Direct Access

Simply open index.html in a modern web browser (some PWA features may be limited).

📱 PWA Installation

Desktop

1. Open the game in Chrome/Edge
2. Click the install icon 📥 in the address bar
3. Click "Install" to add to your desktop

Mobile

· Android Chrome: Tap menu (⋮) → "Add to Home screen"
· iOS Safari: Tap share (⎙) → "Add to Home Screen"

🏗️ Project Structure

```
ps2-football-game/
│
├── index.html          # Main HTML file
├── style.css           # Styles and responsive design
├── script.js           # Game logic and PWA functionality
├── manifest.json       # PWA manifest file
├── sw.js              # Service Worker for offline support
├── icons/             # App icons folder
│   ├── icon-192.png   # Small icon (192x192)
│   └── icon-512.png   # Large icon (512x512)
└── README.md          # Project documentation
```

🎯 Game Rules

· Match Duration: 90 minutes (game time)
· Scoring: Get the ball into the opponent's goal
· Winning: Team with most goals when time expires wins
· Controls: Each player controls one main player + has AI teammates

🔧 Technical Details

Built With

· HTML5 Canvas - Game rendering
· CSS3 - Styling and animations
· Vanilla JavaScript - Game logic and PWA features
· Service Workers - Offline functionality

Browser Support

· Chrome 60+
· Firefox 55+
· Safari 11+
· Edge 79+

PWA Features

· ✅ Web App Manifest
· ✅ Service Worker
· ✅ Offline Functionality
· ✅ Install Prompt
· ✅ Responsive Design

🛠️ Development

Running Locally

```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server

# Using PHP
php -S localhost:8000
```

Customization

Modify game constants in script.js:

```javascript
const playerSpeed = 3;        // Movement speed
const ballFriction = 0.98;    // Physics
const matchTime = 90 * 60;    // Game duration
```

🎨 Screenshots

(Add your game screenshots here)

🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

🐛 Known Issues

· Ball may occasionally get stuck in corners
· Mobile performance may vary on older devices
· Some PWA features require HTTPS for full functionality

📝 TODO / Roadmap

· Sound effects and background music
· Different stadium backgrounds
· Player statistics
· Multiplayer over network
· Tournament mode
· Custom team creation

📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments

· Inspired by classic PS2 football games
· PWA implementation guidance from MDN Web Docs
· Icons by Icons8

---

Made with ❤️ for retro gaming enthusiasts

For questions or support, please open an issue in this repository.
