export const formatFirestoreTime = (time: string | null): string => {
  if (!time) {
    return '00:00';
  }
  const [hours, minutes] = time.split(':').map((t) => t.padStart(2, '0'));
  return `${hours}:${minutes}`;
};
