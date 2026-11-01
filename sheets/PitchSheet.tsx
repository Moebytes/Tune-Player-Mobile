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

const PitchSheet: React.FunctionComponent = () => {
    const {showPitchSheet} = useSheetSelector()
    const {setShowPitchSheet} = useSheetActions()
    const {pitch, pitchLFO, pitchLFORate, splitBands, splitBandFreq} = usePlaybackSelector()
    const {setPitch, setPitchLFO, setPitchLFORate, setSplitBands, setSplitBandFreq} = usePlaybackActions()
    const sheet = useRef<HTMLElement>(null)

    useEffect(() => {
        if (showPitchSheet) {
            presentSheet("pitch-sheet")

            setShowPitchSheet(false)
        }
    }, [showPitchSheet])

    const reset = () => {
        setPitch(0)
        setPitchLFO(false)
        setPitchLFORate(1)
        setSplitBands(false)
        setSplitBandFreq(500)
    }

    const getLFORate = () => {
        if (pitchLFORate === 5) return "1/1"
        if (pitchLFORate === 4) return "1/2"
        if (pitchLFORate === 3) return "1/4"
        if (pitchLFORate === 2) return "1/8"
        if (pitchLFORate === 1) return "1/16"
        if (pitchLFORate === 0) return "1/32"
        return "1/16"
    }

    return (
        <cap-sheet id="pitch-sheet" ref={sheet} content-placement="bottom">
            <cap-sheet-view>
                <cap-sheet-backdrop/>
                <cap-sheet-content className="sheet">
                    <div className="sheet-solid-background"/>
                    <div className="sheet-row">
                        <span className="sheet-title">Pitch</span>
                    </div>
                    <div className="sheet-row">
                        <span className="sheet-big-text">{pitch >= 0 ? `+${pitch}` : pitch} semitones</span>
                    </div>
                    <div className="sheet-row">
                        <div className="sheet-slider-container">
                            <Slider className="sheet-slider" trackClassName="sheet-slider-track" thumbClassName="sheet-slider-handle"
                            min={-24} max={24} step={1} onChange={(value: number) => setPitch(value)} value={pitch}/>

                            <div className="sheet-slider-text-container">
                                <span className="sheet-slider-text">-24</span>
                                <span className="sheet-slider-text">+24</span>
                            </div>
                        </div>
                    </div>
                    <div className="sheet-row">
                        <div className="sheet-button-container">
                            <PressableHaptic onPress={() => setPitch(-12)}>
                                <button className="sheet-button2" aria-pressed={pitch === -12}>-12</button>
                            </PressableHaptic>
                            <PressableHaptic onPress={() => setPitch(-7)}>
                                <button className="sheet-button2" aria-pressed={pitch === -7}>-7</button>
                            </PressableHaptic>
                            <PressableHaptic onPress={() => setPitch(0)}>
                                <button className="sheet-button2" aria-pressed={pitch === 0}>0</button>
                            </PressableHaptic>
                            <PressableHaptic onPress={() => setPitch(7)}>
                                <button className="sheet-button2" aria-pressed={pitch === 7}>+7</button>
                            </PressableHaptic>
                            <PressableHaptic onPress={() => setPitch(12)}>
                                <button className="sheet-button2" aria-pressed={pitch === 12}>+12</button>
                            </PressableHaptic>
                        </div>
                    </div>
                    <div className="sheet-row">
                        <div className="sheet-mini-container">
                            <span className="sheet-checkbox-text">LFO?</span>
                            <PressableHaptic onPress={() => setPitchLFO(!pitchLFO)}>
                                <input className="sheet-checkbox" type="checkbox" checked={pitchLFO}/>
                            </PressableHaptic>

                            <Slider className="sheet-mini-slider" trackClassName="sheet-mini-slider-track" thumbClassName="sheet-mini-slider-handle"
                            min={0} max={5} step={1} onChange={(value: number) => setPitchLFORate(value)} value={pitchLFORate}/>
                            <span className="sheet-mini-slider-text">{getLFORate()}</span>
                        </div>
                    </div>
                    <div className="sheet-row">
                        <div className="sheet-mini-container">
                            <span className="sheet-checkbox-text">Multiband?</span>
                            <PressableHaptic onPress={() => setSplitBands(!splitBands)}>
                                <input className="sheet-checkbox" type="checkbox" checked={splitBands}/>
                            </PressableHaptic>

                            <Slider className="sheet-mini-slider" trackClassName="sheet-mini-slider-track" thumbClassName="sheet-mini-slider-handle"
                            min={0} max={1000} step={1} onChange={(value: number) => setSplitBandFreq(value)} value={splitBandFreq}/>
                            <span className="sheet-mini-slider-text">{splitBandFreq}Hz</span>
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

export default PitchSheet