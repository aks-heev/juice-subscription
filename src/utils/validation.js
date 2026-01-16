// Form validation utility functions

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
        return 'Email is required'
    }
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address'
    }
    return null
}

export const validatePassword = (password) => {
    if (!password) {
        return 'Password is required'
    }
    if (password.length < 6) {
        return 'Password must be at least 6 characters long'
    }
    return null
}

export const validatePhone = (phone) => {
    // Indian phone number format: 10 digits
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phone) {
        return 'Phone number is required'
    }
    if (!phoneRegex.test(phone)) {
        return 'Please enter a valid 10-digit phone number'
    }
    return null
}

export const validateRequired = (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
        return `${fieldName} is required`
    }
    return null
}

export const validateDate = (date, fieldName = 'Date') => {
    if (!date) {
        return `${fieldName} is required`
    }
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
        return 'Start date cannot be in the past'
    }
    return null
}

export const validateName = (name) => {
    if (!name || !name.trim()) {
        return 'Name is required'
    }
    if (name.trim().length < 2) {
        return 'Name must be at least 2 characters long'
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
        return 'Name can only contain letters and spaces'
    }
    return null
}

export const validateAddress = (address) => {
    if (!address || !address.trim()) {
        return 'Address is required'
    }
    if (address.trim().length < 10) {
        return 'Please enter a complete address (at least 10 characters)'
    }
    return null
}

export const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) {
        return 'Please confirm your password'
    }
    if (password !== confirmPassword) {
        return 'Passwords do not match'
    }
    return null
}
