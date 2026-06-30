/**
 * Short encouraging lines shown above the Start button on the quiz intro.
 * Kept deliberately calm and non-cheesy. Picked once per mount (see QuizIntro).
 */
export const INTRO_QUOTES = [
  'Every attempt sharpens the mind.',
  'The expert in anything was once a beginner.',
  'Small steps, taken often, go far.',
  'You learn most when you’re tested.',
  'Confidence comes from preparation.',
  'Focus on progress, not perfection.',
  'Getting it wrong is how you remember it.',
  'A few minutes now, a lasting recall later.',
] as const

export const pickIntroQuote = () => INTRO_QUOTES[Math.floor(Math.random() * INTRO_QUOTES.length)]
