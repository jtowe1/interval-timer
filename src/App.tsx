import { useState, useEffect } from 'react'
import {
  ChakraProvider,
  Box,
  Heading,
  Button,
  Text,
  VStack,
  HStack,
  Input,
  NumberInput,
  IconButton,
  createSystem,
  defineConfig
} from '@chakra-ui/react'
import { LuMinus, LuPlus } from "react-icons/lu"

interface Timer {
  id: string
  label: string
  minutes: number
  seconds: number
  status: 'pending' | 'running' | 'paused' | 'completed'
  originalMinutes: number
  originalSeconds: number
}

interface AppState {
  timers: Timer[]
  currentTimerIndex: number
  isRunning: boolean
}

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        primary: {
          50: { value: '#fff7ed' },
          100: { value: '#ffedd5' },
          200: { value: '#fed7aa' },
          300: { value: '#fdba74' },
          400: { value: '#fb923c' },
          500: { value: '#f97316' },
          600: { value: '#ea580c' },
          700: { value: '#c2410c' },
          800: { value: '#9a3412' },
          900: { value: '#7c2d12' },
        },
        secondary: {
          50: { value: '#fefce8' },
          100: { value: '#fef3c7' },
          200: { value: '#fde68a' },
          300: { value: '#fcd34d' },
          400: { value: '#fbbf24' },
          500: { value: '#f59e0b' },
          600: { value: '#d97706' },
          700: { value: '#b45309' },
          800: { value: '#92400e' },
          900: { value: '#78350f' },
        },
      },
    },
  },
})

const system = createSystem(config)

