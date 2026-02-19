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
      value: "To deepen meditation and inner growth",
    },
    {
      label: "To explore energy, chakras, or mystical states",
      value: "To explore energy, chakras, or mystical states",
    },
    {
      label: "To explore dreams and consciousness",
      value: "To explore dreams and consciousness",
    },
    {
      label: "To cultivate compassion and benefit others",
      value: "To cultivate compassion and benefit others",
    },
    {
      label: "To connect with wisdom traditions and timeless practices",
      value: "To connect with wisdom traditions and timeless practices",
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
      value: "I’m completely new",
    },
    {
      label: "I’ve tried a little (mindfulness, yoga, journaling, breathwork)",
      value: "I’ve tried a little (mindfulness, yoga, journaling, breathwork)",
    },
    {
      label: "I practice regularly (meditation, energy work, mantras)",
      value: "I practice regularly (meditation, energy work, mantras)",
    },
    {
      label: "I’ve done retreats, dream practice, or advanced energy work",
      value: "I’ve done retreats, dream practice, or advanced energy work",
    },
    {
      label: "I’ve trained in nondual/emptiness practices (Dzogchen, Mahamudra, Zen)",
      value: "I’ve trained in nondual/emptiness practices (Dzogchen, Mahamudra, Zen)",
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
      value: "Stress, anxiety, or poor sleep",
    },
    {
      label: "Emotional ups and downs",
      value: "Emotional ups and downs",
    },
    {
      label: "Feeling lost or lacking purpose",
      value: "Feeling lost or lacking purpose",
    },
    {
      label: "Energy sensitivity or blockages",
      value: "Energy sensitivity or blockages",
    },
    {
      label: "Balancing deep practice with work, family, and daily responsibilities",
      value: "Balancing deep practice with work, family, and daily responsibilities",
    },
    {
      label: "Maintaining consistency in my practice",
      value: "Maintaining consistency in my practice",
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
      value: "I don’t notice much",
    },
    {
      label: "I sometimes feel relaxation or tingling",
      value: "I sometimes feel relaxation or tingling",
    },
    {
      label: "I often feel strong emotions or energies",
      value: "I often feel strong emotions or energies",
    },
    {
      label: "I experience vivid dreams, energy surges, or mystical states",
      value: "I experience vivid dreams, energy surges, or mystical states",
    },
    {
      label: "I rest naturally in awareness, beyond effort",
      value: "I rest naturally in awareness, beyond effort",
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
      value: "Breath & body",
    },
    {
      label: "Visualization / chakras",
      value: "Visualization / chakras",
    },
    {
      label: "Heart / compassion",
      value: "Heart / compassion",
    },
    {
      label: "Silence & awareness",
      value: "Silence & awareness",
    },
    {
      label: "Daily life / mindful living",
      value: "Daily life / mindful living",
    },
    {
      label: "I’d like to explore a mix",
      value: "I’d like to explore a mix",
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