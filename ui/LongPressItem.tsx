/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Tune Player - A cute music player ❤                       *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import React, {useEffect, useRef} from "react"

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    onPress?: () => void
    onLongPress: () => void
    longPressDelay?: number
}

const LongPressItem: React.FunctionComponent<Props> = ({children, onPress, onLongPress,
    longPressDelay = 500, style, ...props}) => {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const pointer = useRef<number | null>(null)
    const start = useRef({x: 0, y: 0})
    const suppressClick = useRef(false)
    const longPressed = useRef(false)

    const cancel = () => {
        if (timer.current !== null) clearTimeout(timer.current)
        timer.current = null
        pointer.current = null
    }

    useEffect(() => {
        const interrupt = () => {
            if (pointer.current === null) return
            cancel()
            suppressClick.current = true
        }
        window.addEventListener("blur", interrupt)
        return () => {
            cancel()
            window.removeEventListener("blur", interrupt)
        }
    }, [])

    const hold = () => {
        cancel()
        suppressClick.current = true
        if (!longPressed.current) {
            longPressed.current = true
            onLongPress()
        }
    }

    return (
        <div role="button" tabIndex={0} {...props}
        style={{WebkitTouchCallout: "none", userSelect: "none", touchAction: "pan-y", ...style}}
        onPointerDown={event => {
            if (event.button === 2) {
                longPressed.current = false;
                return
            }
            if (event.button !== 0 || !event.isPrimary) return
            cancel()
            pointer.current = event.pointerId
            start.current = {x: event.clientX, y: event.clientY}
            suppressClick.current = false
            longPressed.current = false
            timer.current = setTimeout(hold, longPressDelay)
        }}
        onPointerMove={event => {
            if (pointer.current !== event.pointerId) return
            if (Math.hypot(event.clientX - start.current.x, event.clientY - start.current.y) > 10) {
                cancel()
                suppressClick.current = true
            }
        }}
        onPointerUp={(event) => {
            if (pointer.current === event.pointerId) cancel()
        }}
        onPointerCancel={() => {
            if (pointer.current === null) return
            cancel()
            suppressClick.current = true
        }}
        onPointerLeave={() => {
            if (pointer.current === null) return
            cancel()
            suppressClick.current = true
        }}
        onBlur={() => {
            if (pointer.current === null) return
            cancel()
            suppressClick.current = true
        }}
        onClick={() => {
            if (!suppressClick.current) onPress?.()
        }}
        onContextMenu={(event) => {
            event.preventDefault()
            hold()
        }}
        onKeyDown={(event) => {
            if (event.repeat) return
            if (event.key === "ContextMenu") {
                event.preventDefault()
                longPressed.current = false
                hold()
            } else if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onPress?.()
            }}}>
            {children}
        </div>
    )
}

export default LongPressItem