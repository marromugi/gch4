import { motion } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from '../../../lib/utils'
import { tab } from './const'
import type { TabProps } from './type'

export const Tab = ({
  items,
  value,
  onChange,
  minWidth,
  size = 'md',
  className,
  ...props
}: TabProps) => {
  const styles = tab({ size })
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [pillLayout, setPillLayout] = useState<{
    left: number
    width: number
    height: number
  } | null>(null)

  useLayoutEffect(() => {
    const trigger = triggerRefs.current.get(value)
    if (!trigger) return

    setPillLayout({
      left: trigger.offsetLeft,
      width: trigger.offsetWidth,
      height: trigger.offsetHeight,
    })
  }, [value, items, size])

  return (
    <div ref={rootRef} role="tablist" className={cn(styles.root(), className)} {...props}>
      {pillLayout && (
        <motion.span
          className={styles.pill()}
          initial={false}
          animate={{
            left: pillLayout.left,
            width: pillLayout.width,
            height: pillLayout.height,
          }}
          transition={{
            type: 'spring',
            bounce: 0.15,
            duration: 0.4,
          }}
        />
      )}
      {items.map((item) => {
        const isActive = item.value === value

        return (
          <button
            key={item.value}
            ref={(el) => {
              if (el) triggerRefs.current.set(item.value, el)
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={cn(styles.trigger(), isActive && styles.triggerActive())}
            style={minWidth ? { minWidth } : undefined}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
