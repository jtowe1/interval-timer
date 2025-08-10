import { useState, useCallback } from 'react'

export const useAudio = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [audioEnabled, setAudioEnabled] = useState(false)

  const initializeAudio = useCallback(async () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      const ctx = new AudioContextClass()
      
      if (ctx.state === 'suspended') {
        await ctx.resume()
      }
      
      setAudioContext(ctx)
      setAudioEnabled(true)
      return ctx
    } catch (error) {
      console.warn('Audio initialization failed:', error)
      setAudioEnabled(false)
      return null
    }
  }, [])

  const playChime = useCallback(async () => {
    try {
      let ctx = audioContext
      
      if (!ctx) {
        ctx = await initializeAudio()
        if (!ctx) return
      }

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Use a more peaceful frequency for meditation (528 Hz - "Love Frequency")
      oscillator.frequency.setValueAtTime(528, ctx.currentTime)
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.5)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 2.5)
      
      // Gentle vibration for mobile
      if ('vibrate' in navigator) {
        navigator.vibrate([150, 75, 150])
      }
    } catch (error) {
      console.warn('Audio playback failed:', error)
      // Vibration-only fallback
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200])
      }
    }
  }, [audioContext, initializeAudio])

  return {
    audioEnabled,
    initializeAudio,
    playChime
  }
}