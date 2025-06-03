<h1 align="center">🎵 BeatByte Discord Music Bot </h1>

<div align="center">

![BeatByte Logo](https://img.shields.io/badge/BeatByte-Music%20Bot-ff6b6b?style=for-the-badge&logo=discord&logoColor=white)

[![Discord.js](https://img.shields.io/badge/discord.js-v14.14.1-blue.svg?logo=discord&logoColor=white)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/node.js-16%2B-brightgreen.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-Active-success.svg)](https://github.com/yourusername/beatbyte-discord-bot)

*A powerful and user-friendly Discord music bot that brings high-quality YouTube audio to your server with sleek controls and an intuitive interface.*

[Features](#-features) • [Setup](#-quick-setup) • [Commands](#-commands) • [Demo](#-demo)

</div>

---

## ✨ Features

🎵 **Smart YouTube Integration**
- Search songs by name or paste direct YouTube links
- High-quality audio streaming with automatic format selection
- Robust error handling with fallback mechanisms

🎮 **Modern Discord Interface**  
- Slash commands (`/play`) for seamless user experience
- Interactive pause/resume controls with real-time button updates
- Rich embed messages with song metadata and thumbnails

🔊 **Voice Channel Magic**
- Automatically joins your voice channel when you play music
- Seamless audio playback with minimal latency
- Smart connection management

👋 **Server Integration**
- Welcome messages when joining new servers
- Custom activity status showing bot readiness
- Professional embed styling with consistent branding

## 🚀 Quick Setup

### Prerequisites
- **Node.js 16+** ([Download here](https://nodejs.org/))
- **FFmpeg** installed on your system
- **Discord Bot Token** ([Create one here](https://discord.com/developers/applications))

### 1-Minute Installation

```bash
# Clone the repository
git clone https://github.com/BGeorgiev120/BeatByte.git

# Install dependencies
npm install

# Edit .env and add your DISCORD_TOKEN

# Start the bot
npm start
```

### Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application → "BeatByte"
3. Navigate to **Bot** section → Reset token
4. **Enable Privileged Gateway Intents:**
   - ✅ Server Members Intent
   - ✅ Message Content Intent
5. **OAuth2 → URL Generator:**
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Send Messages`, `Use Slash Commands`, `Connect`, `Speak` or easier `Administrator`

## 🎮 Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/play <query>` | Play music from YouTube | `/play Never Gonna Give You Up` |
| `/play <url>` | Play from direct YouTube link | `/play https://youtu.be/dQw4w9WgXcQ` |

### Interactive Controls
- **⏸️ Pause** - Pause current song
- **▶️ Resume** - Resume paused song

</div>

## 🛠️ Installation Guide

### System Requirements

<details>
<summary><strong>Windows</strong></summary>

```powershell
# Install Node.js from https://nodejs.org
# Install FFmpeg
winget install ffmpeg

# Or using Chocolatey
choco install ffmpeg
```

</details>

<details>
<summary><strong>macOS</strong></summary>

```bash
# Install Node.js
brew install node

# Install FFmpeg
brew install ffmpeg
```

</details>

<details>
<summary><strong>Linux (Ubuntu/Debian)</strong></summary>

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install FFmpeg
sudo apt update && sudo apt install ffmpeg
```

</details>

### Environment Configuration

Create a `.env` file in the project root:

```env
# Required
DISCORD_TOKEN=your_discord_bot_token_here

# Optional
LOG_LEVEL=info
```

## 📦 Dependencies

### Core Dependencies
- **discord.js** `^14.14.1` - Discord API wrapper
- **@discordjs/voice** `^0.16.1` - Voice connection handling
- **@distube/ytdl-core** `^4.13.5` - YouTube downloader (maintained fork)
- **yt-search** `^2.10.4` - YouTube search functionality
- **dotenv** `^16.3.1` - Environment configuration

### Audio Processing
- **ffmpeg-static** `^5.2.0` - Audio format conversion
- **tweetnacl** `^1.0.3` - Voice encryption
- **opusscript** `^0.0.8` - Audio codec support

## 🏗️ Architecture

```
BeatByte/
├── index.js              # Main bot logic
├── package.json          # Dependencies & scripts
├── .env                  # Environment variables [EDIT]
└── README.md            # Documentation
```

### Key Components

- **Event System** - Handles Discord events and audio player states
- **Command Handler** - Processes slash commands and interactions
- **Audio Manager** - Manages voice connections and streaming
- **Error Recovery** - Robust error handling with fallbacks

## 🔧 Advanced Configuration

### Performance Tuning

```javascript
// In index.js, you can adjust these settings:
const stream = ytdl(videoUrl, {
    filter: 'audioonly',
    quality: 'highestaudio',        // Best quality
    highWaterMark: 1 << 25,        // Buffer size
    requestOptions: {
        headers: {
            'User-Agent': 'Mozilla/5.0...' // Avoid detection
        }
    }
});
```

### Development Mode

```bash
# Install nodemon for auto-restart
npm install -g nodemon

# Run in development mode
npm run dev
```

## 🐛 Troubleshooting

<details>
<summary><strong>Common Issues & Solutions</strong></summary>

**❌ Bot doesn't respond to commands**
- Verify bot has `Use Slash Commands` permission
- Check console for "✅ Slash commands registered successfully!"
- Ensure bot is online and has proper intents enabled

**❌ Audio doesn't play**
- Confirm FFmpeg is installed: `ffmpeg -version`
- Check bot has `Connect` and `Speak` permissions in voice channels
- Ensure you're in a voice channel when using `/play`

**❌ "Could not extract functions" error**
- This is fixed by using `@distube/ytdl-core` instead of `ytdl-core`
- Run: `npm uninstall ytdl-core && npm install @distube/ytdl-core`

**❌ Some YouTube videos won't play**
- Age-restricted or region-locked videos may fail
- Try a different search query or video
- Bot automatically tries multiple results when available

</details>

<details>
<summary><strong>Debug Mode</strong></summary>

Enable detailed logging by adding to your `.env`:
```env
LOG_LEVEL=debug
```

This will show detailed information about:
- Command processing
- Audio stream creation
- YouTube extraction
- Voice connection status

</details>

## 🚀 Hosting Options

### Free Hosting
- **Railway** - Easy deployment with GitHub integration
- **Heroku** - Free tier available (with limitations)
- **Replit** - Quick setup for testing

### VPS Hosting
- **DigitalOcean** - Reliable and affordable
- **Linode** - Great performance
- **AWS EC2** - Scalable cloud hosting

### 24/7 Hosting Setup

```bash
# Using PM2 for process management
npm install -g pm2
pm2 start index.js --name "BeatByte"
pm2 startup
pm2 save
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Feature Ideas
- Queue system for multiple songs
- Volume controls
- Skip/previous track functionality
- Playlist support from YouTube
- Loop/repeat modes
- Music dashboard web interface

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Discord.js** team for the amazing library
- **@distube** for maintaining ytdl-core fork
- **YouTube** for providing the music content
- **Community** for feedback and feature suggestions

## 📞 Support

<div align="center">

**Having issues?** We're here to help!

[![GitHub Issues](https://img.shields.io/badge/GitHub-Issues-orange?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yourusername/beatbyte-discord-bot/issues)

</div>

---

<div align="center">

**⭐ Star this repository if BeatByte brought music to your Discord server! ⭐**

Made with ❤️ for the Discord community

[![GitHub Stars](https://img.shields.io/github/stars/yourusername/beatbyte-discord-bot?style=social)](https://github.com/BGeorgiev120/BeatByte)
[![GitHub Forks](https://img.shields.io/github/forks/yourusername/beatbyte-discord-bot?style=social)](https://github.com/BGeorgiev120/BeatByte/fork)

</div>
