/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Tune Player - A cute music player ❤                       *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import React, {useEffect, useRef} from "react"
import Slider from "react-slider"
import {usePlaybackSelector, usePlaybackActions} from "../store"
import SawtoothIcon from "../assets/svg/sawtooth.svg"
import FXIcon from "../assets/svg/fx.svg"
import EQIcon from "../assets/svg/eq.svg"
import SquareIcon from "../assets/svg/square.svg"
import TriangleIcon from "../assets/svg/triangle.svg"
import SineIcon from "../assets/svg/sine.svg"
import ScalableHaptic from "../ui/ScalableHaptic"
import "./styles/specialfxpopup.less"

interface Props {
    onClose: () => void
    tab: string
    onTabChange: (tab: string) => void
}

const SynthTab = () => {
    const {
        basicWave, waveType,
        poly, portamento, 
        attack, decay, 
        sustain, release
    } = usePlaybackSelector()
    const {
        setWave, setBasicWave, setWaveType,
        setPoly, setPortamento,
        setAttack, setDecay, 
        setSustain, setRelease
    } = usePlaybackActions()

    const changeWave = (basicWave: string, type = waveType) => {
        const wave = waveType === "pulse" || waveType === "pwm" ? waveType :
            `${waveType === "basic" ? "" : waveType}${basicWave}`
        setBasicWave(basicWave)
        setWaveType(type)
        setWave(wave)
    }

    const reset = () => {
        changeWave("square", "basic")
        setAttack(0.02)
        setDecay(0.5)
        setSustain(0.3)
        setRelease(0.5)
        setPoly(true)
        setPortamento(0)
    }

    return (
        <>
        <div className="special-fx-wave-row">
            <button className="special-fx-wave" aria-pressed={basicWave === "sawtooth"} onClick={() => changeWave("sawtooth")}>
                <SawtoothIcon className="special-fx-wave-icon"/>
            </button>
            <button className="special-fx-wave" aria-pressed={basicWave === "square"} onClick={() => changeWave("square")}>
                <SquareIcon className="special-fx-wave-icon"/>
            </button>
            <button className="special-fx-wave" aria-pressed={basicWave === "triangle"} onClick={() => changeWave("triangle")}>
                <TriangleIcon className="special-fx-wave-icon"/>
            </button>
            <button className="special-fx-wave" aria-pressed={basicWave === "sine"} onClick={() => changeWave("sine")}>
                <SineIcon className="special-fx-wave-icon"/>
            </button>
        </div>
        <div className="special-fx-wavetype-row">
            <button className="special-fx-wavetype" aria-pressed={waveType === "basic"} 
                style={{backgroundColor: "#ff5e97"}} onClick={() => changeWave(basicWave, "basic")}>
                Basic
            </button>
            <button className="special-fx-wavetype" aria-pressed={waveType === "am"} 
                style={{backgroundColor: "#ff5ecc"}} onClick={() => changeWave(basicWave, "am")}>
                AM
            </button>
            <button className="special-fx-wavetype" aria-pressed={waveType === "fm"} 
                style={{backgroundColor: "#fa75ff"}} onClick={() => changeWave(basicWave, "fm")}>
                FM
            </button>
            <button className="special-fx-wavetype" aria-pressed={waveType === "fat"} 
                style={{backgroundColor: "#75b1ff"}} onClick={() => changeWave(basicWave, "fat")}>
                Fat
            </button>
            <button className="special-fx-wavetype" aria-pressed={waveType === "pulse"} 
                style={{backgroundColor: "#6b81ff"}} onClick={() => changeWave(basicWave, "pulse")}>
                Pulse
            </button>
            <button className="special-fx-wavetype" aria-pressed={waveType === "pwm"} 
                style={{backgroundColor: "#b35cff"}} onClick={() => changeWave(basicWave, "pwm")}>
                PWM
            </button>
        </div>
        <div className="special-fx-poly-row">
            <button className="special-fx-poly" onClick={() => setPoly(!poly)}
                style={{backgroundColor: poly ? "#ff5cab" : "#ff78f8"}}>
                {poly ? "Poly" : "Mono"}
            </button>
            <div className="special-fx-control">
                <span className="special-fx-label">Portamento</span>
                <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
                min={0} max={0.2} step={0.01} value={portamento} onChange={setPortamento}/>
            </div>
        </div>
        <div className="special-fx-control">
            <span className="special-fx-label">Attack</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={0} max={0.5} step={0.02} value={attack} onChange={setAttack}/>
        </div>
        <div className="special-fx-control">
            <span className="special-fx-label">Decay</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={0} max={2} step={0.05} value={decay} onChange={setDecay}/>
        </div>
        <div className="special-fx-control">
            <span className="special-fx-label">Sustain</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={0} max={1} step={0.02} value={sustain} onChange={setSustain}/>
        </div>
        <div className="special-fx-control">
            <span className="special-fx-label">Release</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={0} max={2} step={0.05} value={release} onChange={setRelease}/>
        </div>
        <ScalableHaptic scaleFactor={0.97} onPress={reset}>
            <button className="special-fx-reset">Reset</button>
        </ScalableHaptic>
        </>
    )
}

