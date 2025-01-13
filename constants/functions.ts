export function generateHexID(length: number = 8): string {
    const characters = '0123456789abcdef';
    let hexID = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      hexID += characters[randomIndex];
    }
    return hexID;
  }  