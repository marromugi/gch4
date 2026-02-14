import { useCallback, useRef } from 'react'

export interface WebGLResources {
  gl: WebGL2RenderingContext
  program: WebGLProgram
  uniforms: Record<string, WebGLUniformLocation>
}

export function useWebGL() {
  const resourcesRef = useRef<WebGLResources | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const compileShader = useCallback(
    (gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null => {
      // コンテキストがロストしているか確認
      if (gl.isContextLost()) {
        console.warn('WebGL context is lost')
        return null
      }

      const shader = gl.createShader(type)
      if (!shader) {
        console.error('Failed to create shader object')
        return null
      }

      gl.shaderSource(shader, source)
      gl.compileShader(shader)

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const errorLog = gl.getShaderInfoLog(shader)
        const shaderType = type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT'
        console.error(`${shaderType} shader compile error:`, errorLog || 'Unknown error')
        gl.deleteShader(shader)
        return null
      }

      return shader
    },
    []
  )

  const createProgram = useCallback(
    (
      gl: WebGL2RenderingContext,
      vertexSource: string,
      fragmentSource: string
    ): WebGLProgram | null => {
      const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
      const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)

      if (!vertexShader || !fragmentShader) return null

      const program = gl.createProgram()
      if (!program) return null

      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program))
        gl.deleteProgram(program)
        return null
      }

      // シェーダーはリンク後に削除可能
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)

      return program
    },
    [compileShader]
  )

  const initGL = useCallback(
    (
      canvas: HTMLCanvasElement,
      vertexSource: string,
      fragmentSource: string
    ): WebGLResources | null => {
      // 同じcanvasで既に初期化済みならそれを返す
      if (resourcesRef.current && canvasRef.current === canvas) {
        const gl = resourcesRef.current.gl
        if (!gl.isContextLost()) {
          return resourcesRef.current
        }
      }

      // 新しいコンテキストを取得
      const gl = canvas.getContext('webgl2', {
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
      })

      if (!gl) {
        console.warn('WebGL2 not supported')
        return null
      }

      const program = createProgram(gl, vertexSource, fragmentSource)
      if (!program) return null

      // フルスクリーンクアッドの頂点バッファを設定
      const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
      const positionBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

      const positionLocation = gl.getAttribLocation(program, 'a_position')
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      // uniform locations を取得
      const uniforms: Record<string, WebGLUniformLocation> = {}
      const uniformNames = ['u_time', 'u_resolution']

      for (const name of uniformNames) {
        const location = gl.getUniformLocation(program, name)
        if (location) {
          uniforms[name] = location
        }
      }

      // ブレンディング設定（透明度対応）
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      const resources: WebGLResources = { gl, program, uniforms }
      resourcesRef.current = resources
      canvasRef.current = canvas

      return resources
    },
    [createProgram]
  )

  const cleanup = useCallback(() => {
    const resources = resourcesRef.current
    if (!resources) return

    const { gl, program } = resources

    // コンテキストがまだ有効な場合のみクリーンアップ
    if (!gl.isContextLost()) {
      gl.deleteProgram(program)
    }

    resourcesRef.current = null
    canvasRef.current = null
  }, [])

  return { resourcesRef, initGL, cleanup }
}