const EQTab = () => {
    const {
        lowpassCutoff, highpassCutoff,
        filterResonance, filterSlope,
        highshelfCutoff, highshelfGain,
        lowshelfCutoff, lowshelfGain
    } = usePlaybackSelector()
    const {
        setLowpassCutoff, setHighpassCutoff,
        setFilterResonance, setFilterSlope,
        setHighshelfCutoff, setHighshelfGain,
        setLowshelfCutoff, setLowshelfGain
    } = usePlaybackActions()

    const reset = () => {
        setLowpassCutoff(100)
        setHighpassCutoff(0)
        setHighshelfCutoff(70)
        setLowshelfCutoff(30)
        setLowshelfGain(0)
        setFilterResonance(6)
        setFilterSlope(0)
    }

    return (
        <>
        <div className="special-fx-control">
            <span className="special-fx-label">Lowpass</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={0} max={100} step={1} value={lowpassCutoff} onChange={setLowpassCutoff}/>
        </div>
        <div className="special-fx-control">
            <span className="special-fx-label">Highpass</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={0} max={100} step={1} value={highpassCutoff} onChange={setHighpassCutoff}/>
        </div>
        <div className="special-fx-control">
            <span className="special-fx-label">Resonance</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={0} max={20} step={1} value={filterResonance} onChange={setFilterResonance}/>
        </div>
        <div className="special-fx-control">
            <span className="special-fx-label">Slope</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={0} max={3} step={1} value={filterSlope} onChange={setFilterSlope}/>
        </div>
        <div className="special-fx-control">
            <span className="special-fx-label">Highshelf Freq</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={0} max={100} step={1} value={highshelfCutoff} onChange={setHighshelfCutoff}/>
        </div>
        <div className="special-fx-control">
            <span className="special-fx-label">Highshelf Gain</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={-12} max={12} step={1} value={highshelfGain} onChange={setHighshelfGain}/>
        </div>
        <div className="special-fx-control">
            <span className="special-fx-label">Lowshelf Freq</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={0} max={100} step={1} value={lowshelfCutoff} onChange={setLowshelfCutoff}/>
        </div>
        <div className="special-fx-control">
            <span className="special-fx-label">Lowshelf Gain</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={-12} max={12} step={1} value={lowshelfGain} onChange={setLowshelfGain}/>
        </div>
        <ScalableHaptic scaleFactor={0.97} onPress={reset}>
            <button className="special-fx-reset">Reset</button>
        </ScalableHaptic>
        </>
    )
}

