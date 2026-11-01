/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Tune Player - A cute music player ❤                       *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import {Capacitor, registerPlugin, type PluginListenerHandle} from "@capacitor/core"

export interface NowPlayingInfo {
    trackID: string
    title: string
    duration: number
    elapsed: number
    rate: number
    artwork?: string
}

export interface AudioCommand {
    action: "play" | "pause" | "seek"
    position?: number
    trackID?: string
}

interface BackgroundAudioPlugin {
    start(options: {title: string}): Promise<void>
    stop(): Promise<void>
    updateNowPlaying(info: NowPlayingInfo): Promise<void>
    addListener(event: "command", listener: (command: AudioCommand) => void): Promise<PluginListenerHandle>
    addListener(event: "pause", listener: () => void): Promise<PluginListenerHandle>
}

interface PlaybackContext {
    readonly state: string
    on(event: "statechange", callback: () => void): unknown
    off(event: "statechange", callback: () => void): unknown
}

const native = registerPlugin<BackgroundAudioPlugin>("BackgroundAudio")
let operations = Promise.resolve()
let publishedInfo: NowPlayingInfo | undefined
let progressClock: HTMLAudioElement | undefined
let progressURL = ""
let progressDuration = 0
const mediaSessionAvailable = () => Boolean(navigator.mediaSession && typeof MediaMetadata !== "undefined")

// The native progress clock is synced using dummy audio.
const updateProgressClock = (info: NowPlayingInfo) => {
    if (!Number.isFinite(info.duration) || info.duration <= 0 || !Number.isFinite(info.elapsed)) return
    if (!progressClock) {
        progressClock = document.createElement("audio")
        progressClock.preload = "auto"
        progressClock.addEventListener("loadedmetadata", () => {
            if (publishedInfo) updateProgressClock(publishedInfo)
        })
    }
    if (progressDuration !== info.duration) {
        const samples = Math.ceil(info.duration * 8000 / 2) * 2
        const wav = new Uint8Array(44 + samples)
        const header = new DataView(wav.buffer)
        const text = (offset: number, value: string) => {
            for (let i = 0; i < value.length; i++) wav[offset + i] = value.charCodeAt(i)
        }
        text(0, "RIFF")
        header.setUint32(4, 36 + samples, true)
        text(8, "WAVEfmt ")
        header.setUint32(16, 16, true)
        header.setUint16(20, 1, true)
        header.setUint16(22, 1, true)
        header.setUint32(24, 8000, true)
        header.setUint32(28, 8000, true)
        header.setUint16(32, 1, true)
        header.setUint16(34, 8, true)
        text(36, "data")
        header.setUint32(40, samples, true)
        wav.fill(128, 44)
        const previousURL = progressURL
        progressURL = URL.createObjectURL(new Blob([wav], {type: "audio/wav"}))
        progressDuration = info.duration
        progressClock.src = progressURL
        if (previousURL) URL.revokeObjectURL(previousURL)
    }
    const position = Math.max(0, Math.min(info.duration, info.elapsed))
    if (progressClock.readyState > 0 && Math.abs(progressClock.currentTime - position) > (info.rate === 0 ? 0.001 : 0.2)) {
        progressClock.currentTime = position
    }
    if (info.rate !== 0) progressClock.playbackRate = info.rate
    if (info.rate === 0) {
        progressClock.pause()
    } else if (progressClock.paused) {
        progressClock.play().catch(() => null)
    }
}

export default class Audio {
    public static queue = (operation: () => Promise<void>) => {
        const next = operations.then(operation)
        operations = next.catch(() => {})
        return next
    }

    public static startAudio = (title: string) => {
        const audioNavigator = navigator as Navigator & {audioSession?: {type: string}}
        if (audioNavigator.audioSession) audioNavigator.audioSession.type = "playback"

        return this.queue(async () => {
            if (!Capacitor.isNativePlatform()) return
            await native.start({title: title || "Tune Player"})
        })
    }

    public static preparePlayback = async (title: string, context: {rawContext: unknown, state: string}) => {
        progressClock?.play().catch(() => null)
        const resumed = this.resumeContext(context)
        const started = this.startAudio(title).then(async () => {
            if (context.state !== "running") await this.resumeContext(context)
        })
        await Promise.all([resumed, started])
    }

    public static stopAudio = () => {
        progressClock?.pause()
        return this.queue(async () => {
            if (Capacitor.isPluginAvailable("BackgroundAudio")) await native.stop()
        })
    }

    public static resumeContext = (context: {rawContext: unknown, state: string}) => {
        const raw = context.rawContext as {resume: () => Promise<void>}
        return this.resumePlaybackContext(() => raw.resume(), () => context.state)
    }

