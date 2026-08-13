
export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString()    
}

export function otpKey(email) {
    return `otp:${email}`
}