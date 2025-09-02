'use client'

import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
  Box,
} from '@chakra-ui/react'

export const toaster = createToaster({
  placement: 'top-right',
  pauseOnPageIdle: true,
  max: 5,
})

const getToastStyles = (status) => {
  const baseStyles = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '15px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
    padding: '16px 20px',
    minWidth: '320px',
    maxWidth: '400px',
    animation: 'slideInFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  }

  const statusStyles = {
    success: {
      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(21, 128, 61, 0.95) 100%)',
      borderLeft: '4px solid #10b981',
      color: 'white',
    },
    error: {
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(185, 28, 28, 0.95) 100%)',
      borderLeft: '4px solid #ef4444',
      color: 'white',
    },
    warning: {
      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(180, 83, 9, 0.95) 100%)',
      borderLeft: '4px solid #f59e0b',
      color: 'white',
    },
    info: {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(29, 78, 216, 0.95) 100%)',
      borderLeft: '4px solid #3b82f6',
      color: 'white',
    },
  }

  return { ...baseStyles, ...statusStyles[status] }
}

export const Toaster = () => {
  return (
    <>
      <style>
        {`
          @keyframes slideInFromRight {
            from {
              transform: translateX(100%) scale(0.9);
              opacity: 0;
            }
            to {
              transform: translateX(0) scale(1);
              opacity: 1;
            }
          }
          
          @keyframes slideOutToRight {
            from {
              transform: translateX(0) scale(1);
              opacity: 1;
            }
            to {
              transform: translateX(100%) scale(0.9);
              opacity: 0;
            }
          }
          
          .toast-container {
            position: relative;
            overflow: hidden;
          }
          
          .toast-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            animation: shimmer 2s infinite;
          }
          
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          
          .toast-indicator {
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>
      <Portal>
        <ChakraToaster 
          toaster={toaster} 
          insetInline={{ base: '4', md: '6' }}
          insetBlockStart='6'
        >
          {(toast) => (
            <Box
              className="toast-container"
              style={getToastStyles(toast.status)}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.15)',
              }}
            >
              <Toast.Root>
                <Stack direction='row' gap='3' align='flex-start'>
                  {toast.type === 'loading' ? (
                    <Spinner size='sm' color='white' />
                  ) : (
                    <Box className="toast-indicator">
                      <Toast.Indicator />
                    </Box>
                  )}
                  <Stack gap='1' flex='1'>
                    {toast.title && (
                      <Toast.Title 
                        fontSize='md' 
                        fontWeight='600'
                        fontFamily="'Poppins', 'Inter', sans-serif"
                      >
                        {toast.title}
                      </Toast.Title>
                    )}
                    {toast.description && (
                      <Toast.Description 
                        fontSize='sm' 
                        opacity='0.9'
                        fontFamily="'Poppins', 'Inter', sans-serif"
                      >
                        {toast.description}
                      </Toast.Description>
                    )}
                  </Stack>
                  {toast.closable && (
                    <Toast.CloseTrigger 
                      _hover={{ 
                        bg: 'rgba(255, 255, 255, 0.2)',
                        transform: 'scale(1.1)'
                      }}
                      transition='all 0.2s'
                      borderRadius='full'
                      p='1'
                    />
                  )}
                </Stack>
                {toast.action && (
                  <Toast.ActionTrigger 
                    mt='3'
                    bg='rgba(255, 255, 255, 0.2)'
                    _hover={{ bg: 'rgba(255, 255, 255, 0.3)' }}
                    borderRadius='8px'
                    px='3'
                    py='2'
                    fontSize='sm'
                    fontWeight='500'
                  >
                    {toast.action.label}
                  </Toast.ActionTrigger>
                )}
              </Toast.Root>
            </Box>
          )}
        </ChakraToaster>
      </Portal>
    </>
  )
}
