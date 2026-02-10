import type { PopoverPlacement } from './type'

/** placement に応じた motion アニメーションの初期/終了値を返す */
export const getMotionProps = (placement: PopoverPlacement) => {
  const distance = 4
  const axis = {
    top: { y: distance },
    bottom: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  }

  return {
    initial: { opacity: 0, ...axis[placement] },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, ...axis[placement] },
    transition: { duration: 0.15, ease: 'easeOut' as const },
  }
}
