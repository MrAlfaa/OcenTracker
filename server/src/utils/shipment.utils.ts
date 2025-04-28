/**
 * Generates a unique tracking number with the format OCT + timestamp + 4 random chars
 */
export const generateTrackingNumber = (): string => {
  const prefix = 'OCT';
  const timestamp = Date.now().toString().slice(-8);
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomChars = '';
  
  for (let i = 0; i < 4; i++) {
    randomChars += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return `${prefix}${timestamp}${randomChars}`;
};