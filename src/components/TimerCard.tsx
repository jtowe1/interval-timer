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
import { LuMinus, LuPlus, LuX } from "react-icons/lu"

interface Timer {
  id: string
  label: string
  minutes: number
  seconds: number
  status: 'pending' | 'running' | 'completed'
  originalMinutes: number
  originalSeconds: number
}

interface TimerCardProps {
  timer: Timer
  index: number
  isCurrentTimer: boolean
  isRunning: boolean
  onUpdateTimer: (id: string, updates: Partial<Timer>) => void
  onAddTimer: () => void
  onRemoveTimer: (id: string) => void
  canRemove: boolean
  displayMode?: 'primary' | 'secondary' | 'tertiary'
  showControls?: boolean
}

export const TimerCard = ({
  timer,
  index,
  isCurrentTimer,
  isRunning,
  onUpdateTimer,
  onAddTimer,
  onRemoveTimer,
  canRemove,
  displayMode = isCurrentTimer ? 'primary' : 'secondary',
  showControls = true,
}: TimerCardProps) => {
  const isCompleted = timer.status === 'completed'
  const isTimerRunning = timer.status === 'running'
  const totalSeconds = timer.originalMinutes * 60 + timer.originalSeconds
  const currentSeconds = timer.minutes * 60 + timer.seconds
  const progress = totalSeconds > 0 ? ((totalSeconds - currentSeconds) / totalSeconds) * 100 : 0

  // Render different layouts based on display mode
  if (displayMode === 'primary') {
    return (
      <Box
        w="full"
        position="relative"
        className={`zen-transition ${isCompleted ? 'completion-celebration' : ''}`}
        role="region"
        aria-label={`Primary Timer: ${timer.label || 'Unlabeled timer'}`}
        aria-live={isCurrentTimer ? "polite" : "off"}
      >
        {/* Circular Timer Display */}
        <Center position="relative">
          {/* Progress Ring */}
          <Box
            position="absolute"
            w={{ base: "280px", md: "320px", lg: "360px" }}
            h={{ base: "280px", md: "320px", lg: "360px" }}
            borderRadius="full"
          >
            {/* Background ring */}
            <Circle
              size="100%"
              bg="rgba(255, 255, 255, 0.03)"
              border="2px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
              position="absolute"
              className="smooth-transition"
            />

            {/* Progress ring */}
            {progress > 0 && (
              <Box
                position="absolute"
                inset={0}
                borderRadius="full"
                style={{
                  background: `conic-gradient(from 0deg, #0d7fe6 0deg, #0d7fe6 ${progress * 3.6}deg, transparent ${progress * 3.6}deg)`
                }}
                opacity={0.6}
                className="smooth-transition"
                _before={{
                  content: '""',
                  position: 'absolute',
                  inset: '4px',
                  borderRadius: 'full',
                  bg: 'transparent',
                  backdropFilter: 'blur(1px)'
                }}
              />
            )}
          </Box>

          {/* Central Timer Display */}
          <VStack
            gap={{ base: 3, md: 4 }}
            textAlign="center"
            zIndex={2}
          >
            {/* Timer Status Indicator */}
            {(isTimerRunning || isCompleted) && (
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                mb={2}
              >
                {isTimerRunning && (
                  <Box
                    w={3}
                    h={3}
                    bg="accent.400"
                    borderRadius="full"
                    className=""
                  />
                )}
                {isCompleted && (
                  <Circle
                    size={6}
                    bg="accent.500"
                    color="white"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    ✓
                  </Circle>
                )}
                <Text
                  color={isCompleted ? "accent.300" : "primary.300"}
                  fontSize="sm"
                  fontWeight="500"
                  textTransform="uppercase"
                  letterSpacing="0.1em"
                >
                  {isCompleted ? "Complete" : "Active"}
                </Text>
              </Box>
            )}

            {/* Massive Timer Display */}
            <Box textAlign="center">
              <Text
                fontSize="var(--font-size-timer-primary)"
                fontWeight="var(--font-weight-timer)"
                fontFamily="var(--font-meditation-mono)"
                color="white"
                letterSpacing="-0.02em"
                lineHeight="0.9"
                textShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
                aria-label={`${timer.minutes} minutes and ${timer.seconds} seconds remaining`}
                className="zen-transition"
              >
                {String(timer.minutes).padStart(2, '0')}
                <Text
                  as="span"
                  color="rgba(255, 255, 255, 0.4)"
                  fontSize="var(--font-size-timer-secondary)"
                  aria-hidden="true"
                >
                  :
                </Text>
                {String(timer.seconds).padStart(2, '0')}
              </Text>
            </Box>

            {/* Timer Label */}
            {timer.label && (
              <Text
                color="rgba(255, 255, 255, 0.7)"
                fontSize={{ base: "md", md: "lg" }}
                fontWeight="300"
                maxW="200px"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                mt={2}
              >
                {timer.label}
              </Text>
            )}

            {/* Progress Indicator */}
            {progress > 0 && (
              <Text
                color="rgba(255, 255, 255, 0.5)"
                fontSize="sm"
                fontWeight="300"
                mt={1}
              >
                {Math.round(progress)}% complete
              </Text>
            )}
          </VStack>
        </Center>

        {/* Floating Controls - Only show in setup mode */}
        {showControls && (
          <VStack
            gap={4}
            mt={8}
            className="zen-emerge"
          >
            {/* Label Input */}
            <Input
              placeholder="Name this meditation..."
              value={timer.label}
              onChange={(e) => onUpdateTimer(timer.id, { label: e.target.value })}
              bg="rgba(255, 255, 255, 0.05)"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
              color="white"
              fontSize="md"
              h={12}
              rounded="3xl"
              disabled={isRunning}
              textAlign="center"
              _placeholder={{ color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center' }}
              _focus={{
                borderColor: 'primary.400',
                boxShadow: '0 0 0 3px rgba(13, 127, 230, 0.1)',
                bg: 'rgba(255, 255, 255, 0.08)'
              }}
              className="zen-transition"
            />

            {/* Time Controls */}
            <Box
              w="full"
              maxW="400px"
              mx="auto"
              overflow="visible"
              className="meditation-timer-controls"
            >
              <HStack
                gap={{ base: 4, md: 8 }}
                justify="center"
                flexWrap="nowrap"
                w="full"
              >
                <VStack gap={3} flex="1" minW="0">
                  <Text
                    color="rgba(255, 255, 255, 0.6)"
                    fontSize="xs"
                    fontWeight="500"
                    letterSpacing="0.1em"
                  >
                    MINUTES
                  </Text>
                  <NumberInput.Root
                    value={timer.originalMinutes.toString()}
                    min={0}
                    max={99}
                    disabled={isRunning}
                    onValueChange={(details) => {
                      const value = Math.max(0, parseInt(details.value) || 0)
                      onUpdateTimer(timer.id, {
                        minutes: timer.status === 'pending' ? value : timer.minutes,
                        originalMinutes: value
                      })
                    }}
                  >
                    <HStack gap={2} justify="center">
                      <NumberInput.DecrementTrigger asChild>
                        <IconButton
                          size={{ base: "md", md: "lg" }}
                          minW={{ base: "44px", md: "48px" }}
                          minH={{ base: "44px", md: "48px" }}
                          bg="rgba(255, 255, 255, 0.05)"
                          color="rgba(255, 255, 255, 0.7)"
                          border="1px solid rgba(255, 255, 255, 0.1)"
                          className="meditation-button"
                          _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                          aria-label="Decrease minutes"
                          flexShrink={0}
                        >
                          <LuMinus size={16} />
                        </IconButton>
                      </NumberInput.DecrementTrigger>
                      <NumberInput.ValueText
                        textAlign="center"
                        fontSize={{ base: "lg", md: "xl" }}
                        fontWeight="200"
                        color="white"
                        bg="rgba(255, 255, 255, 0.03)"
                        px={{ base: 3, md: 4 }}
                        py={3}
                        minWidth={{ base: "60px", md: "70px" }}
                        maxWidth={{ base: "70px", md: "80px" }}
                        rounded="2xl"
                        border="1px solid rgba(255, 255, 255, 0.1)"
                        flexShrink={0}
                      />
                      <NumberInput.IncrementTrigger asChild>
                        <IconButton
                          size={{ base: "md", md: "lg" }}
                          minW={{ base: "44px", md: "48px" }}
                          minH={{ base: "44px", md: "48px" }}
                          bg="rgba(255, 255, 255, 0.05)"
                          color="rgba(255, 255, 255, 0.7)"
                          border="1px solid rgba(255, 255, 255, 0.1)"
                          className="meditation-button"
                          _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                          aria-label="Increase minutes"
                          flexShrink={0}
                        >
                          <LuPlus size={16} />
                        </IconButton>
                      </NumberInput.IncrementTrigger>
                    </HStack>
                  </NumberInput.Root>
                </VStack>

                <VStack gap={3} flex="1" minW="0">
                  <Text
                    color="rgba(255, 255, 255, 0.6)"
                    fontSize="xs"
                    fontWeight="500"
                    letterSpacing="0.1em"
                  >
                    SECONDS
                  </Text>
                  <NumberInput.Root
                    value={timer.originalSeconds.toString()}
                    min={0}
                    max={59}
                    disabled={isRunning}
                    onValueChange={(details) => {
                      const value = Math.max(0, Math.min(59, parseInt(details.value) || 0))
                      onUpdateTimer(timer.id, {
                        seconds: timer.status === 'pending' ? value : timer.seconds,
                        originalSeconds: value
                      })
                    }}
                  >
                    <HStack gap={2} justify="center">
                      <NumberInput.DecrementTrigger asChild>
                        <IconButton
                          size={{ base: "md", md: "lg" }}
                          minW={{ base: "44px", md: "48px" }}
                          minH={{ base: "44px", md: "48px" }}
                          bg="rgba(255, 255, 255, 0.05)"
                          color="rgba(255, 255, 255, 0.7)"
                          border="1px solid rgba(255, 255, 255, 0.1)"
                          className="meditation-button"
                          _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                          aria-label="Decrease seconds"
                          flexShrink={0}
                        >
                          <LuMinus size={16} />
                        </IconButton>
                      </NumberInput.DecrementTrigger>
                      <NumberInput.ValueText
                        textAlign="center"
                        fontSize={{ base: "lg", md: "xl" }}
                        fontWeight="200"
                        color="white"
                        bg="rgba(255, 255, 255, 0.03)"
                        px={{ base: 3, md: 4 }}
                        py={3}
                        minWidth={{ base: "60px", md: "70px" }}
                        maxWidth={{ base: "70px", md: "80px" }}
                        rounded="2xl"
                        border="1px solid rgba(255, 255, 255, 0.1)"
                        flexShrink={0}
                      />
                      <NumberInput.IncrementTrigger asChild>
                        <IconButton
                          size={{ base: "md", md: "lg" }}
                          minW={{ base: "44px", md: "48px" }}
                          minH={{ base: "44px", md: "48px" }}
                          bg="rgba(255, 255, 255, 0.05)"
                          color="rgba(255, 255, 255, 0.7)"
                          border="1px solid rgba(255, 255, 255, 0.1)"
                          className="meditation-button"
                          _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                          aria-label="Increase seconds"
                          flexShrink={0}
                        >
                          <LuPlus size={16} />
                        </IconButton>
                      </NumberInput.IncrementTrigger>
                    </HStack>
                  </NumberInput.Root>
                </VStack>
              </HStack>
            </Box>

            {/* Action Buttons */}
            <HStack justify="space-between" w="full" mt={4}>
              <Button
                bg="rgba(255, 255, 255, 0.05)"
                border="1px solid rgba(255, 255, 255, 0.1)"
                color="rgba(255, 255, 255, 0.7)"
                className="meditation-button"
                _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                onClick={onAddTimer}
                disabled={isRunning}
                px={6}
                py={3}
                rounded="3xl"
              >
                + Add Timer
              </Button>

              {canRemove && (
                <IconButton
                  bg="rgba(255, 255, 255, 0.05)"
                  color="rgba(255, 255, 255, 0.7)"
                  border="1px solid rgba(255, 255, 255, 0.1)"
                  className="meditation-button"
                  _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                  onClick={() => onRemoveTimer(timer.id)}
                  aria-label="Remove timer"
                  rounded="3xl"
                >
                  <LuX size={18} />
                </IconButton>
              )}
            </HStack>
          </VStack>
        )}
      </Box>
    )
  }

  // Secondary and tertiary modes for sidebar/compact display
  return (
    <Box
      w="full"
      p={displayMode === 'tertiary' ? 3 : 4}
      bg={displayMode === 'tertiary' ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.05)"}
      border="1px solid"
      borderColor={
        isCompleted
          ? "accent.400"
          : isCurrentTimer
            ? "primary.400"
            : "rgba(255, 255, 255, 0.1)"
      }
      rounded={displayMode === 'tertiary' ? "lg" : "xl"}
      className={`zen-transition ${isCompleted ? 'completion-celebration' : ''}`}
      role="region"
      aria-label={`Timer ${index + 1}: ${timer.label || 'Unlabeled'}`}
      aria-live={isCurrentTimer ? "polite" : "off"}
    >
      <VStack gap={displayMode === 'tertiary' ? 2 : 3}>
        {/* Compact Header & Status */}
        <HStack justify="space-between" w="full">
          <HStack gap={2}>
            <Text
              color="white"
              fontSize={displayMode === 'tertiary' ? "sm" : "md"}
              fontWeight="400"
              opacity={0.8}
            >
              {timer.label || `Timer ${index + 1}`}
            </Text>
            {isTimerRunning && (
              <Box
                w={2}
                h={2}
                bg="accent.400"
                rounded="full"
                className=""
              />
            )}
            {isCompleted && (
              <Circle
                size={4}
                bg="accent.500"
                color="white"
                fontSize="2xs"
              >
                ✓
              </Circle>
            )}
          </HStack>

          {displayMode !== 'tertiary' && (
            <Text
              color="rgba(255, 255, 255, 0.4)"
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="0.05em"
              fontWeight="400"
            >
              {timer.status}
            </Text>
          )}
        </HStack>

        {/* Compact Time Display */}
        <Box
          textAlign="center"
          py={displayMode === 'tertiary' ? 2 : 3}
          role="timer"
          aria-live={isCurrentTimer && isTimerRunning ? "polite" : "off"}
        >
          <Text
            color="white"
            fontSize={displayMode === 'tertiary' ? "var(--font-size-timer-tertiary)" : "var(--font-size-timer-secondary)"}
            fontWeight="var(--font-weight-timer)"
            fontFamily="var(--font-meditation-mono)"
            letterSpacing="-0.01em"
            lineHeight="1"
            aria-label={`${timer.minutes} minutes and ${timer.seconds} seconds remaining`}
            className="zen-transition"
          >
            {String(timer.minutes).padStart(2, '0')}
            <Text as="span" color="rgba(255, 255, 255, 0.4)" aria-hidden="true">
              :
            </Text>
            {String(timer.seconds).padStart(2, '0')}
          </Text>

          {progress > 0 && displayMode !== 'tertiary' && (
            <Text
              color="rgba(255, 255, 255, 0.4)"
              fontSize="xs"
              mt={1}
              fontWeight="300"
            >
              {Math.round(progress)}%
            </Text>
          )}
        </Box>

        {/* Compact Controls - Only in setup mode */}
        {showControls && displayMode === 'secondary' && (
          <Box w="full" overflow="visible" className="meditation-timer-controls">
            <HStack
              gap={3}
              w="full"
              justify="center"
              flexWrap="nowrap"
              maxW="300px"
              mx="auto"
            >
              <NumberInput.Root
                value={timer.originalMinutes.toString()}
                min={0}
                max={99}
                size="sm"
                disabled={isRunning}
                onValueChange={(details) => {
                  const value = Math.max(0, parseInt(details.value) || 0)
                  onUpdateTimer(timer.id, {
                    minutes: timer.status === 'pending' ? value : timer.minutes,
                    originalMinutes: value
                  })
                }}
              >
                <HStack gap={1}>
                  <NumberInput.DecrementTrigger asChild>
                    <IconButton
                      size="sm"
                      minW="40px"
                      minH="40px"
                      bg="rgba(255, 255, 255, 0.05)"
                      color="rgba(255, 255, 255, 0.6)"
                      border="1px solid rgba(255, 255, 255, 0.1)"
                      className="meditation-button"
                      _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                      aria-label="Decrease minutes"
                      flexShrink={0}
                    >
                      <LuMinus size={12} />
                    </IconButton>
                  </NumberInput.DecrementTrigger>
                  <NumberInput.ValueText
                    textAlign="center"
                    fontSize="sm"
                    color="white"
                    bg="rgba(255, 255, 255, 0.03)"
                    px={2}
                    py={1}
                    minWidth="36px"
                    maxWidth="44px"
                    rounded="xl"
                    border="1px solid rgba(255, 255, 255, 0.1)"
                    flexShrink={0}
                  />
                  <NumberInput.IncrementTrigger asChild>
                    <IconButton
                      size="sm"
                      minW="40px"
                      minH="40px"
                      bg="rgba(255, 255, 255, 0.05)"
                      color="rgba(255, 255, 255, 0.6)"
                      border="1px solid rgba(255, 255, 255, 0.1)"
                      className="meditation-button"
                      _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                      aria-label="Increase minutes"
                      flexShrink={0}
                    >
                      <LuPlus size={12} />
                    </IconButton>
                  </NumberInput.IncrementTrigger>
                </HStack>
              </NumberInput.Root>

              <Text
                color="rgba(255, 255, 255, 0.4)"
                fontSize="xs"
                mx={1}
                flexShrink={0}
              >
                :
              </Text>

              <NumberInput.Root
                value={timer.originalSeconds.toString()}
                min={0}
                max={59}
                size="sm"
                disabled={isRunning}
                onValueChange={(details) => {
                  const value = Math.max(0, Math.min(59, parseInt(details.value) || 0))
                  onUpdateTimer(timer.id, {
                    seconds: timer.status === 'pending' ? value : timer.seconds,
                    originalSeconds: value
                  })
                }}
              >
                <HStack gap={1}>
                  <NumberInput.DecrementTrigger asChild>
                    <IconButton
                      size="sm"
                      minW="40px"
                      minH="40px"
                      bg="rgba(255, 255, 255, 0.05)"
                      color="rgba(255, 255, 255, 0.6)"
                      border="1px solid rgba(255, 255, 255, 0.1)"
                      className="meditation-button"
                      _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                      aria-label="Decrease seconds"
                      flexShrink={0}
                    >
                      <LuMinus size={12} />
                    </IconButton>
                  </NumberInput.DecrementTrigger>
                  <NumberInput.ValueText
                    textAlign="center"
                    fontSize="sm"
                    color="white"
                    bg="rgba(255, 255, 255, 0.03)"
                    px={2}
                    py={1}
                    minWidth="36px"
                    maxWidth="44px"
                    rounded="xl"
                    border="1px solid rgba(255, 255, 255, 0.1)"
                    flexShrink={0}
                  />
                  <NumberInput.IncrementTrigger asChild>
                    <IconButton
                      size="sm"
                      minW="40px"
                      minH="40px"
                      bg="rgba(255, 255, 255, 0.05)"
                      color="rgba(255, 255, 255, 0.6)"
                      border="1px solid rgba(255, 255, 255, 0.1)"
                      className="meditation-button"
                      _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                      aria-label="Increase seconds"
                      flexShrink={0}
                    >
                      <LuPlus size={12} />
                    </IconButton>
                  </NumberInput.IncrementTrigger>
                </HStack>
              </NumberInput.Root>
            </HStack>
          </Box>
        )}

        {/* Compact Action Buttons - Only show if needed */}
        {showControls && canRemove && displayMode !== 'tertiary' && (
          <HStack justify="space-between" w="full" mt={2}>
            <Button
              size="sm"
              bg="rgba(255, 255, 255, 0.05)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              color="rgba(255, 255, 255, 0.7)"
              className="meditation-button"
              onClick={onAddTimer}
              disabled={isRunning}
              fontSize="xs"
            >
              + Add
            </Button>

            <IconButton
              size="sm"
              bg="rgba(255, 255, 255, 0.05)"
              color="rgba(255, 255, 255, 0.6)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              className="meditation-button"
              onClick={() => onRemoveTimer(timer.id)}
              aria-label="Remove timer"
            >
              <LuX size={14} />
            </IconButton>
          </HStack>
        )}

      </VStack>
    </Box>
  )
}