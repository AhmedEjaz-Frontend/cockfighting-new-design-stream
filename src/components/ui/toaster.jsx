import { notification } from 'antd'

// Configure Ant Design notification globally with enhanced styling
notification.config({
  placement: 'topRight',
  duration: 4.5,
  maxCount: 5,
  rtl: false,
})

// Enhanced styles for notifications
const getNotificationStyle = (status) => {
  const baseStyle = {
    fontFamily: "'Venite Adoremus', 'Poppins', 'Inter', sans-serif",
    borderRadius: '12px',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  }

  switch (status) {
    case 'success':
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.9))',
        borderColor: 'rgba(34, 197, 94, 0.3)',
      }
    case 'error':
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
        borderColor: 'rgba(239, 68, 68, 0.3)',
      }
    case 'warning':
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(217, 119, 6, 0.9))',
        borderColor: 'rgba(245, 158, 11, 0.3)',
      }
    default:
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9))',
        borderColor: 'rgba(59, 130, 246, 0.3)',
      }
  }
}

// Create toaster object with methods that match the existing API
export const toaster = {
  create: ({ title, description, status = 'info', duration = 4500 }) => {
    const style = getNotificationStyle(status)
    
    const config = {
      message: title || 'Notification',
      description: description || '',
      duration: duration / 1000, // Convert to seconds
      placement: 'topRight',
      style: {
        ...style,
        color: 'white',
        fontWeight: '500',
      },
      className: 'custom-notification',
    }

    switch (status) {
      case 'success':
        notification.success(config)
        break
      case 'error':
        notification.error(config)
        break
      case 'warning':
        notification.warning(config)
        break
      case 'info':
      default:
        notification.info(config)
        break
    }
  },
  
  // Additional methods for direct usage
  success: (config) => notification.success({ ...config, style: getNotificationStyle('success') }),
  error: (config) => notification.error({ ...config, style: getNotificationStyle('error') }),
  warning: (config) => notification.warning({ ...config, style: getNotificationStyle('warning') }),
  info: (config) => notification.info({ ...config, style: getNotificationStyle('info') }),
  destroy: () => notification.destroy(),
  destroyAll: () => notification.destroy(),
}

// Toaster component is no longer needed with Ant Design notifications
// The notifications are rendered automatically by Ant Design
export const Toaster = () => {
  return null
}