const FXTab = () => {
    const {
        sampleRate, reverbMix, reverbDecay,
        delayMix, delayTime, delayFeedback,
        phaserMix, phaserFrequency
    } = usePlaybackSelector()
    const {
        setSampleRate, setReverbMix, setReverbDecay,
        setDelayMix, setDelayTime, setDelayFeedback,
        setPhaserMix, setPhaserFrequency
    } = usePlaybackActions()

    const reset = () => {
        setSampleRate(100)
        setReverbMix(0)
        setReverbDecay(1.5)
        setDelayMix(0)
        setDelayTime(0.25)
        setDelayFeedback(0.3)
        setPhaserMix(0)
        setPhaserFrequency(1)
    }

    return (
        <>
        <div className="special-fx-control">
            <span className="special-fx-label">Sample Rate</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={0} max={100} step={1} value={sampleRate} onChange={setSampleRate}/>
        </div>
        <div className="special-fx-control">
            <span className="special-fx-label">Reverb Mix</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={0} max={1} step={0.1} value={reverbMix} onChange={setReverbMix}/>
        </div>
        <div className="special-fx-control">
            <span className="special-fx-label">Reverb Decay</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={0.1} max={5} step={0.1} value={reverbDecay} onChange={setReverbDecay}/>
        </div>
        <div className="special-fx-control">
            <span className="special-fx-label">Delay Mix</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={0} max={1} step={0.1} value={delayMix} onChange={setDelayMix}/>
        </div>
        <div className="special-fx-control">
            <span className="special-fx-label">Delay Time</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={0.1} max={1} step={0.05} value={delayTime} onChange={setDelayTime}/>
        </div>
        <div className="special-fx-control">
            <span className="special-fx-label">Delay Feedback</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={0.1} max={0.9} step={0.1} value={delayFeedback} onChange={setDelayFeedback}/>
        </div>
        <div className="special-fx-control">
            <span className="special-fx-label">Phaser Mix</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={0} max={1} step={0.1} value={phaserMix} onChange={setPhaserMix}/>
        </div>
        <div className="special-fx-control">
            <span className="special-fx-label">Phaser Frequency</span>
            <Slider className="special-fx-slider" trackClassName="special-fx-slider-track" thumbClassName="special-fx-slider-handle"
            min={1} max={10} step={1} value={phaserFrequency} onChange={setPhaserFrequency}/>
        </div>
        <ScalableHaptic scaleFactor={0.97} onPress={reset}>
            <button className="special-fx-reset">Reset</button>
        </ScalableHaptic>
        </>
    )
}

const SpecialFXPopup: React.FunctionComponent<Props> = (props) => {
    const {tab, onTabChange: setTab} = props
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        dialogRef.current?.showModal()
        return () => dialogRef.current?.close()
    }, [])

    const onClick = (event: React.MouseEvent<HTMLDialogElement>) => {
        const bounds = event.currentTarget.getBoundingClientRect()
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) event.currentTarget.close()
    }

    const generateTabJSX = () => {
        if (tab === "synth") return <SynthTab/>
        if (tab === "eq") return <EQTab/>
        if (tab === "fx") return <FXTab/>
    }

    return (
        <dialog ref={dialogRef} className="special-fx-popup" onClose={props.onClose} onClick={onClick}>
            <div className="special-fx-top">
                <button className="special-fx-close" onClick={() => dialogRef.current?.close()}>×</button>
            </div>
            <div className="special-fx-tabs">
                <button className="special-fx-tab" aria-selected={tab === "synth"} onClick={() => setTab("synth")}>
                    <SawtoothIcon className="special-fx-icon"/>
                </button>
                <button className="special-fx-tab" aria-selected={tab === "eq"} onClick={() => setTab("eq")}>
                    <EQIcon className="special-fx-icon"/>
                </button>
                <button className="special-fx-tab" aria-selected={tab === "fx"} onClick={() => setTab("fx")}>
                    <FXIcon className="special-fx-icon"/>
                </button>
            </div>  
            <div className="special-fx-panel">
                {generateTabJSX()}
            </div>
        </dialog>
    )
}

export default SpecialFXPopup