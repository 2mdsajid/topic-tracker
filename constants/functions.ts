export function generateHexID(length: number = 8): string {
  const characters = '0123456789abcdef';
  let hexID = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    hexID += characters[randomIndex];
  }
  return hexID;
}

export function defineBgColorBasedOnRevisions(revision: number = 0): string {
  if (revision === 0) {
    return 'border-red-500'; // Red for 0 revisions
  } else if (revision === 1) {
    return 'border-yellow-500'; // Yellow for 1 revision
  } else if (revision >= 2) {
    return 'border-green-500'; // Green for 2 or more revisions
  }
  return 'border-gray-500'; // Default gray color
}