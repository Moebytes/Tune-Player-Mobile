/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Tune Player - A cute music player ❤                       *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import React, {useEffect, useRef, useState} from "react"
import {Haptics, ImpactStyle, NotificationType} from "@capacitor/haptics"

type HapticFeedbackType =
    | "impactLight"
    | "impactMedium"
    | "impactHeavy"
    | "selection"
    | "notificationSuccess"
    | "notificationWarning"
    | "notificationError"

interface RenderProps {
    pressed: boolean
    colorAnim: number
}

interface Props extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "style" | "color"> {
    children?: React.ReactNode | ((props: RenderProps) => React.ReactNode)
    icon?: React.ComponentType<{
        width: number
        height: number
        color: string
    }>
    size?: number
    color?: string
    activeColor?: string
    scaleFactor?: number
    containerStyle?: React.CSSProperties
    style?: React.CSSProperties
    hapticType?: HapticFeedbackType
    onLongPress?: () => void
    longPressDelay?: number
    onPress?: React.PointerEventHandler<HTMLButtonElement>
    onPressIn?: (event: React.PointerEvent<HTMLButtonElement>) => void
    onPressOut?: (event: React.PointerEvent<HTMLButtonElement>) => void
}

const ScalableHaptic: React.FunctionComponent<Props> = ({children, onPressIn,
    onPressOut, onPress, onLongPress, longPressDelay = 500, onBlur, icon: Icon, size = 0, color = "", activeColor,
    scaleFactor = 0.85, containerStyle, style, hapticType = "impactMedium", ...props}) => {
    const [pressed, setPressed] = useState(false)
    const pressedRef = useRef(false)
    const pointerIdRef = useRef<number | null>(null)
    const pointerTarget = useRef<HTMLButtonElement | null>(null)

    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const longPressed = useRef(false)
    const clearLongPress = () => {
        if (longPressTimer.current !== null) clearTimeout(longPressTimer.current)
        longPressTimer.current = null
    }

    const resetPress = () => {
        clearLongPress()
        const target = pointerTarget.current
        const pointerId = pointerIdRef.current
        pressedRef.current = false
        pointerIdRef.current = null
        pointerTarget.current = null
        setPressed(false)
        if (target && pointerId !== null && target.hasPointerCapture(pointerId)) {
            target.releasePointerCapture(pointerId)
        }
    }

    useEffect(() => {
        window.addEventListener("blur", resetPress)
        return () => {
            clearLongPress()
            window.removeEventListener("blur", resetPress)
        }
    }, [])

    useEffect(() => {
        if (props.disabled) resetPress()
    }, [props.disabled])

    const triggerHaptic = async () => {
        switch (hapticType) {
            case "impactLight":
                await Haptics.impact({style: ImpactStyle.Light})
                break
            case "impactMedium":
                await Haptics.impact({style: ImpactStyle.Medium})
                break
            case "impactHeavy":
                await Haptics.impact({style: ImpactStyle.Heavy})
                break
            case "selection":
                await Haptics.selectionChanged()
                break
            case "notificationSuccess":
                await Haptics.notification({type: NotificationType.Success})
                break
            case "notificationWarning":
                await Haptics.notification({type: NotificationType.Warning})
                break
            case "notificationError":
                await Haptics.notification({type: NotificationType.Error})
                break
        }
    }

    const pressIn = (event: React.PointerEvent<HTMLButtonElement>) => {
        if (props.disabled) return
        resetPress()
        pressedRef.current = true
        pointerIdRef.current = event.pointerId
        pointerTarget.current = event.currentTarget
        event.currentTarget.setPointerCapture(event.pointerId)

        setPressed(true)
        longPressed.current = false
        if (onLongPress) {
            longPressTimer.current = setTimeout(() => {
                longPressTimer.current = null
                longPressed.current = true
                resetPress()
                triggerHaptic()
                onLongPress()
            }, longPressDelay)
        }
        triggerHaptic()
        onPressIn?.(event)
    }

    const pressOut = (event: React.PointerEvent<HTMLButtonElement>, cancelled = false) => {
        if (!pressedRef.current || pointerIdRef.current !== event.pointerId) return
        const wasLongPress = longPressed.current
        resetPress()
        onPressOut?.(event)

        if (!cancelled && !wasLongPress && !props.disabled) {
            onPress?.(event)
        }
    }

    return (
        <button type="button" {...props}
            onPointerDown={(event) => {
                if (event.button === 0 && event.isPrimary && !props.disabled) {
                    pressIn(event)
                }
            }}
            onPointerUp={(event) => pressOut(event)}
            onPointerCancel={(event) => pressOut(event, true)}
            onLostPointerCapture={(event) => pressOut(event, true)}
            onBlur={(event) => {
                resetPress()
                onBlur?.(event)
            }}
            style={{
                border: "none", background: "transparent",
                padding: 10, margin: -10, cursor: "pointer",
                touchAction: "manipulation", width: "100%",
                WebkitTapHighlightColor: "transparent",
                ...containerStyle,
            }}>
            <div style={{
                    transform: `scale(${pressed ? scaleFactor : 1})`,
                    transition: "transform 100ms ease",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", ...style,
                }}>
                {Icon && (
                    <Icon width={size} height={size}
                    color={pressed && activeColor ? activeColor : color}/>
                )}
                {typeof children === "function"
                    ? children({pressed, colorAnim: pressed ? 1 : 0})
                    : children}
            </div>
        </button>
    )
}

export default ScalableHaptic