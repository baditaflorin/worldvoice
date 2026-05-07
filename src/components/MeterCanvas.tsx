import { useEffect, useRef } from 'react'
import type { EngineMetrics } from '../features/audio/audioEngine'
import { getPreset, type EngineSettings } from '../features/audio/presets'

interface MeterCanvasProps {
  metrics: EngineMetrics
  settings: EngineSettings
}

export function MeterCanvas({ metrics, settings }: MeterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const preset = getPreset(settings.presetId)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    let frame = 0
    let rafId = 0

    const render = () => {
      const rect = canvas.getBoundingClientRect()
      const pixelRatio = window.devicePixelRatio || 1
      const width = Math.max(1, Math.floor(rect.width * pixelRatio))
      const height = Math.max(1, Math.floor(rect.height * pixelRatio))

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      const centerX = width / 2
      const centerY = height / 2
      const minSide = Math.min(width, height)
      const level = metrics.status === 'running' ? metrics.level : 0.08
      const pulse = 0.55 + level * 0.9 + Math.sin(frame * 0.022) * 0.035

      context.clearRect(0, 0, width, height)
      context.fillStyle = preset.background
      context.fillRect(0, 0, width, height)

      const gradient = context.createRadialGradient(centerX, centerY, minSide * 0.08, centerX, centerY, minSide * 0.56)
      gradient.addColorStop(0, `${preset.accent}ee`)
      gradient.addColorStop(0.45, `${preset.accent}44`)
      gradient.addColorStop(1, '#00000000')
      context.fillStyle = gradient
      context.beginPath()
      context.arc(centerX, centerY, minSide * (0.26 + pulse * 0.08), 0, Math.PI * 2)
      context.fill()

      context.save()
      context.translate(centerX, centerY)

      for (let ring = 0; ring < 4; ring += 1) {
        const radius = minSide * (0.17 + ring * 0.08 + level * 0.05)
        context.beginPath()

        for (let index = 0; index <= 160; index += 1) {
          const angle = (index / 160) * Math.PI * 2
          const harmonic = Math.sin(angle * (3 + ring) + frame * 0.018 * (ring + 1))
          const clarity = metrics.clarity || 0.12
          const wave = radius + harmonic * minSide * 0.014 * (1 + level * 2) + clarity * minSide * 0.012
          const x = Math.cos(angle) * wave
          const y = Math.sin(angle) * wave

          if (index === 0) {
            context.moveTo(x, y)
          } else {
            context.lineTo(x, y)
          }
        }

        context.closePath()
        context.strokeStyle = ring % 2 === 0 ? `${preset.accent}cc` : '#f6f1e955'
        context.lineWidth = Math.max(1, pixelRatio * (1.2 + ring * 0.4))
        context.stroke()
      }

      const bars = 48
      for (let index = 0; index < bars; index += 1) {
        const angle = (index / bars) * Math.PI * 2
        const barLevel = 0.28 + level * 0.7 + Math.sin(index * 0.7 + frame * 0.045) * 0.16
        const inner = minSide * 0.37
        const outer = inner + minSide * 0.11 * Math.max(0.2, barLevel)
        context.strokeStyle = index % 3 === 0 ? preset.accent : '#f8efe2aa'
        context.lineWidth = Math.max(1, pixelRatio * 2)
        context.beginPath()
        context.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner)
        context.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer)
        context.stroke()
      }

      context.restore()
      context.fillStyle = '#f9f3e9'
      context.font = `${Math.max(20, minSide * 0.044)}px Inter, system-ui, sans-serif`
      context.textAlign = 'center'
      context.fillText(metrics.note, centerX, centerY + minSide * 0.018)
      context.font = `${Math.max(11, minSide * 0.018)}px Inter, system-ui, sans-serif`
      context.fillStyle = '#f9f3e9bb'
      context.fillText(metrics.pitchHz ? `${Math.round(metrics.pitchHz)} Hz` : metrics.message, centerX, centerY + minSide * 0.065)

      frame += 1
      rafId = window.requestAnimationFrame(render)
    }

    render()

    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [metrics, preset.accent, preset.background])

  return <canvas ref={canvasRef} className="meter-canvas" aria-label="Live sound visualization" />
}
