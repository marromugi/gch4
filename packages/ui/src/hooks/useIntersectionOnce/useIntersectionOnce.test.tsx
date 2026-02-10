import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useIntersectionOnce } from './useIntersectionOnce'

// IntersectionObserver のモック
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()
let intersectionCallback: IntersectionObserverCallback | null = null

beforeEach(() => {
  vi.clearAllMocks()
  intersectionCallback = null

  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null
    readonly rootMargin: string = ''
    readonly thresholds: ReadonlyArray<number> = []

    constructor(callback: IntersectionObserverCallback) {
      intersectionCallback = callback
    }

    observe = mockObserve
    disconnect = mockDisconnect
    unobserve = vi.fn()
    takeRecords = vi.fn(() => [])
  }

  global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
})

afterEach(() => {
  vi.restoreAllMocks()
})

// テスト用のコンポーネント
function TestComponent({
  onIntersect,
  disabled = false,
}: {
  onIntersect: () => void
  disabled?: boolean
}) {
  const { ref, hasTriggered, reset } = useIntersectionOnce({
    onIntersect,
    disabled,
  })

  return (
    <div>
      <div ref={ref} data-testid="sentinel" />
      <span data-testid="triggered">{hasTriggered ? 'true' : 'false'}</span>
      <button type="button" onClick={reset} data-testid="reset">
        Reset
      </button>
    </div>
  )
}

describe('useIntersectionOnce', () => {
  describe('基本動作', () => {
    it('交差検知時に onIntersect が1回だけ呼ばれる', () => {
      const onIntersect = vi.fn()
      render(<TestComponent onIntersect={onIntersect} />)

      expect(mockObserve).toHaveBeenCalled()
      expect(intersectionCallback).not.toBeNull()

      // 交差を検知
      act(() => {
        intersectionCallback?.(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        )
      })

      expect(onIntersect).toHaveBeenCalledOnce()

      // 再度交差しても呼ばれない
      act(() => {
        intersectionCallback?.(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        )
      })

      expect(onIntersect).toHaveBeenCalledOnce()
    })

    it('isIntersecting が false の場合は呼ばれない', () => {
      const onIntersect = vi.fn()
      render(<TestComponent onIntersect={onIntersect} />)

      act(() => {
        intersectionCallback?.(
          [{ isIntersecting: false } as IntersectionObserverEntry],
          {} as IntersectionObserver
        )
      })

      expect(onIntersect).not.toHaveBeenCalled()
    })

    it('hasTriggered が正しく更新される', () => {
      const onIntersect = vi.fn()
      render(<TestComponent onIntersect={onIntersect} />)

      expect(screen.getByTestId('triggered').textContent).toBe('false')

      act(() => {
        intersectionCallback?.(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        )
      })

      expect(screen.getByTestId('triggered').textContent).toBe('true')
    })
  })

  describe('reset', () => {
    it('reset を呼ぶと再度検知可能になる', () => {
      const onIntersect = vi.fn()
      render(<TestComponent onIntersect={onIntersect} />)

      // 1回目の交差
      act(() => {
        intersectionCallback?.(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        )
      })
      expect(onIntersect).toHaveBeenCalledOnce()
      expect(screen.getByTestId('triggered').textContent).toBe('true')

      // リセット
      act(() => {
        screen.getByTestId('reset').click()
      })
      expect(screen.getByTestId('triggered').textContent).toBe('false')

      // 2回目の交差
      act(() => {
        intersectionCallback?.(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        )
      })
      expect(onIntersect).toHaveBeenCalledTimes(2)
    })
  })

  describe('disabled', () => {
    it('disabled=true の場合は observer が設定されない', () => {
      const onIntersect = vi.fn()
      render(<TestComponent onIntersect={onIntersect} disabled />)

      expect(mockObserve).not.toHaveBeenCalled()
    })
  })

  describe('cleanup', () => {
    it('unmount 時に disconnect が呼ばれる', () => {
      const onIntersect = vi.fn()
      const { unmount } = render(<TestComponent onIntersect={onIntersect} />)

      expect(mockObserve).toHaveBeenCalled()

      unmount()

      expect(mockDisconnect).toHaveBeenCalled()
    })
  })
})
