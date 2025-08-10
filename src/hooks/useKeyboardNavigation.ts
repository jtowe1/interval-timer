import { useEffect } from 'react'

interface UseKeyboardNavigationProps {
  isRunning: boolean
  onStartStop: () => void
  onAddTimer?: () => void
  onToggleMode?: () => void
}

export const useKeyboardNavigation = ({
  isRunning,
  onStartStop,
  onAddTimer,
  onToggleMode
}: UseKeyboardNavigationProps) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent action if user is typing in an input
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (event.key.toLowerCase()) {
        case ' ':
        case 'enter':
          // Space or Enter: Start/Stop meditation
          event.preventDefault()
          onStartStop()
          break
        
        case 'a':
          // A: Add timer (only when not running)
          if (!isRunning && onAddTimer) {
            event.preventDefault()
            onAddTimer()
          }
          break
        
        case 'escape':
          // Escape: Toggle mode or stop
          event.preventDefault()
          if (isRunning) {
            onStartStop() // Stop meditation
          } else if (onToggleMode) {
            onToggleMode() // Switch between setup/session
          }
          break
        
        case '?':
          // Show help/shortcuts
          event.preventDefault()
          showKeyboardShortcuts()
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [isRunning, onStartStop, onAddTimer, onToggleMode])

  const showKeyboardShortcuts = () => {
    alert(
      'Keyboard Shortcuts:\n\n' +
      'Space/Enter - Start/Stop meditation\n' +
      'A - Add new timer (setup mode)\n' +
      'Escape - Stop meditation or change mode\n' +
      '? - Show this help'
    )
  }
}