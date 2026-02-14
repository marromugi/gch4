import { cn } from '@ding/ui/lib'
import { motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { thinkingLoader } from './const'
import { FRAGMENT_SHADER, VERTEX_SHADER } from './shaders'
import { useAnimationFrame } from './useAnimationFrame'
import { useWebGL } from './useWebGL'
import type { ThinkingLoaderProps } from './type'

export function ThinkingLoader({ size = 32, className }: ThinkingLoaderProps) {
  const styles = thinkingLoader()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [webglSupported, setWebglSupported] = useState(true)
  const { resourcesRef, initGL, cleanup } = useWebGL()

  // WebGL初期化
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resources = initGL(canvas, VERTEX_SHADER, FRAGMENT_SHADER)
    if (!resources) {
      setWebglSupported(false)
      return
    }

    return cleanup
  }, [initGL, cleanup])

  // アニメーションループ
  const render = useCallback(
    (time: number) => {
      const resources = resourcesRef.current
      if (!resources) return

      const { gl, program, uniforms } = resources

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.useProgram(program)

      // uniform更新
      if (uniforms.u_time) {
        gl.uniform1f(uniforms.u_time, time)
      }
      if (uniforms.u_resolution) {
        gl.uniform2f(uniforms.u_resolution, gl.canvas.width, gl.canvas.height)
      }

      // 描画
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    },
    [resourcesRef]
  )

  useAnimationFrame(render)

  // devicePixelRatio対応
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const canvasSize = size * dpr

  return (
    <motion.div
      className={cn(styles.wrapper(), className)}
      initial={{ opacity: 0, scale: 0.95, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className={styles.bubble()}>
        {webglSupported ? (
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            className={styles.canvas()}
            style={{
              width: size,
              height: size,
              color: 'currentColor',
            }}
            aria-label="考え中"
            role="img"
          />
        ) : (
          <FallbackDots styles={styles} />
        )}
      </div>
    </motion.div>
  )
}

// CSSフォールバック（WebGL非対応環境用）
function FallbackDots({ styles }: { styles: ReturnType<typeof thinkingLoader> }) {
  return (
    <div className={styles.fallback()} aria-label="考え中" role="img">
      <span className={styles.dot()} style={{ animationDelay: '0ms' }} />
      <span className={styles.dot()} style={{ animationDelay: '150ms' }} />
      <span className={styles.dot()} style={{ animationDelay: '300ms' }} />
    </div>
  )
}
