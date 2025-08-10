import { useState } from 'react'
import {
  ChakraProvider,
  Box,
  Heading,
  Button,
  Text,
  VStack,
  createSystem,
  defineConfig
} from '@chakra-ui/react'
import { LuVolumeX } from "react-icons/lu"
import { TimerCard } from './components/TimerCard'
import { useTimer } from './hooks/useTimer'
import { useAudio } from './hooks/useAudio'
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation'
import { meditationColors } from './theme/colors'


const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        primary: Object.fromEntries(
          Object.entries(meditationColors.primary).map(([key, value]) => [key, { value }])
        ),
        secondary: Object.fromEntries(
          Object.entries(meditationColors.secondary).map(([key, value]) => [key, { value }])
        ),
        accent: Object.fromEntries(
          Object.entries(meditationColors.accent).map(([key, value]) => [key, { value }])
        ),
        neutral: Object.fromEntries(
          Object.entries(meditationColors.neutral).map(([key, value]) => [key, { value }])
        ),
      },
    },
  },
})

const system = createSystem(config)

function App() {
  const { audioEnabled, initializeAudio, playChime } = useAudio()
  const {
    appState,
    addTimer,
    updateTimer,
    removeTimer,
    startMeditation,
    stopMeditation
  } = useTimer(playChime)
  
  const [mode, setMode] = useState<'setup' | 'session'>('setup')


  const handleStartMeditation = async () => {
    // Initialize audio with user interaction
    await initializeAudio()
    
    const success = startMeditation()
    if (success) {
      setMode('session')
    }
  }




  const handleStopMeditation = () => {
    stopMeditation()
    setMode('setup')
  }

  const handleToggleMode = () => {
    if (mode === 'setup') {
      setMode('session')
    } else {
      setMode('setup')
    }
  }

  // Keyboard navigation
  useKeyboardNavigation({
    isRunning: appState.isRunning,
    onStartStop: appState.isRunning ? handleStopMeditation : handleStartMeditation,
    onAddTimer: mode === 'setup' ? addTimer : undefined,
    onToggleMode: handleToggleMode
  })

  return (
    <ChakraProvider value={system}>
      <Box
        minH="100vh"
        bg="linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
        role="main"
        aria-label="Meditation Timer Application"
      >
        <Box 
          maxW={{ base: '100%', sm: '400px', md: '500px', lg: '600px' }} 
          w="full"
          mx="auto"
          px={{ base: 2, sm: 4 }}
        >
          <VStack gap={6} align="center">
            {/* Header */}
            <VStack gap={2} mb={2}>
              <Heading 
                size={{ base: 'xl', md: '2xl' }} 
                color="white" 
                fontWeight="400" 
                textAlign="center"
                letterSpacing="-0.025em"
                as="h1"
              >
                Meditation Timer
              </Heading>
              {appState.isRunning && mode === 'session' && (
                <Text 
                  color="primary.300" 
                  fontSize="md" 
                  fontWeight="500"
                  bg="rgba(255, 255, 255, 0.05)"
                  px={4}
                  py={2}
                  rounded="full"
                >
                  Timer {appState.currentTimerIndex + 1} of {appState.timers.length}
                </Text>
              )}
            </VStack>

            {/* Timer Cards - Progressive Disclosure */}
            {mode === 'setup' ? (
              <VStack gap={4} w="full" role="region" aria-labelledby="setup-heading" className="fade-in">
                <Text 
                  id="setup-heading"
                  color="gray.300" 
                  fontSize="md" 
                  textAlign="center" 
                  mb={2}
                  fontWeight="400"
                  as="h2"
                >
                  Configure your meditation timers
                  <Text as="span" fontSize="sm" color="gray.500" display="block" mt={1}>
                    Use Space/Enter to start, A to add timer, ? for help
                  </Text>
                </Text>
                {appState.timers.map((timer, index) => (
                  <TimerCard
                    key={timer.id}
                    timer={timer}
                    index={index}
                    isCurrentTimer={false}
                    isRunning={false}
                    onUpdateTimer={updateTimer}
                    onAddTimer={addTimer}
                    onRemoveTimer={removeTimer}
                    canRemove={appState.timers.length > 1}
                  />
                ))}
              </VStack>
            ) : (
              <VStack gap={4} w="full" role="region" aria-labelledby="session-heading" className="slide-in-left">
                <Text 
                  id="session-heading"
                  color="gray.300" 
                  fontSize="md" 
                  textAlign="center" 
                  mb={2}
                  fontWeight="400"
                  as="h2"
                >
                  Meditation in progress
                  <Text as="span" fontSize="sm" color="gray.500" display="block" mt={1}>
                    Press Space/Enter to stop, Escape to end session
                  </Text>
                </Text>
                {appState.timers.map((timer, index) => {
                  const isCurrentTimer = appState.currentTimerIndex === index
                  
                  // In session mode, only show current timer and completed timers
                  if (timer.status === 'pending' && !isCurrentTimer) {
                    return null
                  }
                  
                  return (
                    <TimerCard
                      key={timer.id}
                      timer={timer}
                      index={index}
                      isCurrentTimer={isCurrentTimer}
                      isRunning={appState.isRunning}
                      onUpdateTimer={updateTimer}
                      onAddTimer={addTimer}
                      onRemoveTimer={removeTimer}
                      canRemove={false} // Disable removal during session
                    />
                  )
                })}
              </VStack>
            )}

            {/* Audio Test Button */}
            {!audioEnabled && mode === 'setup' && (
              <Button
                bg="rgba(255, 255, 255, 0.05)"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.15)"
                color="gray.300"
                className="smooth-transition button-press hover-lift"
                _hover={{ 
                  bg: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.25)'
                }}
                _focus={{
                  outline: '2px solid',
                  outlineColor: 'blue.300',
                  outlineOffset: '2px'
                }}
                w="full"
                h={12}
                minH="44px"
                fontSize="sm"
                fontWeight="500"
                rounded="xl"
                onClick={async () => {
                  await initializeAudio()
                  // Test the chime
                  setTimeout(() => playChime(), 100)
                }}
                aria-label="Enable audio notifications and test the meditation chime sound"
              >
                <LuVolumeX style={{ marginRight: '8px' }} />
                Enable Sound & Test Chime
              </Button>
            )}

            {/* Main Action Button */}
            <Button
              bg={appState.isRunning ? "red.500" : "accent.500"}
              color="white"
              className="smooth-transition button-press"
              _hover={{
                bg: appState.isRunning ? 'red.400' : 'accent.400',
                transform: 'translateY(-1px)'
              }}
              _active={{
                transform: 'translateY(0px)'
              }}
              _focus={{
                outline: '3px solid',
                outlineColor: appState.isRunning ? 'red.300' : 'accent.300',
                outlineOffset: '2px'
              }}
              w="full"
              h={14}
              minH="56px"
              fontSize="lg"
              fontWeight="500"
              rounded="xl"
              onClick={appState.isRunning ? handleStopMeditation : handleStartMeditation}
              mt={4}
              boxShadow={appState.isRunning ? "0 4px 20px rgba(239, 68, 68, 0.25)" : "0 4px 20px rgba(34, 197, 94, 0.25)"}
              transition="all 0.2s ease"
              aria-label={appState.isRunning ? 'End meditation session and return to setup' : 'Begin meditation with configured timers'}
              autoFocus={mode === 'setup'}
            >
              {appState.isRunning ? 'End Meditation' : 'Begin Meditation'}
            </Button>
            
            {mode === 'session' && (
              <Button
                bg="transparent"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.15)"
                color="gray.300"
                className="smooth-transition button-press hover-lift"
                _hover={{ 
                  bg: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.25)'
                }}
                _focus={{
                  outline: '2px solid',
                  outlineColor: 'blue.300',
                  outlineOffset: '2px'
                }}
                w="full"
                h={12}
                minH="44px"
                fontSize="md"
                fontWeight="400"
                rounded="xl"
                onClick={() => setMode('setup')}
                mt={2}
                aria-label="Return to timer setup mode"
              >
                Back to Setup
              </Button>
            )}
          </VStack>
        </Box>
      </Box>
    </ChakraProvider>
  )
}

export default App