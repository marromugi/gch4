import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useEnterAction } from './useEnterAction'
import type { EnterActionMode } from './type'

const createKeyboardEvent = (
  overrides: Partial<{
    key: string
    shiftKey: boolean
    isComposing: boolean
    keyCode: number
  }> = {}
) => {
  const { isComposing = false, ...rest } = overrides
  return {
    key: 'Enter',
    shiftKey: false,
    keyCode: 13,
    preventDefault: vi.fn(),
    nativeEvent: { isComposing },
    ...rest,
  } as unknown as React.KeyboardEvent
}

describe('useEnterAction', () => {
  describe('submit モード', () => {
    it('Enter で onSubmit が呼ばれる', () => {
      const onSubmit = vi.fn()
      const { result } = renderHook(() => useEnterAction({ mode: 'submit', onSubmit }))

      const event = createKeyboardEvent()
      act(() => result.current.handlers.onKeyDown(event))

      expect(onSubmit).toHaveBeenCalledOnce()
      expect(event.preventDefault).toHaveBeenCalledOnce()
    })

    it('Shift+Enter では onSubmit が呼ばれない（改行を許可）', () => {
      const onSubmit = vi.fn()
      const { result } = renderHook(() => useEnterAction({ mode: 'submit', onSubmit }))

      const event = createKeyboardEvent({ shiftKey: true })
      act(() => result.current.handlers.onKeyDown(event))

      expect(onSubmit).not.toHaveBeenCalled()
      expect(event.preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('newline モード', () => {
    it('Enter では onSubmit が呼ばれない（改行を許可）', () => {
      const onSubmit = vi.fn()
      const { result } = renderHook(() => useEnterAction({ mode: 'newline', onSubmit }))

      const event = createKeyboardEvent()
      act(() => result.current.handlers.onKeyDown(event))

      expect(onSubmit).not.toHaveBeenCalled()
      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('Shift+Enter で onSubmit が呼ばれる', () => {
      const onSubmit = vi.fn()
      const { result } = renderHook(() => useEnterAction({ mode: 'newline', onSubmit }))

      const event = createKeyboardEvent({ shiftKey: true })
      act(() => result.current.handlers.onKeyDown(event))

      expect(onSubmit).toHaveBeenCalledOnce()
      expect(event.preventDefault).toHaveBeenCalledOnce()
    })
  })

  describe('IME 変換中', () => {
    it('isComposing=true の Enter で onSubmit が呼ばれない', () => {
      const onSubmit = vi.fn()
      const { result } = renderHook(() => useEnterAction({ mode: 'submit', onSubmit }))

      const event = createKeyboardEvent({ isComposing: true })
      act(() => result.current.handlers.onKeyDown(event))

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('keyCode=229 の Enter で onSubmit が呼ばれない', () => {
      const onSubmit = vi.fn()
      const { result } = renderHook(() => useEnterAction({ mode: 'submit', onSubmit }))

      const event = createKeyboardEvent({ keyCode: 229 })
      act(() => result.current.handlers.onKeyDown(event))

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('compositionstart 後の Enter は無視され、compositionend 後は動作する', () => {
      const onSubmit = vi.fn()
      const { result } = renderHook(() => useEnterAction({ mode: 'submit', onSubmit }))

      // compositionstart → Enter は無視
      act(() => result.current.handlers.onCompositionStart())
      const event1 = createKeyboardEvent({ isComposing: true })
      act(() => result.current.handlers.onKeyDown(event1))
      expect(onSubmit).not.toHaveBeenCalled()

      // compositionend → Enter は送信
      act(() => result.current.handlers.onCompositionEnd())
      const event2 = createKeyboardEvent()
      act(() => result.current.handlers.onKeyDown(event2))
      expect(onSubmit).toHaveBeenCalledOnce()
    })

    it('composingRef フォールバック: isComposing=false でも compositionstart 中は無視', () => {
      const onSubmit = vi.fn()
      const { result } = renderHook(() => useEnterAction({ mode: 'submit', onSubmit }))

      act(() => result.current.handlers.onCompositionStart())
      // isComposing が false でも composingRef で検知
      const event = createKeyboardEvent({ isComposing: false })
      act(() => result.current.handlers.onKeyDown(event))

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('isComposing 状態が正しく公開される', () => {
      const onSubmit = vi.fn()
      const { result } = renderHook(() => useEnterAction({ mode: 'submit', onSubmit }))

      expect(result.current.isComposing).toBe(false)

      act(() => result.current.handlers.onCompositionStart())
      expect(result.current.isComposing).toBe(true)

      act(() => result.current.handlers.onCompositionEnd())
      expect(result.current.isComposing).toBe(false)
    })
  })

  describe('モード切替', () => {
    it('submit → newline に切り替わる', () => {
      const onModeChange = vi.fn()
      const { result } = renderHook(() =>
        useEnterAction({ mode: 'submit', onSubmit: vi.fn(), onModeChange })
      )

      act(() => result.current.toggleMode())
      expect(onModeChange).toHaveBeenCalledWith('newline')
    })

    it('newline → submit に切り替わる', () => {
      const onModeChange = vi.fn()
      const { result } = renderHook(() =>
        useEnterAction({ mode: 'newline', onSubmit: vi.fn(), onModeChange })
      )

      act(() => result.current.toggleMode())
      expect(onModeChange).toHaveBeenCalledWith('submit')
    })

    it('onModeChange 未指定でもエラーにならない', () => {
      const { result } = renderHook(() => useEnterAction({ mode: 'submit', onSubmit: vi.fn() }))

      expect(() => {
        act(() => result.current.toggleMode())
      }).not.toThrow()
    })
  })

  describe('エッジケース', () => {
    it('Enter 以外のキーは何も起きない', () => {
      const onSubmit = vi.fn()
      const { result } = renderHook(() => useEnterAction({ mode: 'submit', onSubmit }))

      for (const key of ['a', 'Escape', 'Tab', 'Backspace']) {
        const event = createKeyboardEvent({ key })
        act(() => result.current.handlers.onKeyDown(event))
      }

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('mode が変わると handlers の動作も変わる', () => {
      const onSubmit = vi.fn()
      let mode: EnterActionMode = 'submit'

      const { result, rerender } = renderHook(() => useEnterAction({ mode, onSubmit }))

      // submit モード: Enter で送信
      const event1 = createKeyboardEvent()
      act(() => result.current.handlers.onKeyDown(event1))
      expect(onSubmit).toHaveBeenCalledOnce()

      // newline モードに変更
      onSubmit.mockClear()
      mode = 'newline'
      rerender()

      // newline モード: Enter では送信しない
      const event2 = createKeyboardEvent()
      act(() => result.current.handlers.onKeyDown(event2))
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })
})
