import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Input,
  NumberInput,
  IconButton,
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
}: TimerCardProps) => {
  const isCompleted = timer.status === 'completed'
  const isTimerRunning = timer.status === 'running'

  return (
    <Box
      w="full"
      p={6}
      bg="rgba(255, 255, 255, 0.08)"
      border="2px solid"
      borderColor={
        isCompleted 
          ? "teal.400" 
          : isCurrentTimer 
            ? "blue.300" 
            : "rgba(255, 255, 255, 0.15)"
      }
      rounded="xl"
      boxShadow={isCurrentTimer ? "0 8px 32px rgba(59, 130, 246, 0.15)" : "0 4px 16px rgba(0, 0, 0, 0.1)"}
      className={`smooth-transition hover-lift ${isCurrentTimer && isTimerRunning ? 'breathing-animation' : ''} ${isCompleted ? 'completion-bounce' : ''}`}
      _hover={{
        borderColor: isCompleted ? "teal.300" : isCurrentTimer ? "blue.200" : "rgba(255, 255, 255, 0.25)",
      }}
      role="region"
      aria-label={`Timer ${index + 1}: ${timer.label || 'Unlabeled'}`}
      aria-live={isCurrentTimer ? "polite" : "off"}
    >
      <VStack gap={5}>
        {/* Header & Status */}
        <HStack justify="space-between" w="full">
          <HStack gap={3}>
            <Text 
              color="white" 
              fontSize="md" 
              fontWeight="600"
              opacity={0.9}
            >
              Timer {index + 1}
            </Text>
            {isTimerRunning && (
              <Box 
                w={3} 
                h={3} 
                bg="green.400" 
                rounded="full" 
                className="gentle-pulse"
              />
            )}
            {isCompleted && (
              <Box
                w={5}
                h={5}
                bg="teal.400"
                rounded="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="white" fontSize="xs" fontWeight="bold">
                  ✓
                </Text>
              </Box>
            )}
          </HStack>
          <Text 
            color="gray.400" 
            fontSize="xs" 
            textTransform="uppercase"
            letterSpacing="0.05em"
            fontWeight="500"
          >
            {timer.status}
          </Text>
        </HStack>

        {/* Label Input */}
        <Input
          placeholder="Label this timer..."
          value={timer.label}
          onChange={(e) => onUpdateTimer(timer.id, { label: e.target.value })}
          bg="rgba(255, 255, 255, 0.05)"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.15)"
          color="white"
          fontSize="sm"
          h={12}
          minH="44px"
          rounded="lg"
          disabled={isRunning}
          _placeholder={{ color: 'gray.500' }}
          _focus={{ 
            borderColor: 'blue.300',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
            outline: 'none'
          }}
          _disabled={{ 
            opacity: 0.6,
            cursor: 'not-allowed'
          }}
          aria-label={`Label for timer ${index + 1}`}
          aria-describedby={`timer-${timer.id}-description`}
        />

        {/* Time Display - Made Prominent */}
        <Box
          bg="rgba(255, 255, 255, 0.03)"
          p={6}
          rounded="xl"
          w="full"
          textAlign="center"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.08)"
          role="timer"
          aria-live={isCurrentTimer && isTimerRunning ? "polite" : "off"}
          aria-atomic="true"
          className="smooth-transition"
        >
          <Text 
            color="white" 
            fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
            fontWeight="300" 
            fontFamily="mono"
            letterSpacing="0.1em"
            lineHeight="1"
            aria-label={`${timer.minutes} minutes and ${timer.seconds} seconds remaining`}
            id={`timer-${timer.id}-description`}
          >
            {String(timer.minutes).padStart(2, '0')}
            <Text as="span" color="gray.400" fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }} aria-hidden="true">:</Text>
            {String(timer.seconds).padStart(2, '0')}
          </Text>
        </Box>

        {/* Time Controls */}
        <HStack justify="center" gap={{ base: 4, sm: 6, md: 8 }} flexWrap="wrap">
          {/* Minutes */}
          <VStack gap={2}>
            <Text 
              color="gray.400" 
              fontSize="xs" 
              fontWeight="600" 
              letterSpacing="0.1em"
              id={`minutes-label-${timer.id}`}
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
              aria-labelledby={`minutes-label-${timer.id}`}
            >
              <HStack gap={1}>
                <NumberInput.DecrementTrigger asChild>
                  <IconButton
                    variant="outline"
                    size="lg"
                    minW="44px"
                    minH="44px"
                    bg="rgba(255, 255, 255, 0.05)"
                    color="gray.300"
                    borderColor="rgba(255, 255, 255, 0.15)"
                    className="smooth-transition-fast button-press"
                    _hover={{ 
                      bg: 'rgba(255, 255, 255, 0.1)', 
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.25)'
                    }}
                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                    aria-label="Decrease minutes"
                  >
                    <LuMinus size={16} />
                  </IconButton>
                </NumberInput.DecrementTrigger>
                <NumberInput.ValueText
                  textAlign="center"
                  fontSize="xl"
                  fontWeight="500"
                  color="white"
                  bg="rgba(255, 255, 255, 0.05)"
                  px={4}
                  py={3}
                  minW="60px"
                  rounded="md"
                  border="1px solid"
                  borderColor="rgba(255, 255, 255, 0.15)"
                />
                <NumberInput.IncrementTrigger asChild>
                  <IconButton
                    variant="outline"
                    size="lg"
                    minW="44px"
                    minH="44px"
                    bg="rgba(255, 255, 255, 0.05)"
                    color="gray.300"
                    borderColor="rgba(255, 255, 255, 0.15)"
                    className="smooth-transition-fast button-press"
                    _hover={{ 
                      bg: 'rgba(255, 255, 255, 0.1)', 
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.25)'
                    }}
                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                    aria-label="Increase minutes"
                  >
                    <LuPlus size={16} />
                  </IconButton>
                </NumberInput.IncrementTrigger>
              </HStack>
            </NumberInput.Root>
          </VStack>

          {/* Seconds */}
          <VStack gap={2}>
            <Text 
              color="gray.400" 
              fontSize="xs" 
              fontWeight="600" 
              letterSpacing="0.1em"
              id={`seconds-label-${timer.id}`}
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
              aria-labelledby={`seconds-label-${timer.id}`}
            >
              <HStack gap={1}>
                <NumberInput.DecrementTrigger asChild>
                  <IconButton
                    variant="outline"
                    size="lg"
                    minW="44px"
                    minH="44px"
                    bg="rgba(255, 255, 255, 0.05)"
                    color="gray.300"
                    borderColor="rgba(255, 255, 255, 0.15)"
                    className="smooth-transition-fast button-press"
                    _hover={{ 
                      bg: 'rgba(255, 255, 255, 0.1)', 
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.25)'
                    }}
                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                    aria-label="Decrease seconds"
                  >
                    <LuMinus size={16} />
                  </IconButton>
                </NumberInput.DecrementTrigger>
                <NumberInput.ValueText
                  textAlign="center"
                  fontSize="xl"
                  fontWeight="500"
                  color="white"
                  bg="rgba(255, 255, 255, 0.05)"
                  px={4}
                  py={3}
                  minW="60px"
                  rounded="md"
                  border="1px solid"
                  borderColor="rgba(255, 255, 255, 0.15)"
                />
                <NumberInput.IncrementTrigger asChild>
                  <IconButton
                    variant="outline"
                    size="lg"
                    minW="44px"
                    minH="44px"
                    bg="rgba(255, 255, 255, 0.05)"
                    color="gray.300"
                    borderColor="rgba(255, 255, 255, 0.15)"
                    className="smooth-transition-fast button-press"
                    _hover={{ 
                      bg: 'rgba(255, 255, 255, 0.1)', 
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.25)'
                    }}
                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                    aria-label="Increase seconds"
                  >
                    <LuPlus size={16} />
                  </IconButton>
                </NumberInput.IncrementTrigger>
              </HStack>
            </NumberInput.Root>
          </VStack>
        </HStack>

        {/* Control Buttons */}
        <HStack justify="space-between" w="full" mt={2}>
          <Button
            size="md"
            minH="44px"
            px={6}
            bg="rgba(255, 255, 255, 0.05)" 
            border="1px solid" 
            borderColor="rgba(255, 255, 255, 0.15)"
            color="gray.300"
            className="smooth-transition button-press"
            _hover={{ 
              bg: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.25)'
            }}
            onClick={onAddTimer}
            disabled={isRunning}
            _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
            aria-label="Add new timer after this one"
            _focus={{
              outline: '2px solid',
              outlineColor: 'blue.300',
              outlineOffset: '2px'
            }}
          >
            + Add Timer
          </Button>

          <HStack gap={2}>
            <IconButton
              size="lg"
              minW="44px"
              minH="44px"
              bg="rgba(255, 255, 255, 0.08)" 
              color="white" 
              className="smooth-transition button-press"
              _hover={{ bg: 'rgba(255, 255, 255, 0.15)' }}
              _focus={{
                outline: '2px solid',
                outlineColor: 'blue.300',
                outlineOffset: '2px'
              }}
              onClick={() => onRemoveTimer(timer.id)}
              disabled={!canRemove}
              _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
              aria-label={canRemove ? `Remove timer ${index + 1}` : 'Cannot remove the last timer'}
            >
              <LuX size={16} />
            </IconButton>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  )
}