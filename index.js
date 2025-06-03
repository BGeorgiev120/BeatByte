const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActivityType,
} = require("discord.js");
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    getVoiceConnection,
} = require("@discordjs/voice");
const ytdl = require("@distube/ytdl-core");
const ytSearch = require("yt-search");
require("dotenv").config();

class BeatByteBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.MessageContent,
            ],
        });

        this.player = createAudioPlayer();
        this.currentSong = null;
        this.isPaused = false;
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.client.once("ready", () => {
            console.log(`🎵 BeatByte is online as ${this.client.user.tag}!`);

            // Set cool custom activity status
            this.client.user.setActivity("🎵 Ready to drop some beats!", {
                type: ActivityType.Custom,
            });

            this.registerSlashCommands();
        });

        this.client.on("guildCreate", async (guild) => {
            // Send welcome message when joining a server
            const welcomeEmbed = new EmbedBuilder()
                .setColor("#FF6B6B")
                .setTitle("🎵 BeatByte Has Joined!")
                .setDescription(
                    "Hey there! I'm **BeatByte**, your new music companion! 🎶\n\nI'm ready to play your favorite tunes. Use `/play` to get started!"
                )
                .addFields(
                    {
                        name: "🎤 Commands",
                        value: "`/play [song name or YouTube link]` - Play music",
                    },
                    {
                        name: "🎧 Features",
                        value: "• YouTube search & direct links\n• Auto voice channel join\n• Pause/Resume controls",
                    }
                )
                .setThumbnail(this.client.user.displayAvatarURL())
                .setFooter({ text: "Let's make some noise! 🔊" })
                .setTimestamp();

            // Find the first text channel we can send to
            const channel = guild.channels.cache.find(
                (ch) =>
                    ch.type === 0 &&
                    ch.permissionsFor(guild.members.me).has("SendMessages")
            );

            if (channel) {
                await channel.send({ embeds: [welcomeEmbed] });
            }
        });

        this.client.on("interactionCreate", async (interaction) => {
            if (interaction.isChatInputCommand()) {
                await this.handleSlashCommand(interaction);
            } else if (interaction.isButton()) {
                await this.handleButtonInteraction(interaction);
            }
        });

        // Audio player event handlers
        this.player.on(AudioPlayerStatus.Playing, () => {
            console.log("🎵 Now playing audio!");
        });

        this.player.on(AudioPlayerStatus.Idle, () => {
            console.log("⏹️ Audio finished playing");
            this.currentSong = null;
            this.isPaused = false;
        });

        this.player.on("error", (error) => {
            console.error("❌ Audio player error:", error);
        });
    }

    async registerSlashCommands() {
        const playCommand = new SlashCommandBuilder()
            .setName("play")
            .setDescription("Play music from YouTube")
            .addStringOption((option) =>
                option
                    .setName("query")
                    .setDescription("Song name or YouTube URL")
                    .setRequired(true)
            );

        try {
            await this.client.application.commands.set([playCommand]);
            console.log("✅ Slash commands registered successfully!");
        } catch (error) {
            console.error("❌ Error registering slash commands:", error);
        }
    }

    async handleSlashCommand(interaction) {
        if (interaction.commandName === "play") {
            await this.handlePlayCommand(interaction);
        }
    }

    async handlePlayCommand(interaction) {
        await interaction.deferReply();

        // Check if user is in a voice channel
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#FF4757")
                .setTitle("❌ Voice Channel Required")
                .setDescription(
                    "You need to be in a voice channel to play music!"
                );

            return await interaction.editReply({ embeds: [errorEmbed] });
        }

        const query = interaction.options.getString("query");

        try {
            // Check if query is a YouTube URL
            let songInfo;
            let videoUrl;

            if (ytdl.validateURL(query)) {
                videoUrl = query;
                try {
                    songInfo = await ytdl.getInfo(query);
                } catch (ytdlError) {
                    console.log("Direct ytdl failed, trying search method...");
                    // Fallback to search if direct URL fails
                    const searchResults = await ytSearch(query);
                    if (!searchResults.videos.length)
                        throw new Error("No results found");
                    videoUrl = searchResults.videos[0].url;
                    songInfo = await ytdl.getInfo(videoUrl);
                }
            } else {
                // Search for the song
                const searchResults = await ytSearch(query);
                if (!searchResults.videos.length) {
                    const noResultsEmbed = new EmbedBuilder()
                        .setColor("#FF4757")
                        .setTitle("❌ No Results Found")
                        .setDescription(
                            `Couldn't find any results for: **${query}**`
                        );

                    return await interaction.editReply({
                        embeds: [noResultsEmbed],
                    });
                }

                const firstResult = searchResults.videos[0];
                videoUrl = firstResult.url;

                // Try multiple videos if the first one fails
                let attempts = 0;
                const maxAttempts = 3;

                while (attempts < maxAttempts) {
                    try {
                        songInfo = await ytdl.getInfo(
                            searchResults.videos[attempts].url
                        );
                        videoUrl = searchResults.videos[attempts].url;
                        break;
                    } catch (attemptError) {
                        console.log(
                            `Attempt ${
                                attempts + 1
                            } failed, trying next video...`
                        );
                        attempts++;
                        if (
                            attempts >= maxAttempts ||
                            attempts >= searchResults.videos.length
                        ) {
                            throw new Error("All video attempts failed");
                        }
                    }
                }
            }

            // Join voice channel
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            // Create audio resource with better options
            const stream = ytdl(videoUrl, {
                filter: "audioonly",
                quality: "highestaudio",
                highWaterMark: 1 << 25,
                requestOptions: {
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    },
                },
            });

            const resource = createAudioResource(stream);

            // Store current song info
            this.currentSong = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
                thumbnail: songInfo.videoDetails.thumbnails[0]?.url,
                duration: this.formatDuration(
                    songInfo.videoDetails.lengthSeconds
                ),
                author: songInfo.videoDetails.author.name,
            };

            // Play the audio
            this.player.play(resource);
            connection.subscribe(this.player);
            this.isPaused = false;

            // Create embed with pause/play button
            const playingEmbed = new EmbedBuilder()
                .setColor("#5865F2")
                .setTitle("🎵 Now Playing")
                .setDescription(`**${this.currentSong.title}**`)
                .addFields(
                    {
                        name: "👤 Artist",
                        value: this.currentSong.author,
                        inline: true,
                    },
                    {
                        name: "⏱️ Duration",
                        value: this.currentSong.duration,
                        inline: true,
                    },
                    {
                        name: "🔗 Channel",
                        value: voiceChannel.name,
                        inline: true,
                    }
                )
                .setThumbnail(this.currentSong.thumbnail)
                .setFooter({ text: "BeatByte Music Player" })
                .setTimestamp();

            const pauseButton = new ButtonBuilder()
                .setCustomId("pause_resume")
                .setLabel("⏸️ Pause")
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(pauseButton);

            await interaction.editReply({
                embeds: [playingEmbed],
                components: [row],
            });
        } catch (error) {
            console.error("❌ Error playing song:", error);

            const errorEmbed = new EmbedBuilder()
                .setColor("#FF4757")
                .setTitle("❌ Playback Error")
                .setDescription(
                    "There was an error trying to play that song. Please try again!"
                );

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }

    async handleButtonInteraction(interaction) {
        if (interaction.customId === "pause_resume") {
            if (!this.currentSong) {
                return await interaction.reply({
                    content: "❌ No song is currently playing!",
                    ephemeral: true,
                });
            }

            if (this.isPaused) {
                // Resume
                this.player.unpause();
                this.isPaused = false;

                const button = new ButtonBuilder()
                    .setCustomId("pause_resume")
                    .setLabel("⏸️ Pause")
                    .setStyle(ButtonStyle.Primary);

                const row = new ActionRowBuilder().addComponents(button);

                await interaction.update({ components: [row] });
            } else {
                // Pause
                this.player.pause();
                this.isPaused = true;

                const button = new ButtonBuilder()
                    .setCustomId("pause_resume")
                    .setLabel("▶️ Resume")
                    .setStyle(ButtonStyle.Success);

                const row = new ActionRowBuilder().addComponents(button);

                await interaction.update({ components: [row] });
            }
        }
    }

    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    start() {
        this.client.login(process.env.DISCORD_TOKEN);
    }
}

// Create and start the bot
const beatByte = new BeatByteBot();
beatByte.start();

module.exports = BeatByteBot;
