/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Tune Player - A cute music player ❤                       *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import React, {useEffect, useRef} from "react"
import {useSheetSelector, useSheetActions, usePlaybackSelector, usePlaybackActions} from "../store"
import {presentSheet} from "@capgo/capacitor-sheets/react"
import Slider from "react-slider"
import PressableHaptic from "../ui/PressableHaptic"
import ScalableHaptic from "../ui/ScalableHaptic"
import "./styles/sheet.less"

const SpeedSheet: React.FunctionComponent = () => {
    const {showSpeedSheet} = useSheetSelector()
    const {setShowSpeedSheet} = useSheetActions()
    const {speed, preservesPitch} = usePlaybackSelector()
    const {setSpeed, setPreservesPitch} = usePlaybackActions()
    const sheet = useRef<HTMLElement>(null)

    useEffect(() => {
        if (showSpeedSheet) {
            presentSheet("speed-sheet")

            setShowSpeedSheet(false)
        }
    }, [showSpeedSheet])

    const reset = () => {
        setSpeed(1)
        setPreservesPitch(true)
    }

    return (
        <cap-sheet id="speed-sheet" ref={sheet} content-placement="bottom">
            <cap-sheet-view>
                <cap-sheet-backdrop/>
                <cap-sheet-content className="sheet">
                    <div className="sheet-solid-background"/>
                    <div className="sheet-row">
                        <span className="sheet-title">Speed</span>
                    </div>
                    <div className="sheet-row">
                        <span className="sheet-big-text">{speed.toFixed(2)}x</span>
                    </div>
                    <div className="sheet-row">
                        <div className="sheet-slider-container">
                            <Slider className="sheet-slider" trackClassName="sheet-slider-track" thumbClassName="sheet-slider-handle"
                            min={0.25} max={4} step={0.01} onChange={(value: number) => setSpeed(value)} value={speed}/>

                            <div className="sheet-slider-text-container">
                                <span className="sheet-slider-text">0.25x</span>
                                <span className="sheet-slider-text">4x</span>
                            </div>
                        </div>
                    </div>
                    <div className="sheet-row">
                        <div className="sheet-button-container">
                            <PressableHaptic onPress={() => setSpeed(0.5)}>
                                <button className="sheet-button" aria-pressed={speed === 0.5}>0.5x</button>
                            </PressableHaptic>
                            <PressableHaptic onPress={() => setSpeed(0.75)}>
                                <button className="sheet-button" aria-pressed={speed === 0.75}>0.75x</button>
                            </PressableHaptic>
                            <PressableHaptic onPress={() => setSpeed(1)}>
                                <button className="sheet-button" aria-pressed={speed === 1}>1x</button>
                            </PressableHaptic>
                            <PressableHaptic onPress={() => setSpeed(1.25)}>
                                <button className="sheet-button" aria-pressed={speed === 1.25}>1.25x</button>
                            </PressableHaptic>
                            <PressableHaptic onPress={() => setSpeed(1.5)}>
                                <button className="sheet-button" aria-pressed={speed === 1.5}>1.5x</button>
                            </PressableHaptic>
                            <PressableHaptic onPress={() => setSpeed(2)}>
                                <button className="sheet-button" aria-pressed={speed === 2}>2x</button>
                            </PressableHaptic>
                        </div>
                    </div>
                    <div className="sheet-row">
                        <div className="sheet-checkbox-container">
                            <span className="sheet-checkbox-text">Preserve Pitch?</span>
                            <PressableHaptic onPress={() => setPreservesPitch(!preservesPitch)}>
                                <input className="sheet-checkbox" type="checkbox" checked={preservesPitch}/>
                            </PressableHaptic>
                        </div>
                    </div>
                    <div className="sheet-row">
                        <ScalableHaptic scaleFactor={0.97} onPress={reset}>
                            <button className="sheet-apply-button">Reset</button>
                        </ScalableHaptic>
                    </div>
                </cap-sheet-content>
            </cap-sheet-view>
        </cap-sheet>
    )
}

export default SpeedSheet