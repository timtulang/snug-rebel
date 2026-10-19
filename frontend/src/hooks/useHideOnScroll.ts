import { useEffect, useState } from 'react'

type Options = {
  /** Never hide within this many px of the top. Keep it >= the nav height. */
  hideAfter?: number
  /** How far (px) the user must scroll UP before the bar comes back. */
  revealAfter?: number
}

/** True while the bar should be hidden: scrolling down, or not yet scrolled up far enough. */
export function useHideOnScroll({ hideAfter = 100, revealAfter = 120 }: Options = {}) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    let upTravel = 0
    let ticking = false

    const update = () => {
      const y = Math.max(window.scrollY, 0)
      const delta = y - lastY
      lastY = y

      if (y <= hideAfter) {
        upTravel = 0
        setHidden(false)
      } else if (delta > 0) {
        upTravel = 0
        setHidden(true)
      } else if (delta < 0) {
        upTravel -= delta
        if (upTravel >= revealAfter) setHidden(false)
      }
      ticking = false
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hideAfter, revealAfter])

  return hidden
}