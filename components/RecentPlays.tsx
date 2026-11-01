/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Tune Player - A cute music player ❤                       *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import React, {useEffect, useReducer, useRef, useState} from "react"
import * as Tone from "tone"
import {Capacitor} from "@capacitor/core"
import {ActionSheet, ActionSheetButtonStyle} from "@capacitor/action-sheet"
import square from "../assets/images/square.png"
import MP3UpIcon from "../assets/svg/mp3-up.svg"
import MP3DownIcon from "../assets/svg/mp3-down.svg"
import LeftArrowIcon from "../assets/svg/left-arrow.svg"
import RightArrowIcon from "../assets/svg/right-arrow.svg"
import {FilePicker} from "@capawesome/capacitor-file-picker"
import {SongItem} from "../structures/functions"
import {useFlagSelector, useFlagActions, usePlaybackSelector} from "../store"
import LongPressItem from "../ui/LongPressItem"
import PressableHaptic from "../ui/PressableHaptic"
import ScalableHaptic from "../ui/ScalableHaptic"
import functions from "../structures/functions"
import audio from "../structures/audio"
import "./styles/recentplays.less"

let recent = [] as SongItem[]
let pages = [] as SongItem[][]

const RecentPlays: React.FunctionComponent = (props) => {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0)
    const [pageIndex, setPageIndex] = useState(0)
    const {currentSong} = usePlaybackSelector()
    const {recentFlag} = useFlagSelector()
    const {setUploadFlag, setPlayFlag, setDownloadFlag, setRecentFlag} = useFlagActions()
    const menuOpen = useRef(false)

    const isTablet = () => {
        return Math.min(window.screen.width, window.screen.height) >= 600
    }

    const pageSize = isTablet() ? 8 : 4
    const columns = isTablet() ? 4 : 2

    useEffect(() => {
        let cancelled = false
        const updateRecentGUI = async () => {
            const savedRecent = await functions.getRecent()
            if (cancelled) return
            recent = savedRecent
            let newPages = [] as any
            let counter = 0;
            while (counter < recent.length) {
                let newPage = [] as any
                for (let i = 0; i < pageSize; i++) {
                    if (!recent[counter]) break
                    newPage.push(recent[counter])
                    counter++
                }
                if (newPage.length) newPages.push(newPage)
            }
            pages = newPages
            setPageIndex((index) => Math.min(index, Math.max(0, pages.length - 1)))
            forceUpdate()
            setRecentFlag(false)
        }
        updateRecentGUI()
        return () => { 
            cancelled = true 
        }
    }, [recentFlag])

    const showTrackMenu = async (item: SongItem) => {
        if (menuOpen.current || !Capacitor.isNativePlatform()) return
        menuOpen.current = true
        try {
            const result = await ActionSheet.showActions({
                title: item.songName,
                options: [{title: "Remove track", style: ActionSheetButtonStyle.Destructive}],
                cancelable: true
            })
            if (!result.canceled && result.index === 0) {
                await functions.removeRecent(item)
                setRecentFlag(true)
            }
        } finally {
            menuOpen.current = false
        }
    }

    const upload = async () => {
        audio.resumeContext(Tone.getContext())
        let supportedTypes = ["audio/wav", 
            "audio/mpeg", "audio/ogg", "audio/flac", 
            "audio/acc", "audio/mp4", "audio/midi"]
        const result = await FilePicker.pickFiles({limit: 1, types: supportedTypes})
        const file = result.files[0]
        if (file) {
            const path = file.path ?? file.webPath
            if (path) setUploadFlag({path, name: file.name, mimeType: file.mimeType})
        }
    }

    const download = () => {
        setDownloadFlag(true)
    }

    const invokePlay = (info: SongItem) => {
        void audio.resumeContext(Tone.getContext()).catch(console.warn)
        setPlayFlag(info)
    }

    const generateJSX = () => {
        const renderItem = (index: number) => {
            const item = pages[pageIndex]?.[index]

            if (!item) return (
                <img key={index} className="recent-square" src={square} draggable={false}/>
            )

            const key = item.storedFile || item.song
            return (
                <LongPressItem key={key} className="recent-song-item" 
                    aria-current={key === currentSong} data-song={item.song}
                    onPress={() => invokePlay(item)} onLongPress={() => showTrackMenu(item)}>
                    <img className="recent-img" src={item.songCover} draggable={false}/>
                    <div className="recent-song-text-container">
                        <span className="recent-song-text">{item.songName}</span>
                    </div>
                </LongPressItem>
            )
        }

        return (
            <div className="recent-row-container">
                <div className="recent-row">{Array.from({length: columns}, (_, index) => renderItem(index))}</div>
                <div className="recent-row">{Array.from({length: columns}, (_, index) => renderItem(index + columns))}</div>
            </div>
        )
    }

    const previousPage = () => {
        if (pages[pageIndex - 1]) {
            setPageIndex((prev) => prev - 1)
        }
    }

    const nextPage = () => {
        if (pages[pageIndex + 1]) {
            setPageIndex((prev) => prev + 1)
        }
    }

    return (
        <section className="recent-plays">
            <div className="recent-title-container">
                <div className="recent-mp3-buttons">
                    <ScalableHaptic onPress={upload}>
                        <MP3UpIcon className="recent-mp3-button"/>
                    </ScalableHaptic>
                    <ScalableHaptic onPress={download}>
                        <MP3DownIcon className="recent-mp3-button"/>
                    </ScalableHaptic>
                </div>
                <p className="recent-title">Recent Plays</p>
                <div className="recent-page-buttons">
                    <PressableHaptic onPress={previousPage}>
                        <LeftArrowIcon className="recent-page-button"/>
                    </PressableHaptic>
                    <PressableHaptic onPress={nextPage}>
                        <RightArrowIcon className="recent-page-button"/>
                    </PressableHaptic>
                </div>
            </div>
            <div className="recent-scroll">
                {generateJSX()}
            </div>
        </section>
    )
}

export default RecentPlays