export const REGEX = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|in|co|io|ai|biz|info|me|dev|app|tech|cloud|online|site|store|[a-zA-Z]{2}(?:\.[a-zA-Z]{2})?)$/i,
    phone: /^[6-9]\d{9}$/,
    pincode: /^[1-9][0-9]{5}$/,
    // Option B: At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^~_\-])[A-Za-z\d@$!%*?&#^~_\-]{8,}$/,
};

export const VALIDATION_MESSAGES = {
    email: "Please enter a valid email address (e.g. name@example.com)",
    phone: "Phone number must be a valid 10-digit number starting with 6, 7, 8, or 9",
    pincode: "Pincode must be a valid 6-digit postal code",
    password: "Password must be at least 8 characters long with uppercase, lowercase, number, and special character (@$!%*?&#^~_-)",
};

export const isValidEmail = (email) => {
    return REGEX.email.test(String(email || "").trim());
};

export const isValidPhone = (phone) => {
    return REGEX.phone.test(String(phone || "").trim());
};

export const isValidPincode = (pincode, country = "India") => {
    const val = String(pincode || "").trim();
    if (!val) return false;
    const isIndia = !country || country.toLowerCase() === "india";
    if (isIndia) {
        return REGEX.pincode.test(val);
    }
    return /^[a-zA-Z0-9\s-]{3,10}$/.test(val);
};

export const isValidPassword = (password) => {
    return REGEX.password.test(String(password || ""));
};
