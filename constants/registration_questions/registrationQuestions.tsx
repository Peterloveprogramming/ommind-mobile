// Define the type for a single question option
interface QuestionOption {
  label: string;
  value: string;
}

// Define the type for the question structure
interface Question {
  field:string,
  questionTitle: string;
  questionDescription: string;
  questionOptions: QuestionOption[];
}

// Define each question set
const QUESTION1: Question = {
  field:"q1",
  questionTitle: "Spiritual Aspiration",
  questionDescription: "What inspires you to explore OmMind on your spiritual journey?",
  questionOptions: [
    {
      label: "To deepen meditation and inner growth",
      value: "Interested in deepening meditation and inner growth.",
    },
    {
      label: "To explore energy, chakras, or mystical states",
      value: "Interested in subtle and mystical experiences.",
    },
    {
      label: "To explore dreams and consciousness",
      value: "Interested in dreams and consciousness.",
    },
    {
      label: "To cultivate compassion and benefit others",
      value: "Interested in compassion and helping others.",
    },
    {
      label: "To connect with wisdom traditions and timeless practices",
      value: "Interested in traditional spiritual wisdom and practices.",
    },
  ],
};

const QUESTION2: Question = {
  field:"q2",
  questionTitle: "Spiritual / Practice Background",
  questionDescription: "What’s your experience with meditation or spiritual practice so far?",
  questionOptions: [
    {
      label: "I’m completely new",
      value: "New to meditation or spiritual practice.",
    },
    {
      label: "I’ve tried a little (mindfulness, yoga, journaling, breathwork)",
      value: "Has some prior practice experience.",
    },
    {
      label: "I practice regularly (meditation, energy work, mantras)",
      value: "Has a regular spiritual or meditation practice.",
    },
    {
      label: "I’ve done retreats, dream practice, or advanced energy work",
      value: "Has substantial prior practice experience.",
    },
    {
      label: "I’ve trained in nondual/emptiness practices (Dzogchen, Mahamudra, Zen)",
      value: "Has experience with advanced awareness-based practice.",
    },
  ],
};

const QUESTION3: Question = {
  field:"q3",
  questionTitle: "Life Challenge",
  questionDescription: "What feels most challenging in your daily life right now?",
  questionOptions: [
    {
      label: "Stress, anxiety, or poor sleep",
      value: "Currently seeking more calm and rest.",
    },
    {
      label: "Emotional ups and downs",
      value: "Currently seeking greater emotional balance.",
    },
    {
      label: "Feeling lost or lacking purpose",
      value: "Currently seeking greater clarity and direction.",
    },
    {
      label: "Energy sensitivity or blockages",
      value: "Currently experiencing energy-related sensitivity or difficulty.",
    },
    {
      label: "Balancing deep practice with work, family, and daily responsibilities",
      value: "Currently seeking better integration of practice and daily life.",
    },
    {
      label: "Maintaining consistency in my practice",
      value: "Currently seeking greater practice consistency.",
    },
  ],
};

const QUESTION4: Question = {
  field:"q4",
  questionTitle: "Inner Sensitivity Check",
  questionDescription: "How sensitive are you to inner experiences (energy, emotions, dreams)?",
  questionOptions: [
    {
      label: "I don’t notice much",
      value: "Reports little awareness of inner sensations.",
    },
    {
      label: "I sometimes feel relaxation or tingling",
      value: "Reports occasional calm or body awareness.",
    },
    {
      label: "I often feel strong emotions or energies",
      value: "Reports strong bodily or energy-like sensations.",
    },
    {
      label: "I experience vivid dreams, energy surges, or mystical states",
      value: "Reports unusual or mystical inner experiences.",
    },
    {
      label: "I rest naturally in awareness, beyond effort",
      value: "Reports familiarity with effortless awareness.",
    },
  ],
};

const QUESTION5: Question = {
  field:"q5",
  questionTitle: "Preferred Practice Style",
  questionDescription: "What kind of meditation resonates most with you?",
  questionOptions: [
    {
      label: "Breath & body",
      value: "Prefers breath- and body-based practices.",
    },
    {
      label: "Visualization / chakras",
      value: "Prefers visualization or subtle-body practices.",
    },
    {
      label: "Heart / compassion",
      value: "Prefers compassion- and heart-based practices.",
    },
    {
      label: "Silence & awareness",
      value: "Prefers silent or awareness-based practices.",
    },
    {
      label: "Daily life / mindful living",
      value: "Prefers practices integrated into daily life.",
    },
    {
      label: "I’d like to explore a mix",
      value: "Open to a mix of practice styles.",
    },
  ],
};

export const ALL_QUESTIONS: Question[] = [
    QUESTION1,
    QUESTION2,
    QUESTION3,
    QUESTION4,
    QUESTION5
]
