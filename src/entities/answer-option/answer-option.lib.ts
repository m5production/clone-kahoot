// FR-101: kahoot-style option colors by position — red, blue, yellow, green
const OPTION_COLORS = [
  'bg-red-600',
  'bg-blue-600',
  'bg-amber-400',
  'bg-green-600',
]

export const optionColorClass = (index: number): string =>
  OPTION_COLORS[index % OPTION_COLORS.length]
