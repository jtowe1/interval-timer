import { useState, useCallback, useRef } from 'react'

export interface UseAudioReturn {
  isAudioInitialized: boolean
  initializeAudio: () => Promise<boolean>
  playChime: () => void
  audioError: string | null
}

export const useAudio = (): UseAudioReturn => {
  const [isAudioInitialized, setIsAudioInitialized] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const createChimeSound = useCallback((audioContext: AudioContext): void => {
    try {
      // Create a pleasant meditation chime using multiple harmonically related frequencies
      const now = audioContext.currentTime
      const duration = 2.5 // seconds

      // Main bell frequencies (creating a harmonious chord)
      const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5 - a major chord

      frequencies.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Use a sine wave for a pure, bell-like tone
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(frequency, now)

        // Create an envelope for natural decay (like a bell)
        gainNode.gain.setValueAtTime(0, now)
        gainNode.gain.linearRampToValueAtTime(0.15 / (index + 1), now + 0.01) // Softer volume for higher frequencies
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration)

        oscillator.start(now)
        oscillator.stop(now + duration)
      })

      // Add a subtle low-frequency resonance for depth
      const bassOscillator = audioContext.createOscillator()
      const bassGain = audioContext.createGain()
      
      bassOscillator.connect(bassGain)
      bassGain.connect(audioContext.destination)
      
      bassOscillator.type = 'sine'
      bassOscillator.frequency.setValueAtTime(130.81, now) // C3
      
      bassGain.gain.setValueAtTime(0, now)
      bassGain.gain.linearRampToValueAtTime(0.05, now + 0.01)
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.8)
      
      bassOscillator.start(now)
      bassOscillator.stop(now + duration)

    } catch (error) {
      console.warn('Error creating chime sound:', error)
      setAudioError('Failed to create chime sound')
    }
  }, [])

  const initializeAudio = useCallback(async (): Promise<boolean> => {
    try {
      setAudioError(null)

      // Create AudioContext if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const audioContext = audioContextRef.current

      // Handle suspended audio context (required by browsers for user interaction)
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      setIsAudioInitialized(true)
      return true
    } catch (error) {
      console.warn('Failed to initialize audio:', error)
      setAudioError('Audio initialization failed. Chimes will be disabled.')
      return false
    }
  }, [])

  const playChime = useCallback((): void => {
    if (!isAudioInitialized || !audioContextRef.current) {
      console.warn('Audio not initialized, cannot play chime')
      return
    }

    try {
      createChimeSound(audioContextRef.current)
    } catch (error) {
      console.warn('Error playing chime:', error)
      setAudioError('Failed to play chime sound')
    }
  }, [isAudioInitialized, createChimeSound])

  return {
    isAudioInitialized,
    initializeAudio,
    playChime,
    audioError
  }
}