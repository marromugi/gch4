import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTooltip } from './useTooltip'

describe('useTooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delay=0 で即時 open/close', () => {
    const { result } = renderHook(() => useTooltip({ delay: 0, disabled: false }))

    expect(result.current.isOpen).toBe(false)

    act(() => result.current.handleOpen())
    expect(result.current.isOpen).toBe(true)

    act(() => result.current.handleClose())
    expect(result.current.isOpen).toBe(false)
  })

  it('delay=500 で setTimeout 経由の open', () => {
    const { result } = renderHook(() => useTooltip({ delay: 500, disabled: false }))

    act(() => result.current.handleOpen())
    expect(result.current.isOpen).toBe(false)

    act(() => vi.advanceTimersByTime(499))
    expect(result.current.isOpen).toBe(false)

    act(() => vi.advanceTimersByTime(1))
    expect(result.current.isOpen).toBe(true)
  })

  it('delay 中に close すると open がキャンセルされる', () => {
    const { result } = renderHook(() => useTooltip({ delay: 500, disabled: false }))

    act(() => result.current.handleOpen())
    act(() => vi.advanceTimersByTime(200))
    act(() => result.current.handleClose())
    act(() => vi.advanceTimersByTime(300))

    expect(result.current.isOpen).toBe(false)
  })

  it('ウォームアップ: close 直後の re-open で delay スキップ', () => {
    const { result } = renderHook(() => useTooltip({ delay: 500, disabled: false }))

    // 初回: delay を待って open
    act(() => result.current.handleOpen())
    act(() => vi.advanceTimersByTime(500))
    expect(result.current.isOpen).toBe(true)

    // close
    act(() => result.current.handleClose())
    expect(result.current.isOpen).toBe(false)

    // 300ms 以内に re-open → 即時表示
    act(() => vi.advanceTimersByTime(100))
    act(() => result.current.handleOpen())
    expect(result.current.isOpen).toBe(true)
  })

  it('ウォームアップ: 300ms 以上経過後は delay が適用される', () => {
    const { result } = renderHook(() => useTooltip({ delay: 500, disabled: false }))

    // 初回 open → close
    act(() => result.current.handleOpen())
    act(() => vi.advanceTimersByTime(500))
    act(() => result.current.handleClose())

    // 300ms 以上経過
    act(() => vi.advanceTimersByTime(400))
    act(() => result.current.handleOpen())
    expect(result.current.isOpen).toBe(false)

    act(() => vi.advanceTimersByTime(500))
    expect(result.current.isOpen).toBe(true)
  })

  it('disabled=true で open が無効化される', () => {
    const { result } = renderHook(() => useTooltip({ delay: 0, disabled: true }))

    act(() => result.current.handleOpen())
    expect(result.current.isOpen).toBe(false)
  })

  it('tooltipId が文字列として返される', () => {
    const { result } = renderHook(() => useTooltip({ delay: 0, disabled: false }))
    expect(typeof result.current.tooltipId).toBe('string')
    expect(result.current.tooltipId.length).toBeGreaterThan(0)
  })
})
