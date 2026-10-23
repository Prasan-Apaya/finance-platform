const COLOR_PALETTE = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-orange-500',
];

export function getCategoryColor(id) {
  if (!id) return COLOR_PALETTE[0];
  const numericId = typeof id === 'number' 
    ? id 
    : [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLOR_PALETTE[numericId % COLOR_PALETTE.length];
}