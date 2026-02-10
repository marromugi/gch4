import { forwardRef, useCallback, useState } from 'react'
import { cn } from '../../../lib'
import { image } from './const'
import type { ImageProps } from './type'

const spinnerKeyframes = `
@keyframes image-spinner-dash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}
@keyframes image-spinner-rotate {
  100% { transform: rotate(360deg); }
}
`

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <style>{spinnerKeyframes}</style>
      <svg
        className="h-10 w-10"
        viewBox="0 0 50 50"
        style={{ animation: 'image-spinner-rotate 2s linear infinite' }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          className="/20"
          style={{
            animation: 'image-spinner-dash 1.5s ease-in-out infinite',
          }}
        />
      </svg>
    </div>
  )
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  (
    { alt, src, radius, objectFit, isLoading, fallback, className, onLoad, onError, ...props },
    ref
  ) => {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

    const handleLoad = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        setStatus('loaded')
        onLoad?.(e)
      },
      [onLoad]
    )

    const handleError = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        setStatus('error')
        onError?.(e)
      },
      [onError]
    )

    const isImageLoading = isLoading ?? status === 'loading'
    const isError = status === 'error'

    if (isError && fallback) {
      return <>{fallback}</>
    }

    const ariaProps = alt === '' ? { role: 'presentation' as const } : {}

    return (
      <div className={cn('relative inline-flex overflow-hidden', image({ radius }), className)}>
        <img
          ref={ref}
          src={src}
          alt={alt}
          className={cn(
            'h-full w-full',
            image({ objectFit }),
            isImageLoading && 'opacity-0',
            !isImageLoading && 'opacity-100'
          )}
          onLoad={handleLoad}
          onError={handleError}
          {...ariaProps}
          {...props}
        />
        {isImageLoading && <LoadingSpinner />}
      </div>
    )
  }
)