function App() {
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

  const addTimer = () => {
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
  }

  const updateTimer = (id: string, updates: Partial<Timer>) => {
    setAppState(prev => ({
      ...prev,
      timers: prev.timers.map(timer =>
        timer.id === id ? { ...timer, ...updates } : timer
      )
    }))
  }

  const removeTimer = (id: string) => {
    setAppState(prev => ({
      ...prev,
      timers: prev.timers.filter(timer => timer.id !== id)
    }))
  }

  const startMeditation = () => {
    // Validate that all timers have a duration > 0
    const hasInvalidTimer = appState.timers.some(timer =>
      timer.originalMinutes === 0 && timer.originalSeconds === 0
    )

    if (hasInvalidTimer) {
      alert('Please set a duration for all timers (at least 1 second)')
      return
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
  }

  const pauseTimer = (id: string) => {
    setAppState(prev => ({
      ...prev,
      timers: prev.timers.map(timer =>
        timer.id === id
          ? { ...timer, status: timer.status === 'running' ? 'paused' : 'running' }
          : timer
      )
    }))
  }

  const clearTimer = (id: string) => {
    setAppState(prev => ({
      ...prev,
      timers: prev.timers.map(timer =>
        timer.id === id
          ? { ...timer, minutes: timer.originalMinutes, seconds: timer.originalSeconds, status: 'pending' }
          : timer
      )
    }))
  }

  const playChime = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(528, audioContext.currentTime) // C5 note
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 2)
  }

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
  }, [appState.isRunning, appState.currentTimerIndex])

  const stopMeditation = () => {
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
  }

  return (
    <ChakraProvider value={system}>
      <Box
        minH="100vh"
        bg="#3a3a3a"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Box maxW="320px" w="full">
          <VStack gap={3} align="center">
          {/* Header */}
          <VStack gap={1} mb={4}>
            <Heading size="lg" color="white" fontWeight="500" textAlign="center">
              Meditation Timer
            </Heading>
            {appState.isRunning && (
              <Text color="orange.300" fontSize="sm">
                Timer {appState.currentTimerIndex + 1} of {appState.timers.length}
              </Text>
            )}
          </VStack>

          {/* Timer Cards */}
          <VStack gap={2} w="full">
            {appState.timers.map((timer, index) => {
              const isCurrentTimer = appState.currentTimerIndex === index
              const isCompleted = timer.status === 'completed'
              const isRunning = timer.status === 'running'
              const isPaused = timer.status === 'paused'

              return (
                <Box
                  key={timer.id}
                  w="full"
                  p={3}
                  bg="rgba(255,255,255,0.05)"
                  border="1px solid"
                  borderColor={isCompleted ? "#4ade80" : isCurrentTimer ? "#fbbf24" : "#555"}
                  rounded="lg"
                >
                  <VStack gap={3}>
                    {/* Header & Status */}
                    <HStack justify="space-between" w="full">
                      <HStack gap={2}>
                        <Text color="white" fontSize="sm" fontWeight="600">
                          Timer {index + 1}
                        </Text>
                        {isRunning && <Box w={1.5} h={1.5} bg="green.400" rounded="full" />}
                        {isCompleted && <Text fontSize="sm">✅</Text>}
                      </HStack>
                      <Text color="gray.400" fontSize="xs" textTransform="uppercase">
                        {timer.status}
                      </Text>
                    </HStack>

                    {/* Label Input */}
                    <Input
                      placeholder="Label this timer..."
                      value={timer.label}
                      onChange={(e) => updateTimer(timer.id, { label: e.target.value })}
                      bg="transparent"
                      border="1px solid #555"
                      color="white"
                      fontSize="sm"
                      h={8}
                      rounded="md"
                      disabled={appState.isRunning}
                      _placeholder={{ color: 'gray.500' }}
                      _focus={{ borderColor: 'gray.400' }}
                    />

                    {/* Time Display */}
                    <Text color="white" fontSize="2xl" fontWeight="300" textAlign="center">
                      {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
                    </Text>

                    {/* Time Controls */}
                    <HStack justify="center" gap={6}>
                      {/* Minutes */}
                      <VStack gap={1}>
                        <Text color="gray.400" fontSize="xs">MIN</Text>
                        <NumberInput.Root
                          value={timer.originalMinutes.toString()}
                          min={0}
                          max={99}
                          disabled={appState.isRunning}
                          onValueChange={(details) => {
                            const value = Math.max(0, parseInt(details.value) || 0)
                            updateTimer(timer.id, {
                              minutes: timer.status === 'pending' ? value : timer.minutes,
                              originalMinutes: value
                            })
                          }}
                        >
                          <HStack gap={1}>
                            <NumberInput.DecrementTrigger asChild>
                              <IconButton
                                variant="outline"
                                size="sm"
                                bg="transparent"
                                color="gray.400"
                                borderColor="gray.600"
                                _hover={{ bg: 'whiteAlpha.50', color: 'white' }}
                              >
                                <LuMinus />
                              </IconButton>
                            </NumberInput.DecrementTrigger>
                            <NumberInput.ValueText
                              textAlign="center"
                              fontSize="lg"
                              color="white"
                              bg="transparent"
                              px={3}
                              py={2}
                              w="50px"
                            />
                            <NumberInput.IncrementTrigger asChild>
                              <IconButton
                                variant="outline"
                                size="sm"
                                bg="transparent"
                                color="gray.400"
                                borderColor="gray.600"
                                _hover={{ bg: 'whiteAlpha.50', color: 'white' }}
                              >
                                <LuPlus />
                              </IconButton>
                            </NumberInput.IncrementTrigger>
                          </HStack>
                        </NumberInput.Root>
                      </VStack>

                      {/* Seconds */}
                      <VStack gap={1}>
                        <Text color="gray.400" fontSize="xs">SEC</Text>
                        <NumberInput.Root
                          value={timer.originalSeconds.toString()}
                          min={0}
                          max={59}
                          disabled={appState.isRunning}
                          onValueChange={(details) => {
                            const value = Math.max(0, Math.min(59, parseInt(details.value) || 0))
                            updateTimer(timer.id, {
                              seconds: timer.status === 'pending' ? value : timer.seconds,
                              originalSeconds: value
                            })
                          }}
                        >
                          <HStack gap={1}>
                            <NumberInput.DecrementTrigger asChild>
                              <IconButton
                                variant="outline"
                                size="sm"
                                bg="transparent"
                                color="gray.400"
                                borderColor="gray.600"
                                _hover={{ bg: 'whiteAlpha.50', color: 'white' }}
                              >
                                <LuMinus />
                              </IconButton>
                            </NumberInput.DecrementTrigger>
                            <NumberInput.ValueText
                              textAlign="center"
                              fontSize="lg"
                              color="white"
                              bg="transparent"
                              px={3}
                              py={2}
                              w="50px"
                            />
                            <NumberInput.IncrementTrigger asChild>
                              <IconButton
                                variant="outline"
                                size="sm"
                                bg="transparent"
                                color="gray.400"
                                borderColor="gray.600"
                                _hover={{ bg: 'whiteAlpha.50', color: 'white' }}
                              >
                                <LuPlus />
                              </IconButton>
                            </NumberInput.IncrementTrigger>
                          </HStack>
                        </NumberInput.Root>
                      </VStack>
                    </HStack>

                    {/* Control Buttons */}
                    <HStack justify="space-between" w="full">
                      <Button
                        size="sm" bg="transparent" border="1px solid #666" color="gray.300"
                        _hover={{ bg: 'whiteAlpha.100' }}
                        onClick={addTimer}
                        disabled={appState.isRunning}
                      >
                        + Add
                      </Button>

                      <HStack gap={1}>
                        <Button
                          size="sm" w={8} h={8}
                          bg={isPaused ? "#4ade80" : "#555"}
                          color="white"
                          _hover={{ bg: isPaused ? "#22c55e" : '#666' }}
                          onClick={() => pauseTimer(timer.id)}
                          disabled={!isCurrentTimer && appState.isRunning}
                        >
                          {isPaused ? '▶' : '⏸'}
                        </Button>
                        <Button
                          size="sm" w={8} h={8} bg="#555" color="white" _hover={{ bg: '#666' }}
                          onClick={() => clearTimer(timer.id)}
                        >
                          ↻
                        </Button>
                        <Button
                          size="sm" w={8} h={8} bg="#555" color="white" _hover={{ bg: '#666' }}
                          onClick={() => removeTimer(timer.id)}
                          disabled={appState.timers.length === 1}
                        >
                          ×
                        </Button>
                      </HStack>
                    </HStack>
                  </VStack>
                </Box>
              )
            })}
          </VStack>

          {/* Main Action Button */}
          <Button
            bg={appState.isRunning ? "#ef4444" : "#4ade80"}
            color="white"
            _hover={{
              bg: appState.isRunning ? '#dc2626' : '#22c55e'
            }}
            w="full"
            h={12}
            fontSize="md"
            fontWeight="500"
            rounded="lg"
            onClick={appState.isRunning ? stopMeditation : startMeditation}
            mt={3}
          >
            {appState.isRunning ? 'Stop Meditation' : 'Begin Meditation'}
          </Button>
          </VStack>
        </Box>
      </Box>
    </ChakraProvider>
  )
}

export default App