    public static recoverPlaybackClock = async (context: {rawContext: unknown, state: string}) => {
        if (Capacitor.getPlatform() !== "ios") return
        const raw = context.rawContext as {currentTime: number, suspend: () => Promise<void>}
        const advances = async () => {
            const time = raw.currentTime
            await new Promise(resolve => setTimeout(resolve, 150))
            return context.state === "running" && raw.currentTime > time
        }
        if (await advances()) return
        if (context.state !== "running") throw new Error(`Audio context is ${context.state}`)
        let timeout: ReturnType<typeof setTimeout> | undefined
        try {
            await Promise.race([
                raw.suspend(),
                new Promise<never>((_, reject) => {
                    timeout = setTimeout(() => reject(new Error("Audio suspension timed out")), 4000)
                })
            ])
        } finally {
            clearTimeout(timeout)
        }
        await this.resumeContext(context)
        if (!await advances()) throw new Error("Audio rendering clock did not resume")
    }

    public static playbackPosition = (seconds: number, duration: number, reverse: boolean) => {
        return Math.max(0, Math.min(duration, reverse ? duration - seconds : seconds))
    }

    public static onAudioPause = async (listener: () => void) => {
        if (!Capacitor.isNativePlatform()) return {remove: async () => {}}
        return await native.addListener("pause", listener)
    }

    public static updateNowPlaying = (info: NowPlayingInfo) => this.queue(async () => {
        if (Capacitor.getPlatform() !== "ios") return
        if (info.rate === 0) info = {...info, elapsed: Math.floor(info.elapsed)}
        if (!mediaSessionAvailable()) {
            await native.updateNowPlaying(info)
            return
        }

        const session = navigator.mediaSession
        const artwork = info.artwork ?? (publishedInfo?.trackID === info.trackID ? publishedInfo.artwork : "")

        if (!session.metadata || publishedInfo?.trackID !== info.trackID ||
            publishedInfo.title !== info.title || publishedInfo.artwork !== artwork) {
            session.metadata = new MediaMetadata({title: info.title,
                artwork: artwork ? [{src: artwork, type: "image/png"}] : []})
        }

        publishedInfo = {...info, artwork}
        updateProgressClock(publishedInfo)

        if (Number.isFinite(info.duration) && info.duration > 0 && Number.isFinite(info.elapsed)) {
            session.setPositionState?.({duration: info.duration,
                position: Math.max(0, Math.min(info.duration, info.elapsed)), playbackRate: info.rate || 1})
        }
        await native.updateNowPlaying(info)
    })

    public static onAudioCommand = async (listener: (command: AudioCommand) => void) => {
        if (Capacitor.getPlatform() !== "ios") return {remove: async () => {}}

        const handle = await native.addListener("command", listener)
        const registered: MediaSessionAction[] = []
        if (mediaSessionAvailable()) {
            const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
                ["play", () => listener({action: "play"})],
                ["pause", () => listener({action: "pause"})],
                ["seekto", (details) => {
                    if (Number.isFinite(details.seekTime)) listener({action: "seek", position: details.seekTime})
                }]
            ]
            for (const [action, handler] of handlers) {
                try {
                    navigator.mediaSession.setActionHandler(action, handler)
                    registered.push(action)
                } catch (error) {
                    console.warn(`Unable to register ${action}`, error)
                }
            }
        }

        return {remove: async () => {
            for (const action of registered) navigator.mediaSession.setActionHandler(action, null)
            await handle.remove()
        }}
    }

    public static downloadArtwork = (source: string) => {
        return new Promise<string>((resolve, reject) => {
            if (!source) return resolve("")
            const image = new Image()
            image.crossOrigin = "anonymous"
            image.onload = () => {
                const canvas = document.createElement("canvas")
                const scale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight))
                canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
                canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
                 
                const ctx = canvas.getContext("2d")!
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
                resolve(canvas.toDataURL("image/png"))
            }
            image.onerror = () => reject(new Error("Unable to load artwork"))
            image.src = source
        })
    }

    public static watchPlaybackContext = (context: PlaybackContext, isPlaying: () => boolean, 
        onInterrupted: () => void, page: Pick<Document, "addEventListener" | "removeEventListener"> = document,
        onRunning?: () => void) => {
        const check = () => {
            if (context.state !== "running" && isPlaying()) {
                onInterrupted()
            } else if (context.state === "running") {
                onRunning?.()
            }
        }
        context.on("statechange", check)
        page.addEventListener("visibilitychange", check)
        check()
        return () => {
            context.off("statechange", check)
            page.removeEventListener("visibilitychange", check)
        }
    }

    public static resumePlaybackContext = (resume: () => Promise<void>, state: () => string) => {
        const pending = resume()
        return new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error("Audio resume timed out")), 4000)
            pending.then(() => {
                clearTimeout(timer)
                if (state() !== "running") reject(new Error(`Audio context is ${state()}`))
                else resolve()
            }, (error) => { 
                clearTimeout(timer)
                reject(error)
            })
        })
    }
}
