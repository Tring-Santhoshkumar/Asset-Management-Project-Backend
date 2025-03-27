import crypto from 'crypto';

export const generatePassword = (length = 8) => {
    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const smallCase = "abcdefghijklmnopqrstuvwxyz";
    const specialCharacters = "!@#$%^&*(),.<>?";
    const numbers = "0123456789";
    let password = "";
    password += upperCase[crypto.randomInt(0, upperCase.length)];
    password += specialCharacters[crypto.randomInt(0, specialCharacters.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    for (let i = password.length; i < length; i++) {
        password += smallCase[crypto.randomInt(0, smallCase.length)];
    }
    return password;
};
