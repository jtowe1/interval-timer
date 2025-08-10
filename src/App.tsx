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
import { CircularTimer } from './components/CircularTimer'
import { useTimer } from './hooks/useTimer'
import { useAudio } from './hooks/useAudio'
import { meditationColors } from './theme/colors'


const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Enhanced meditation colors
        primary: Object.fromEntries(
          Object.entries(meditationColors.meditation.primary).map(([key, value]) => [key, { value }])
        ),
        secondary: Object.fromEntries(
          Object.entries(meditationColors.meditation.secondary).map(([key, value]) => [key, { value }])
        ),
        accent: Object.fromEntries(
          Object.entries(meditationColors.meditation.nature).map(([key, value]) => [key, { value }])
        ),
        earth: Object.fromEntries(
          Object.entries(meditationColors.meditation.earth).map(([key, value]) => [key, { value }])
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
  const { initializeAudio, playChime } = useAudio()
  
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
    // Initialize audio for chime sounds
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



  return (
    <ChakraProvider value={system}>
      <Box
        minH="100vh"
        bg={mode === 'session' 
          ? "linear-gradient(135deg, #0a1018 0%, #0f172a 40%, #1e293b 100%)"
          : "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
        }
        display="flex"
        alignItems={mode === 'session' ? 'flex-start' : 'center'}
        justifyContent="center"
        px={{ base: 4, sm: 6, md: 8 }}
        py={{ base: 4, sm: 6 }}
        pt={mode === 'session' ? { base: 6, md: 8 } : { base: 4, sm: 6 }}
        role="main"
        aria-label="Meditation Timer Application"
        className="zen-transition"
        position="relative"
        overflow="hidden"
      >
        {/* Session Mode - Floating Layout */}
        {mode === 'session' ? (
          <Box 
            w="full" 
            maxW="1200px"
            mx="auto"
            position="relative"
            className="zen-emerge"
          >
            <Box
              display="flex"
              flexDirection={{ base: 'column', lg: 'row' }}
              gap={{ base: 6, lg: 8 }}
              alignItems={{ base: 'center', lg: 'flex-start' }}
              justifyContent="center"
            >
              {/* Circular Timer Display */}
              <Box 
                flex="1" 
                maxW={{ base: '100%', lg: '600px' }}
                display="flex"
                justifyContent="center"
              >
                <CircularTimer
                  timers={appState.timers}
                  currentTimerIndex={appState.currentTimerIndex}
                  isRunning={appState.isRunning}
                  onUpdateTimer={updateTimer}
                  onAddTimer={addTimer}
                  onRemoveTimer={removeTimer}
                  mode="session"
                />
              </Box>
            </Box>
            
            {/* Session Controls */}
            <VStack gap={4} mt={8} align="center">
              {/* Session Progress */}
              <Text
                color="primary.300"
                fontSize="lg"
                fontWeight="300"
                textAlign="center"
                className="meditation-flow"
              >
                Timer {appState.currentTimerIndex + 1} of {appState.timers.length}
              </Text>
              
              {/* Session Action Buttons */}
              <VStack gap={3} w={{ base: '100%', sm: '400px' }}>
                <Button
                  bg="red.500"
                  color="white"
                  className="meditation-button"
                  _hover={{
                    bg: 'red.400',
                    transform: 'translateY(-1px)'
                  }}
                  _focus={{
                    outline: '3px solid',
                    outlineColor: 'red.300',
                    outlineOffset: '2px'
                  }}
                  w="full"
                  h={14}
                  fontSize="lg"
                  fontWeight="400"
                  rounded="xl"
                  onClick={handleStopMeditation}
                  boxShadow="0 4px 20px rgba(239, 68, 68, 0.25)"
                  aria-label="End meditation session and return to setup"
                >
                  End Meditation
                </Button>
                
                <Button
                  bg="transparent"
                  border="1px solid rgba(255, 255, 255, 0.1)"
                  color="rgba(255, 255, 255, 0.7)"
                  className="meditation-button"
                  _hover={{ 
                    bg: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  }}
                  w="full"
                  h={12}
                  fontSize="md"
                  fontWeight="300"
                  rounded="xl"
                  onClick={() => setMode('setup')}
                  aria-label="Return to timer setup mode"
                >
                  Back to Setup
                </Button>
              </VStack>
            </VStack>
          </Box>
        ) : (
          /* Setup Mode - Centered Layout */
          <Box 
            maxW="500px"
            w="full"
            mx="auto"
          >
            <VStack gap={8} align="center">
              {/* Header */}
              <VStack gap={3} mb={4} className="fade-in">
                <Heading 
                  size={{ base: '2xl', md: '3xl' }} 
                  color="white" 
                  fontWeight="200" 
                  textAlign="center"
                  letterSpacing="-0.02em"
                  as="h1"
                  fontFamily="var(--font-meditation-display)"
                >
                  Meditation Timer
                </Heading>
                <Text
                  color="rgba(255, 255, 255, 0.6)"
                  fontSize="md"
                  fontWeight="300"
                  textAlign="center"
                  maxW="400px"
                  lineHeight="1.6"
                  px={{ base: 2, sm: 0 }}
                >
                  Create your mindful practice with personalized interval timers
                </Text>
              </VStack>

              {/* Circular Timer Setup */}
              <CircularTimer
                timers={appState.timers}
                currentTimerIndex={-1} // No current timer in setup mode
                isRunning={appState.isRunning}
                onUpdateTimer={updateTimer}
                onAddTimer={addTimer}
                onRemoveTimer={removeTimer}
                mode="setup"
              />


              {/* Main Action Button */}
              <Button
                bg="accent.500"
                color="white"
                className="meditation-button"
                _hover={{
                  bg: 'accent.400',
                  transform: 'translateY(-1px)'
                }}
                _focus={{
                  outline: '3px solid',
                  outlineColor: 'accent.300',
                  outlineOffset: '2px'
                }}
                w="full"
                h={16}
                fontSize="xl"
                fontWeight="300"
                rounded="xl"
                onClick={handleStartMeditation}
                mt={6}
                boxShadow="0 8px 30px rgba(82, 166, 82, 0.3)"
                aria-label="Begin meditation with configured timers"
                autoFocus
              >
                Begin Meditation
              </Button>
            </VStack>
          </Box>
        )}
      </Box>
    </ChakraProvider>
  )
}

export default App