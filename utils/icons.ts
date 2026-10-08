/**
 * Envelope Icons & Color Schemes
 */

export interface EnvelopePreset {
  id: string;
  name: string;
  icon: string;
  color: string;
  defaultAllocationPaise: number; // in paise
}

export const DEFAULT_ENVELOPES: EnvelopePreset[] = [
  {
    id: 'household',
    name: 'Household',
    icon: '🏠',
    color: '#F4A261', // Orange/Brown card
    defaultAllocationPaise: 400000, // ₹4,000
  },
  {
    id: 'food',
    name: 'Food',
    icon: '🍗',
    color: '#E9C46A', // Yellowish card
    defaultAllocationPaise: 300000, // ₹3,000
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: '🚗',
    color: '#2A9D8F', // Teal card
    defaultAllocationPaise: 200000, // ₹2,000
  },
  {
    id: 'bills',
    name: 'Bills',
    icon: '📱',
    color: '#E63946', // Red card
    defaultAllocationPaise: 50000, // ₹500
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: '👤',
    color: '#9C89B8', // Purple card
    defaultAllocationPaise: 100000, // ₹1,000
  },
  {
    id: 'miscellaneous',
    name: 'Miscellaneous',
    icon: '🎯',
    color: '#F4A261', // Peach card
    defaultAllocationPaise: 50000, // ₹500
  },
  {
    id: 'savings',
    name: 'Savings',
    icon: '🐷',
    color: '#2A9D8F', // Green card
    defaultAllocationPaise: 900000, // ₹9,000
  },
];

export const AVAILABLE_ICONS = [
  '🏠', '🍗', '🚗', '📱', '👤', '🎯', '🐷',
  '🛒', '⚡', '💊', '🎬', '✈️', '🎓', '🎁',
  '☕', '👕', '🐾', '⛽', '🏋️', '📚', '💼'
];

export const AVAILABLE_COLORS = [
  '#F4A261', '#E9C46A', '#2A9D8F', '#E63946',
  '#9C89B8', '#457B9D', '#0D6847', '#D4A373',
  '#6B705C', '#A5A58D', '#B7B7A4', '#8E7DBE'
];
