import { useState, useEffect, useCallback } from 'react'

export interface Timer {
  id: string
  label: string
  minutes: number
  seconds: number
  status: 'pending' | 'running' | 'paused' | 'completed'
  originalMinutes: number
  originalSeconds: number
}

export interface AppState {
  timers: Timer[]
  currentTimerIndex: number
  isRunning: boolean
}

export const useTimer = (playChime: () => void) => {
  const [appState, setAppState] = useState<AppState>({
    timers: [{
      id: crypto.randomUUID(),
      label: '',
      minutes: 5,
      seconds: 0,
      status: 'pending',
      originalMinutes: 5,
      originalSeconds: 0
    }],
    currentTimerIndex: -1,
    isRunning: false
  })

  const addTimer = useCallback(() => {
    const newTimer: Timer = {
      id: crypto.randomUUID(),
      label: '',
      minutes: 5,
      seconds: 0,
      status: 'pending',
      originalMinutes: 5,
      originalSeconds: 0
    }
    setAppState(prev => ({
      ...prev,
      timers: [...prev.timers, newTimer]
    }))
  }, [])

  const updateTimer = useCallback((id: string, updates: Partial<Timer>) => {
    setAppState(prev => ({
      ...prev,
      timers: prev.timers.map(timer =>
        timer.id === id ? { ...timer, ...updates } : timer
      )
    }))
  }, [])

  const removeTimer = useCallback((id: string) => {
    setAppState(prev => ({
      ...prev,
      timers: prev.timers.filter(timer => timer.id !== id)
    }))
  }, [])

  const startMeditation = useCallback(() => {
    // Validate that all timers have a duration > 0
    const hasInvalidTimer = appState.timers.some(timer =>
      timer.originalMinutes === 0 && timer.originalSeconds === 0
    )

    if (hasInvalidTimer) {
      alert('Please set a duration for all timers (at least 1 second)')
      return false
    }

    setAppState(prev => ({
      ...prev,
      isRunning: true,
      currentTimerIndex: 0,
      timers: prev.timers.map((timer, index) => ({
        ...timer,
        status: index === 0 ? 'running' : 'pending',
        minutes: timer.originalMinutes,
        seconds: timer.originalSeconds
      }))
    }))

    return true
  }, [appState.timers])

  const pauseTimer = useCallback((id: string) => {
    setAppState(prev => ({
      ...prev,
      timers: prev.timers.map(timer =>
        timer.id === id
          ? { ...timer, status: timer.status === 'running' ? 'paused' : 'running' }
          : timer
      )
    }))
  }, [])

  const clearTimer = useCallback((id: string) => {
    setAppState(prev => ({
      ...prev,
      timers: prev.timers.map(timer =>
        timer.id === id
          ? { ...timer, minutes: timer.originalMinutes, seconds: timer.originalSeconds, status: 'pending' }
          : timer
      )
    }))
  }, [])

  const stopMeditation = useCallback(() => {
    setAppState(prev => ({
      ...prev,
      isRunning: false,
      currentTimerIndex: -1,
      timers: prev.timers.map(timer => ({
        ...timer,
        status: 'pending',
        minutes: timer.originalMinutes,
        seconds: timer.originalSeconds
      }))
    }))
  }, [])

  // Main timer countdown effect
  useEffect(() => {
    if (!appState.isRunning || appState.currentTimerIndex === -1) return

    const interval = setInterval(() => {
      setAppState(prev => {
        const currentTimer = prev.timers[prev.currentTimerIndex]

        if (!currentTimer || currentTimer.status !== 'running') {
          return prev
        }

        const newSeconds = currentTimer.seconds - 1
        const newMinutes = newSeconds < 0 ? currentTimer.minutes - 1 : currentTimer.minutes
        const adjustedSeconds = newSeconds < 0 ? 59 : newSeconds

        // Timer completed
        if (newMinutes < 0) {
          playChime()

          const nextTimerIndex = prev.currentTimerIndex + 1
          const hasNextTimer = nextTimerIndex < prev.timers.length

          return {
            ...prev,
            currentTimerIndex: hasNextTimer ? nextTimerIndex : -1,
            isRunning: hasNextTimer,
            timers: prev.timers.map((timer, index) => {
              if (index === prev.currentTimerIndex) {
                return { ...timer, status: 'completed' as const, minutes: 0, seconds: 0 }
              }
              if (index === nextTimerIndex && hasNextTimer) {
                return { ...timer, status: 'running' as const, minutes: timer.originalMinutes, seconds: timer.originalSeconds }
              }
              return timer
            })
          }
        }

        // Update current timer
        return {
          ...prev,
          timers: prev.timers.map((timer, index) =>
            index === prev.currentTimerIndex
              ? { ...timer, minutes: newMinutes, seconds: adjustedSeconds }
              : timer
          )
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [appState.isRunning, appState.currentTimerIndex, playChime])

  return {
    appState,
    addTimer,
    updateTimer,
    removeTimer,
    startMeditation,
    pauseTimer,
    clearTimer,
    stopMeditation
  }
}