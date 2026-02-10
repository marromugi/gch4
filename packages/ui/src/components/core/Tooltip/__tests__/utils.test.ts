import { describe, expect, it } from 'vitest'
import { getMotionProps } from '../utils'

describe('getMotionProps', () => {
  it('placement=top: 下方向にオフセット', () => {
    const props = getMotionProps('top')
    expect(props.initial).toEqual({ opacity: 0, y: 4 })
    expect(props.exit).toEqual({ opacity: 0, y: 4 })
    expect(props.animate).toEqual({ opacity: 1, x: 0, y: 0 })
  })

  it('placement=bottom: 上方向にオフセット', () => {
    const props = getMotionProps('bottom')
    expect(props.initial).toEqual({ opacity: 0, y: -4 })
    expect(props.exit).toEqual({ opacity: 0, y: -4 })
  })

  it('placement=left: 右方向にオフセット', () => {
    const props = getMotionProps('left')
    expect(props.initial).toEqual({ opacity: 0, x: 4 })
    expect(props.exit).toEqual({ opacity: 0, x: 4 })
  })

  it('placement=right: 左方向にオフセット', () => {
    const props = getMotionProps('right')
    expect(props.initial).toEqual({ opacity: 0, x: -4 })
    expect(props.exit).toEqual({ opacity: 0, x: -4 })
  })

  it('transition 設定が正しい', () => {
    const props = getMotionProps('top')
    expect(props.transition).toEqual({ duration: 0.15, ease: 'easeOut' })
  })
})
