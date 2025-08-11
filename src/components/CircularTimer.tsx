import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Input,
  NumberInput,
  IconButton,
  Circle,
  Center,
} from '@chakra-ui/react'
import { LuX, LuChevronLeft, LuChevronRight } from "react-icons/lu"

interface Timer {
  id: string
  label: string
  minutes: number
  seconds: number
  status: 'pending' | 'running' | 'completed'
  originalMinutes: number
  originalSeconds: number
}

interface CircularTimerProps {
  timers: Timer[]
  currentTimerIndex: number
  isRunning: boolean
  onUpdateTimer: (id: string, updates: Partial<Timer>) => void
  onAddTimer: () => void
  onRemoveTimer: (id: string) => void
  mode?: 'setup' | 'session'
}

// Color system for multiple timers as specified in design
const timerColors = {
  timer1: '#0d7fe6', // Primary Blue - Focus/Breath
  timer2: '#52a652', // Nature Green - Growth/Heart
  timer3: '#a87c63', // Earth Brown - Grounding/Root
  timer4: '#14b8a6', // Secondary Teal - Balance/Throat
  timer5: '#c19a6b'  // Warm Accent - Warmth/Solar
}

export const CircularTimer = ({
  timers,
  currentTimerIndex,
  isRunning,
  onUpdateTimer,
  onAddTimer,
  onRemoveTimer,
  mode = 'session'
}: CircularTimerProps) => {
  const currentTimer = currentTimerIndex >= 0 ? timers[currentTimerIndex] : timers[0]
  const isCurrentTimerRunning = currentTimer?.status === 'running'
  const isCurrentTimerCompleted = currentTimer?.status === 'completed'

  // Calculate progress for current timer
  const calculateProgress = (timer: Timer) => {
    const totalSeconds = timer.originalMinutes * 60 + timer.originalSeconds
    const currentSeconds = timer.minutes * 60 + timer.seconds
    return totalSeconds > 0 ? ((totalSeconds - currentSeconds) / totalSeconds) * 100 : 0
  }

  const currentProgress = currentTimer ? calculateProgress(currentTimer) : 0

  // Calculate cumulative session progress and timer boundaries
  const calculateSessionData = () => {
    const totalSessionSeconds = timers.reduce((sum, timer) =>
      sum + timer.originalMinutes * 60 + timer.originalSeconds, 0)

    let cumulativeSeconds = 0
    const timerBoundaries = timers.map((timer, index) => {
      const timerDuration = timer.originalMinutes * 60 + timer.originalSeconds
      const startPercent = (cumulativeSeconds / totalSessionSeconds) * 100
      cumulativeSeconds += timerDuration
      const endPercent = (cumulativeSeconds / totalSessionSeconds) * 100

      return {
        index,
        startPercent,
        endPercent,
        duration: timerDuration,
        timer
      }
    })

    // Calculate overall session progress
    const completedSeconds = timers.slice(0, currentTimerIndex).reduce((sum, timer) =>
      sum + timer.originalMinutes * 60 + timer.originalSeconds, 0)
    const currentTimerProgress = currentTimer ?
      (currentTimer.originalMinutes * 60 + currentTimer.originalSeconds) - (currentTimer.minutes * 60 + currentTimer.seconds) : 0
    const sessionProgress = totalSessionSeconds > 0 ?
      ((completedSeconds + currentTimerProgress) / totalSessionSeconds) * 100 : 0

    return {
      sessionProgress,
      timerBoundaries,
      totalSessionSeconds
    }
  }

  const sessionData = calculateSessionData()

  // Generate color for timer based on index
  const getTimerColor = (index: number) => {
    const colorKeys = Object.keys(timerColors) as Array<keyof typeof timerColors>
    const colorKey = colorKeys[index % colorKeys.length]
    return timerColors[colorKey]
  }

  // Create SVG path for progress arc
  const createProgressPath = (progress: number, radius: number) => {
    const angle = (progress / 100) * 360
    const radians = (angle - 90) * Math.PI / 180 // Start from top (12 o'clock)
    const x = 180 + radius * Math.cos(radians)
    const y = 180 + radius * Math.sin(radians)
    const largeArcFlag = angle > 180 ? 1 : 0

    return `M 180 ${180 - radius} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x} ${y}`
  }

  // Create position for timer boundary markers
  const getMarkerPosition = (percent: number, radius: number) => {
    const angle = (percent / 100) * 360 - 90 // Start from top (12 o'clock)
    const radians = angle * Math.PI / 180
    return {
      x: 180 + radius * Math.cos(radians),
      y: 180 + radius * Math.sin(radians)
    }
  }

  if (mode === 'setup') {
    return (
      <VStack gap={6} w="full" className="zen-emerge">
        {/* Circular Setup Display */}
        <Center position="relative" w="full">
          <Box
            position="relative"
            className="circular-timer"
            css={{
              width: 'clamp(280px, 80vw, 360px)',
              height: 'clamp(280px, 80vw, 360px)',
            }}
          >
            {/* SVG Container */}
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 360 360"
              style={{ position: 'absolute', inset: 0 }}
            >
              {/* Background circle */}
              <circle
                cx="180"
                cy="180"
                r="140"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="2"
              />

              {/* Single ring preview - show all configured timers */}
              <g>
                {/* Background ring */}
                <circle
                  cx="180"
                  cy="180"
                  r="120"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="12"
                />

                {/* Timer segments preview */}
                {sessionData.timerBoundaries.map((boundary, index) => {
                  const color = getTimerColor(index)
                  const startAngle = (boundary.startPercent / 100) * 360 - 90
                  const endAngle = (boundary.endPercent / 100) * 360 - 90
                  const startRadians = startAngle * Math.PI / 180
                  const endRadians = endAngle * Math.PI / 180
                  const radius = 120

                  const startX = 180 + radius * Math.cos(startRadians)
                  const startY = 180 + radius * Math.sin(startRadians)
                  const endX = 180 + radius * Math.cos(endRadians)
                  const endY = 180 + radius * Math.sin(endRadians)

                  const largeArcFlag = (endAngle - startAngle) > 180 ? 1 : 0
                  const path = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`

                  return (
                    <path
                      key={`setup-segment-${boundary.timer.id}`}
                      d={path}
                      fill="none"
                      stroke={color}
                      strokeWidth="12"
                      strokeOpacity={0.4}
                      strokeLinecap="round"
                    />
                  )
                })}

                {/* Timer boundary markers for setup */}
                {sessionData.timerBoundaries.map((boundary, index) => {
                  const position = getMarkerPosition(boundary.endPercent, 120)
                  const color = getTimerColor(index)

                  return (
                    <circle
                      key={`setup-marker-${boundary.timer.id}`}
                      cx={position.x}
                      cy={position.y}
                      r="4"
                      fill={color}
                      fillOpacity={0.7}
                      stroke="rgba(255, 255, 255, 0.8)"
                      strokeWidth="1"
                    />
                  )
                })}
              </g>
            </svg>

            {/* Central Setup Content */}
            <Box
              position="absolute"
              inset="20%"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <VStack gap={4} textAlign="center" w="full">
                <Text
                  color="white"
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="300"
                  textAlign="center"
                >
                  {timers.length} Timer{timers.length > 1 ? 's' : ''}
                </Text>
                <Text
                  color="rgba(255, 255, 255, 0.6)"
                  fontSize="sm"
                  fontWeight="300"
                  textAlign="center"
                >
                  Configure below
                </Text>
              </VStack>
            </Box>
          </Box>
        </Center>

        {/* Setup Controls - Traditional cards for editing */}
        {timers.map((timer, index) => (
          <Box
            key={timer.id}
            w="full"
            p={4}
            bg="rgba(255, 255, 255, 0.05)"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            borderRadius="2rem"
            className="zen-transition"
          >
            <VStack gap={4}>
              {/* Timer Label */}
              <HStack w="full" justify="space-between" align="center">
                <Text
                  color={getTimerColor(index)}
                  fontSize="sm"
                  fontWeight="500"
                  textTransform="uppercase"
                  letterSpacing="0.1em"
                >
                  Timer {index + 1}
                </Text>
                {timers.length > 1 && (
                  <IconButton
                    size="sm"
                    bg="rgba(255, 255, 255, 0.05)"
                    color="rgba(255, 255, 255, 0.6)"
                    border="1px solid rgba(255, 255, 255, 0.1)"
                    _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                    onClick={() => onRemoveTimer(timer.id)}
                    aria-label="Remove timer"
                    borderRadius="0.75rem"
                  >
                    <LuX size={14} />
                  </IconButton>
                )}
              </HStack>

              {/* Label Input */}
              <Input
                placeholder="Name this meditation..."
                value={timer.label}
                onChange={(e) => onUpdateTimer(timer.id, { label: e.target.value })}
                bg="rgba(255, 255, 255, 0.05)"
                border="1px solid rgba(255, 255, 255, 0.1)"
                color="white"
                fontSize="sm"
                h={10}
                rounded="3xl"
                disabled={isRunning}
                textAlign="center"
                _placeholder={{ color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center' }}
                _focus={{
                  borderColor: getTimerColor(index),
                  boxShadow: `0 0 0 3px ${getTimerColor(index)}20`
                }}
              />

              {/* Time Controls */}
              <HStack gap={6} justify="center" w="full">
                <VStack gap={2}>
                  <Text color="rgba(255, 255, 255, 0.6)" fontSize="xs" fontWeight="500">
                    MINUTES
                  </Text>
                  <NumberInput.Root
                    value={timer.originalMinutes.toString()}
                    min={0}
                    max={99}
                    onValueChange={(details) => {
                      const value = Math.max(0, parseInt(details.value) || 0)
                      onUpdateTimer(timer.id, {
                        minutes: value,
                        originalMinutes: value
                      })
                    }}
                  >
                    <HStack
                      gap={0}
                      bg="rgba(255, 255, 255, 0.1)"
                      borderRadius="1.5rem"
                      border="2px solid rgba(255, 255, 255, 0.2)"
                      px={2}
                      py={1}
                      align="center"
                      minW="120px"
                    >
                      <NumberInput.DecrementTrigger asChild>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          color="rgba(255, 255, 255, 0.8)"
                          _hover={{ color: "white" }}
                          minW="auto"
                          h="auto"
                          p={2}
                          borderRadius="2rem"
                        >
                          <LuChevronLeft size={16} />
                        </IconButton>
                      </NumberInput.DecrementTrigger>
                      <NumberInput.ValueText
                        flex="1"
                        textAlign="center"
                        fontSize="xl"
                        color="#4FD1C7"
                        fontWeight="bold"
                        bg="transparent"
                        border="none"
                        minWidth="40px"
                      />
                      <NumberInput.IncrementTrigger asChild>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          color="rgba(255, 255, 255, 0.8)"
                          _hover={{ color: "white" }}
                          minW="auto"
                          h="auto"
                          p={2}
                          borderRadius="2rem"
                        >
                          <LuChevronRight size={16} />
                        </IconButton>
                      </NumberInput.IncrementTrigger>
                    </HStack>
                  </NumberInput.Root>
                </VStack>

                <Text color="rgba(255, 255, 255, 0.4)" fontSize="lg" mx={2}>:</Text>

                <VStack gap={2}>
                  <Text color="rgba(255, 255, 255, 0.6)" fontSize="xs" fontWeight="500">
                    SECONDS
                  </Text>
                  <NumberInput.Root
                    value={timer.originalSeconds.toString()}
                    min={0}
                    max={59}
                    onValueChange={(details) => {
                      const value = Math.max(0, Math.min(59, parseInt(details.value) || 0))
                      onUpdateTimer(timer.id, {
                        seconds: value,
                        originalSeconds: value
                      })
                    }}
                  >
                    <HStack
                      gap={0}
                      bg="rgba(255, 255, 255, 0.1)"
                      borderRadius="1.5rem"
                      border="2px solid rgba(255, 255, 255, 0.2)"
                      px={2}
                      py={1}
                      align="center"
                      minW="120px"
                    >
                      <NumberInput.DecrementTrigger asChild>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          color="rgba(255, 255, 255, 0.8)"
                          _hover={{ color: "white" }}
                          minW="auto"
                          h="auto"
                          p={2}
                          borderRadius="2rem"
                        >
                          <LuChevronLeft size={16} />
                        </IconButton>
                      </NumberInput.DecrementTrigger>
                      <NumberInput.ValueText
                        flex="1"
                        textAlign="center"
                        fontSize="xl"
                        color="#4FD1C7"
                        fontWeight="bold"
                        bg="transparent"
                        border="none"
                        minWidth="40px"
                      />
                      <NumberInput.IncrementTrigger asChild>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          color="rgba(255, 255, 255, 0.8)"
                          _hover={{ color: "white" }}
                          minW="auto"
                          h="auto"
                          p={2}
                          borderRadius="2rem"
                        >
                          <LuChevronRight size={16} />
                        </IconButton>
                      </NumberInput.IncrementTrigger>
                    </HStack>
                  </NumberInput.Root>
                </VStack>
              </HStack>
            </VStack>
          </Box>
        ))}

        {/* Add Timer Button */}
        <Button
          bg="rgba(255, 255, 255, 0.05)"
          border="1px solid rgba(255, 255, 255, 0.1)"
          color="rgba(255, 255, 255, 0.7)"
          onClick={onAddTimer}
          w="full"
          h={12}
          rounded="3xl"
          _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
        >
          + Add Timer
        </Button>
      </VStack>
    )
  }

  // Session Mode - Circular Timer Display
  return (
    <Box
      position="relative"
      className={`zen-transition ${isCurrentTimerCompleted ? 'completion-celebration' : ''}`}
      role="region"
      aria-label={`Circular Timer Display: ${currentTimer?.label || 'Meditation Timer'}`}
      aria-live="polite"
    >
      <Center position="relative">
        <Box
          position="relative"
          className="circular-timer"
          css={{
            width: 'clamp(280px, 80vw, 360px)',
            height: 'clamp(280px, 80vw, 360px)',
          }}
        >
          {/* SVG Timer Visualization */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 360 360"
            style={{ position: 'absolute', inset: 0 }}
          >
            {/* Background circle */}
            <circle
              cx="180"
              cy="180"
              r="140"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="2"
            />

            {/* Single unified ring */}
            <g>
              {/* Background ring */}
              <circle
                cx="180"
                cy="180"
                r="120"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="12"
              />

              {/* Completed segments */}
              {sessionData.timerBoundaries.map((boundary, index) => {
                if (index >= currentTimerIndex) return null
                const color = getTimerColor(index)
                const startAngle = (boundary.startPercent / 100) * 360 - 90
                const endAngle = (boundary.endPercent / 100) * 360 - 90
                const startRadians = startAngle * Math.PI / 180
                const endRadians = endAngle * Math.PI / 180
                const radius = 120

                const startX = 180 + radius * Math.cos(startRadians)
                const startY = 180 + radius * Math.sin(startRadians)
                const endX = 180 + radius * Math.cos(endRadians)
                const endY = 180 + radius * Math.sin(endRadians)

                const largeArcFlag = (endAngle - startAngle) > 180 ? 1 : 0
                const path = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`

                return (
                  <path
                    key={`completed-${boundary.timer.id}`}
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth="12"
                    strokeOpacity={0.6}
                    strokeLinecap="round"
                  />
                )
              })}

              {/* Current active segment background */}
              {currentTimerIndex >= 0 && currentTimerIndex < sessionData.timerBoundaries.length && (
                (() => {
                  const boundary = sessionData.timerBoundaries[currentTimerIndex]
                  const color = getTimerColor(currentTimerIndex)
                  const startAngle = (boundary.startPercent / 100) * 360 - 90
                  const endAngle = (boundary.endPercent / 100) * 360 - 90
                  const startRadians = startAngle * Math.PI / 180
                  const endRadians = endAngle * Math.PI / 180
                  const radius = 120

                  const startX = 180 + radius * Math.cos(startRadians)
                  const startY = 180 + radius * Math.sin(startRadians)
                  const endX = 180 + radius * Math.cos(endRadians)
                  const endY = 180 + radius * Math.sin(endRadians)

                  const largeArcFlag = (endAngle - startAngle) > 180 ? 1 : 0
                  const path = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`

                  return (
                    <path
                      d={path}
                      fill="none"
                      stroke={color}
                      strokeWidth="12"
                      strokeOpacity={0.3}
                      strokeLinecap="round"
                    />
                  )
                })()
              )}

              {/* Current session progress */}
              {sessionData.sessionProgress > 0 && (
                <path
                  d={createProgressPath(sessionData.sessionProgress, 120)}
                  fill="none"
                  stroke={currentTimer ? getTimerColor(currentTimerIndex) : 'rgba(255, 255, 255, 0.8)'}
                  strokeWidth="12"
                  strokeOpacity={0.9}
                  strokeLinecap="round"
                  className="smooth-transition"
                />
              )}

              {/* Timer boundary markers */}
              {sessionData.timerBoundaries.map((boundary, index) => {
                const position = getMarkerPosition(boundary.endPercent, 120)
                const color = getTimerColor(index)
                const isCompleted = boundary.timer.status === 'completed'
                const isCurrent = index === currentTimerIndex
                const isPending = boundary.timer.status === 'pending'

                return (
                  <g key={`marker-${boundary.timer.id}`}>
                    {/* Marker circle */}
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r={isCurrent ? "6" : "4"}
                      fill={isCompleted ? color : isPending ? "none" : color}
                      stroke={isPending ? color : "rgba(255, 255, 255, 0.8)"}
                      strokeWidth={isPending ? "2" : "1"}
                      fillOpacity={isCompleted ? 0.9 : isCurrent ? 0.8 : 0.6}
                      className="smooth-transition"
                    />

                    {/* Current timer indicator */}
                    {isCurrent && (
                      <circle
                        cx={position.x}
                        cy={position.y}
                        r="8"
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeOpacity={0.5}
                      />
                    )}
                  </g>
                )
              })}
            </g>
          </svg>

          {/* Central Timer Display */}
          <Box
            position="absolute"
            inset="25%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <VStack gap={{ base: 2, md: 3 }} textAlign="center" w="full">
              {/* Timer Status Indicator */}
              {(isCurrentTimerRunning || isCurrentTimerCompleted) && (
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  {isCurrentTimerRunning && (
                    <Box
                      w={3} h={3}
                      bg="accent.400"
                      borderRadius="full"
                      className=""
                    />
                  )}
                  {isCurrentTimerCompleted && (
                    <Circle size={6} bg="accent.500" color="white" fontSize="xs" fontWeight="bold">
                      ✓
                    </Circle>
                  )}
                  <Text
                    color={isCurrentTimerCompleted ? "accent.300" : "primary.300"}
                    fontSize="xs"
                    fontWeight="500"
                    textTransform="uppercase"
                    letterSpacing="0.1em"
                  >
                    {isCurrentTimerCompleted ? "Complete" : "Active"}
                  </Text>
                </Box>
              )}

              {/* Main Time Display */}
              <Box textAlign="center">
                <Text
                  fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
                  fontWeight="200"
                  fontFamily="ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                  color="white"
                  letterSpacing="-0.02em"
                  lineHeight="0.9"
                  textShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
                  aria-label={currentTimer ? `${currentTimer.minutes} minutes and ${currentTimer.seconds} seconds remaining` : 'No active timer'}
                  className="zen-transition"
                >
                  {currentTimer ? (
                    <>
                      {String(currentTimer.minutes).padStart(2, '0')}
                      <Text
                        as="span"
                        color="rgba(255, 255, 255, 0.4)"
                        fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
                        aria-hidden="true"
                      >
                        :
                      </Text>
                      {String(currentTimer.seconds).padStart(2, '0')}
                    </>
                  ) : '00:00'}
                </Text>
              </Box>

              {/* Timer Label */}
              {currentTimer?.label && (
                <Text
                  color="rgba(255, 255, 255, 0.7)"
                  fontSize={{ base: "sm", md: "md" }}
                  fontWeight="300"
                  maxW="150px"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  textAlign="center"
                >
                  {currentTimer.label}
                </Text>
              )}

              {/* Progress Indicator */}
              {currentProgress > 0 && (
                <Text
                  color="rgba(255, 255, 255, 0.5)"
                  fontSize="xs"
                  fontWeight="300"
                >
                  {Math.round(currentProgress)}% complete
                </Text>
              )}

              {/* Session Progress */}
              {timers.length > 1 && currentTimerIndex >= 0 && (
                <Text
                  color="rgba(255, 255, 255, 0.5)"
                  fontSize="xs"
                  fontWeight="300"
                  mt={1}
                >
                  Timer {currentTimerIndex + 1} of {timers.length}
                </Text>
              )}
            </VStack>
          </Box>
        </Box>
      </Center>
    </Box>
  )
}