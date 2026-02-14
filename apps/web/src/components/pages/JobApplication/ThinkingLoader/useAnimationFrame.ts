import { useEffect, useRef } from 'react'

export function useAnimationFrame(callback: (time: number) => void) {
  const rafRef = useRef<number>(0)
  const callbackRef = useRef(callback)

  // 最新のcallbackを参照
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const animate = (time: number) => {
      callbackRef.current(time)
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])
}
