// Game data for all 36 lessons - quiz, match, sort, and fill questions
// Each lesson title maps to an array of GameQuestion objects

export interface GameQuestion {
  type: "quiz" | "match" | "sort" | "fill";
  prompt: string;
  // quiz
  options?: string[];
  correct?: number;
  // match
  pairs?: { left: string; right: string }[];
  // sort
  items?: string[];
  categories?: { name: string; items: string[] }[];
  // fill
  template?: string;
  blanks?: string[];
  acceptAny?: string[];
}

export const gameData: Record<string, GameQuestion[]> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // MATHEMATICS - Unit 1: Fractions
  // ═══════════════════════════════════════════════════════════════════════════

  "Mathematics — Lesson 1.1": [
    {
      type: "quiz",
      prompt: "In the fraction 3/4, what does the numerator represent?",
      options: ["How many parts we have", "Total equal parts", "The whole", "The decimal value"],
      correct: 0,
    },
    {
      type: "quiz",
      prompt: "What is the denominator in the fraction 5/8?",
      options: ["5", "8", "13", "40"],
      correct: 1,
    },
    {
      type: "match",
      prompt: "Match each fraction term to its definition",
      pairs: [
        { left: "Numerator", right: "Top number — parts we have" },
        { left: "Denominator", right: "Bottom number — total parts" },
        { left: "Unit fraction", right: "Fraction with 1 as numerator" },
        { left: "Proper fraction", right: "Less than 1 (e.g. 3/4)" },
      ],
    },
    {
      type: "fill",
      prompt: "Complete the definition",
      template: "A _____ tells us how many parts we have of something divided into equal parts.",
      blanks: ["fraction"],
      acceptAny: ["fraction", "a fraction"],
    },
  ],

  "Mathematics — Lesson 1.2": [
    {
      type: "quiz",
      prompt: "Are 4/8 and 1/2 equivalent fractions?",
      options: ["Yes, because 4 ÷ 4 = 1 and 8 ÷ 4 = 2", "No, they have different numerators", "Yes, because they have the same denominator", "No, 4/8 is larger"],
      correct: 0,
    },
    {
      type: "match",
      prompt: "Match each fraction to its equivalent",
      pairs: [
        { left: "1/2", right: "2/4" },
        { left: "3/5", right: "6/10" },
        { left: "2/3", right: "4/6" },
        { left: "5/4", right: "10/8" },
      ],
    },
    {
      type: "sort",
      prompt: "Sort these fractions into simplified or not simplified",
      items: ["1/2", "2/4", "3/5", "6/10", "2/3", "4/6"],
      categories: [
        { name: "Simplified (lowest terms)", items: ["1/2", "3/5", "2/3"] },
        { name: "Not simplified", items: ["2/4", "6/10", "4/6"] },
      ],
    },
    {
      type: "fill",
      prompt: "Complete the rule for finding equivalent fractions",
      template: "Whatever you do to the _____, you must do to the _____.",
      blanks: ["top", "bottom"],
      acceptAny: ["top", "numerator"],
    },
  ],

  "Mathematics — Lesson 1.3": [
    {
      type: "quiz",
      prompt: "What is the GCF of 12 and 18?",
      options: ["6", "3", "12", "36"],
      correct: 0,
    },
    {
      type: "quiz",
      prompt: "What is 12/18 simplified?",
      options: ["2/3", "3/2", "4/6", "6/9"],
      correct: 0,
    },
    {
      type: "match",
      prompt: "Match each fraction to its simplified form",
      pairs: [
        { left: "8/12", right: "2/3" },
        { left: "10/15", right: "2/3" },
        { left: "9/12", right: "3/4" },
        { left: "16/20", right: "4/5" },
      ],
    },
  ],

  "Mathematics — Lesson 1.4": [
    {
      type: "quiz",
      prompt: "Which fraction is larger: 2/3 or 3/5?",
      options: ["2/3", "3/5", "They are equal", "Cannot determine"],
      correct: 0,
    },
    {
      type: "sort",
      prompt: "Sort these fractions from smallest to largest",
      items: ["1/4", "1/3", "1/2", "3/4"],
      categories: [
        { name: "Smallest", items: ["1/4"] },
        { name: "Middle", items: ["1/3", "1/2"] },
        { name: "Largest", items: ["3/4"] },
      ],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // MATHEMATICS - Unit 2: Multiplication & Division
  // ═══════════════════════════════════════════════════════════════════════════

  "Mathematics — Lesson 2.1": [
    {
      type: "quiz",
      prompt: "What is 7 × 8?",
      options: ["54", "56", "48", "63"],
      correct: 1,
    },
    {
      type: "quiz",
      prompt: "Which property states: 3 × 5 = 5 × 3?",
      options: ["Commutative Property", "Associative Property", "Distributive Property", "Identity Property"],
      correct: 0,
    },
    {
      type: "match",
      prompt: "Match each multiplication fact",
      pairs: [
        { left: "6 × 7", right: "42" },
        { left: "8 × 9", right: "72" },
        { left: "5 × 6", right: "30" },
        { left: "7 × 8", right: "56" },
      ],
    },
  ],

  "Mathematics — Lesson 2.2": [
    {
      type: "quiz",
      prompt: "What is 48 ÷ 6?",
      options: ["6", "7", "8", "9"],
      correct: 2,
    },
    {
      type: "fill",
      prompt: "Complete the relationship",
      template: "Division is the _____ of multiplication.",
      blanks: ["inverse", "opposite"],
      acceptAny: ["inverse", "opposite", "reverse"],
    },
  ],

  "Mathematics — Lesson 2.3": [
    {
      type: "quiz",
      prompt: "What is 23 × 15?",
      options: ["345", "335", "355", "325"],
      correct: 0,
    },
    {
      type: "sort",
      prompt: "Sort these strategies by the step you'd do first",
      items: ["Multiply ones place", "Multiply tens place", "Add partial products"],
      categories: [
        { name: "First", items: ["Multiply ones place"] },
        { name: "Second", items: ["Multiply tens place"] },
        { name: "Third", items: ["Add partial products"] },
      ],
    },
  ],

  "Mathematics — Lesson 2.4": [
    {
      type: "quiz",
      prompt: "What is 144 ÷ 12?",
      options: ["11", "12", "13", "14"],
      correct: 1,
    },
    {
      type: "match",
      prompt: "Match each division problem to its answer",
      pairs: [
        { left: "96 ÷ 8", right: "12" },
        { left: "108 ÷ 9", right: "12" },
        { left: "156 ÷ 12", right: "13" },
        { left: "180 ÷ 15", right: "12" },
      ],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // MATHEMATICS - Unit 3: Patterns & Algebra
  // ═══════════════════════════════════════════════════════════════════════════

  "Mathematics — Lesson 3.1": [
    {
      type: "quiz",
      prompt: "What comes next: 2, 4, 6, 8, ___?",
      options: ["9", "10", "11", "12"],
      correct: 1,
    },
    {
      type: "sort",
      prompt: "Sort these patterns into their rule type",
      items: ["+3 each time", "×2 each time", "-1 each time", "÷2 each time"],
      categories: [
        { name: "Increasing patterns", items: ["+3 each time", "×2 each time"] },
        { name: "Decreasing patterns", items: ["-1 each time", "÷2 each time"] },
      ],
    },
  ],

  "Mathematics — Lesson 3.2": [
    {
      type: "quiz",
      prompt: "If n = 5, what is 2n + 3?",
      options: ["10", "13", "15", "8"],
      correct: 1,
    },
    {
      type: "fill",
      prompt: "Complete the expression",
      template: "In the expression 3x + 2, x is called the _____.",
      blanks: ["variable"],
      acceptAny: ["variable", "unknown"],
    },
  ],

  "Mathematics — Lesson 3.3": [
    {
      type: "quiz",
      prompt: "What is the value of x in: x + 7 = 12?",
      options: ["4", "5", "6", "7"],
      correct: 1,
    },
    {
      type: "match",
      prompt: "Match each equation to its solution",
      pairs: [
        { left: "x + 3 = 8", right: "x = 5" },
        { left: "x - 4 = 6", right: "x = 10" },
        { left: "2x = 14", right: "x = 7" },
        { left: "x ÷ 3 = 4", right: "x = 12" },
      ],
    },
  ],

  "Mathematics — Lesson 3.4": [
    {
      type: "quiz",
      prompt: "Which is a correct inequality?",
      options: ["5 > 3", "2 > 7", "4 > 4", "1 > 9"],
      correct: 0,
    },
    {
      type: "sort",
      prompt: "Sort these symbols into their meaning",
      items: [">", "<", "=", "≥", "≤"],
      categories: [
        { name: "Greater than", items: [">", "≥"] },
        { name: "Less than", items: ["<", "≤"] },
        { name: "Equal to", items: ["="] },
      ],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGLISH LANGUAGE ARTS - Unit 1: Parts of Speech
  // ═══════════════════════════════════════════════════════════════════════════

  "English Language Arts — Lesson 1.1": [
    {
      type: "quiz",
      prompt: "Which word is a noun in this sentence: 'Maria read a book in the garden.'?",
      options: ["read", "Maria", "in", "the"],
      correct: 1,
    },
    {
      type: "match",
      prompt: "Match each noun category to its example",
      pairs: [
        { left: "Person", right: "teacher, Maria" },
        { left: "Place", right: "school, library" },
        { left: "Thing", right: "book, pencil" },
        { left: "Idea", right: "freedom, love" },
      ],
    },
    {
      type: "sort",
      prompt: "Sort these words into nouns and verbs",
      items: ["run", "freedom", "think", "teacher", "write", "happiness"],
      categories: [
        { name: "Nouns", items: ["freedom", "teacher", "happiness"] },
        { name: "Verbs", items: ["run", "think", "write"] },
      ],
    },
  ],

  "English Language Arts — Lesson 1.2": [
    {
      type: "quiz",
      prompt: "What type of sentence is: 'Don't forget your jacket!'?",
      options: ["Declarative", "Interrogative", "Imperative", "Exclamatory"],
      correct: 2,
    },
    {
      type: "match",
      prompt: "Match each sentence type to its purpose",
      pairs: [
        { left: "Declarative", right: "Makes a statement" },
        { left: "Interrogative", right: "Asks a question" },
        { left: "Imperative", right: "Gives a command" },
        { left: "Exclamatory", right: "Shows strong emotion" },
      ],
    },
    {
      type: "fill",
      prompt: "Complete the sentence structure rule",
      template: "Every complete sentence needs a _____ and a _____.",
      blanks: ["subject", "predicate"],
      acceptAny: ["subject", "noun"],
    },
  ],

  "English Language Arts — Lesson 1.3": [
    {
      type: "quiz",
      prompt: "Which is an adjective in: 'The tall tree swayed.'?",
      options: ["The", "tall", "tree", "swayed"],
      correct: 1,
    },
    {
      type: "sort",
      prompt: "Sort these words into their part of speech",
      items: ["quickly", "beautiful", "jump", "happy", "run", "slowly"],
      categories: [
        { name: "Adjectives", items: ["beautiful", "happy"] },
        { name: "Adverbs", items: ["quickly", "slowly"] },
        { name: "Verbs", items: ["jump", "run"] },
      ],
    },
  ],

  "English Language Arts — Lesson 1.4": [
    {
      type: "quiz",
      prompt: "What type of pronoun is 'everyone'?",
      options: ["Personal pronoun", "Possessive pronoun", "Indefinite pronoun", "Reflexive pronoun"],
      correct: 2,
    },
    {
      type: "match",
      prompt: "Match each pronoun type to its example",
      pairs: [
        { left: "Personal", right: "he, she, they" },
        { left: "Possessive", right: "his, her, their" },
        { left: "Indefinite", right: "everyone, someone" },
        { left: "Reflexive", right: "myself, themselves" },
      ],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGLISH LANGUAGE ARTS - Unit 2: Reading Skills
  // ═══════════════════════════════════════════════════════════════════════════

  "English Language Arts — Lesson 2.1": [
    {
      type: "quiz",
      prompt: "What is the main idea of a passage?",
      options: ["The smallest detail", "The most important point", "A supporting fact", "The author's name"],
      correct: 1,
    },
    {
      type: "sort",
      prompt: "Sort these into main idea vs supporting details",
      items: ["The sky is blue", "Weather affects daily life", "Clouds block sunlight", "Temperature determines clothing"],
      categories: [
        { name: "Main Idea", items: ["Weather affects daily life"] },
        { name: "Supporting Details", items: ["The sky is blue", "Clouds block sunlight", "Temperature determines clothing"] },
      ],
    },
  ],

  "English Language Arts — Lesson 2.2": [
    {
      type: "quiz",
      prompt: "What is inference in reading?",
      options: ["Reading the title", "Drawing conclusions from clues", "Looking at pictures", "Reading aloud"],
      correct: 1,
    },
    {
      type: "match",
      prompt: "Match each clue to what you can infer",
      pairs: [
        { left: "Person is wearing a coat", right: "It's cold outside" },
        { left: "Pages are turning quickly", right: "Reader is excited" },
        { left: "Food smells delicious", right: "Someone is cooking" },
        { left: "Lights are off", right: "It's nighttime or someone is sleeping" },
      ],
    },
  ],

  "English Language Arts — Lesson 2.3": [
    {
      type: "quiz",
      prompt: "What is the plot of a story?",
      options: ["The setting", "The sequence of events", "The characters", "The theme"],
      correct: 1,
    },
    {
      type: "sort",
      prompt: "Sort these story elements in order",
      items: ["Climax", "Exposition", "Resolution", "Rising Action", "Falling Action"],
      categories: [
        { name: "Beginning", items: ["Exposition"] },
        { name: "Middle", items: ["Rising Action", "Climax", "Falling Action"] },
        { name: "End", items: ["Resolution"] },
      ],
    },
  ],

  "English Language Arts — Lesson 2.4": [
    {
      type: "quiz",
      prompt: "What is the difference between a protagonist and antagonist?",
      options: [
        "Protagonist is good, antagonist is evil",
        "Protagonist is the main character, antagonist opposes them",
        "Protagonist appears first, antagonist appears last",
        "Protagonist is human, antagonist is not"
      ],
      correct: 1,
    },
    {
      type: "match",
      prompt: "Match each character role to its description",
      pairs: [
        { left: "Protagonist", right: "Main character" },
        { left: "Antagonist", right: "Opposes the protagonist" },
        { left: "Supporting character", right: "Helps the protagonist" },
        { left: "Narrator", right: "Tells the story" },
      ],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGLISH LANGUAGE ARTS - Unit 3: Writing
  // ═══════════════════════════════════════════════════════════════════════════

  "English Language Arts — Lesson 3.1": [
    {
      type: "quiz",
      prompt: "What is a topic sentence?",
      options: [
        "The last sentence of a paragraph",
        "The sentence that states the main idea",
        "A question at the beginning",
        "A quote from someone famous"
      ],
      correct: 1,
    },
    {
      type: "sort",
      prompt: "Sort these paragraph parts in order",
      items: ["Topic sentence", "Concluding sentence", "Supporting details"],
      categories: [
        { name: "First", items: ["Topic sentence"] },
        { name: "Middle", items: ["Supporting details"] },
        { name: "Last", items: ["Concluding sentence"] },
      ],
    },
  ],

  "English Language Arts — Lesson 3.2": [
    {
      type: "quiz",
      prompt: "What is the purpose of an introduction paragraph?",
      options: [
        "To summarize the conclusion",
        "To hook the reader and introduce the topic",
        "To provide detailed evidence",
        "To list all the sources"
      ],
      correct: 1,
    },
    {
      type: "match",
      prompt: "Match each essay part to its function",
      pairs: [
        { left: "Introduction", right: "Hook and thesis statement" },
        { left: "Body paragraphs", right: "Evidence and analysis" },
        { left: "Conclusion", right: "Summary and final thought" },
      ],
    },
  ],

  "English Language Arts — Lesson 3.3": [
    {
      type: "quiz",
      prompt: "What is a thesis statement?",
      options: [
        "A question about the topic",
        "The main argument or claim of the essay",
        "A quote from a source",
        "The title of the essay"
      ],
      correct: 1,
    },
    {
      type: "fill",
      prompt: "Complete the thesis statement formula",
      template: "A strong thesis statement makes a _____ claim that can be supported with evidence.",
      blanks: ["specific", "clear"],
      acceptAny: ["specific", "clear", "defensible", "arguable"],
    },
  ],

  "English Language Arts — Lesson 3.4": [
    {
      type: "quiz",
      prompt: "What is the final step in the writing process?",
      options: ["Drafting", "Planning", "Revising and editing", "Brainstorming"],
      correct: 2,
    },
    {
      type: "sort",
      prompt: "Sort these writing process steps in order",
      items: ["Drafting", "Brainstorming", "Revising", "Publishing", "Planning"],
      categories: [
        { name: "First", items: ["Brainstorming", "Planning"] },
        { name: "Middle", items: ["Drafting", "Revising"] },
        { name: "Last", items: ["Publishing"] },
      ],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // SCIENCE - Unit 1: Matter & Materials
  // ═══════════════════════════════════════════════════════════════════════════

  "Science — Lesson 1.1": [
    {
      type: "quiz",
      prompt: "Which state of matter has a fixed shape and volume?",
      options: ["Solid", "Liquid", "Gas", "Plasma"],
      correct: 0,
    },
    {
      type: "match",
      prompt: "Match each state of matter to its properties",
      pairs: [
        { left: "Solid", right: "Fixed shape, fixed volume" },
        { left: "Liquid", right: "Takes shape of container, fixed volume" },
        { left: "Gas", right: "No fixed shape, fills any space" },
      ],
    },
    {
      type: "sort",
      prompt: "Sort these items into their state of matter at room temperature",
      items: ["Water", "Rock", "Air", "Milk", "Ice", "Steam"],
      categories: [
        { name: "Solid", items: ["Rock", "Ice"] },
        { name: "Liquid", items: ["Water", "Milk"] },
        { name: "Gas", items: ["Air", "Steam"] },
      ],
    },
  ],

  "Science — Lesson 1.2": [
    {
      type: "quiz",
      prompt: "What is the process of a liquid becoming a gas?",
      options: ["Melting", "Freezing", "Evaporation", "Condensation"],
      correct: 2,
    },
    {
      type: "match",
      prompt: "Match each change of state to its process name",
      pairs: [
        { left: "Solid → Liquid", right: "Melting" },
        { left: "Liquid → Gas", right: "Evaporation" },
        { left: "Gas → Liquid", right: "Condensation" },
        { left: "Liquid → Solid", right: "Freezing" },
      ],
    },
  ],

  "Science — Lesson 1.3": [
    {
      type: "quiz",
      prompt: "What property distinguishes metals from non-metals?",
      options: ["Color", "Weight", "Conductivity of electricity", "Smell"],
      correct: 2,
    },
    {
      type: "sort",
      prompt: "Sort these materials into metals and non-metals",
      items: ["Iron", "Plastic", "Copper", "Wood", "Aluminum", "Glass"],
      categories: [
        { name: "Metals", items: ["Iron", "Copper", "Aluminum"] },
        { name: "Non-metals", items: ["Plastic", "Wood", "Glass"] },
      ],
    },
  ],

  "Science — Lesson 1.4": [
    {
      type: "quiz",
      prompt: "What is a mixture?",
      options: [
        "A substance made of one type of atom",
        "A combination of substances that can be separated",
        "A new substance formed by a chemical reaction",
        "A substance that cannot be broken down"
      ],
      correct: 1,
    },
    {
      type: "match",
      prompt: "Match each type of mixture to its example",
      pairs: [
        { left: "Solution", right: "Salt water" },
        { left: "Suspension", right: "Muddy water" },
        { left: "Colloid", right: "Milk" },
      ],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // SCIENCE - Unit 2: Forces & Energy
  // ═══════════════════════════════════════════════════════════════════════════

  "Science — Lesson 2.1": [
    {
      type: "quiz",
      prompt: "What is a force?",
      options: [
        "A type of energy",
        "A push or pull on an object",
        "The speed of an object",
        "The weight of an object"
      ],
      correct: 1,
    },
    {
      type: "match",
      prompt: "Match each force to its example",
      pairs: [
        { left: "Gravity", right: "Apple falling from tree" },
        { left: "Friction", right: "Slowing down on rough surface" },
        { left: "Magnetic force", right: "Compass pointing north" },
        { left: "Muscular force", right: "Lifting a box" },
      ],
    },
  ],

  "Science — Lesson 2.2": [
    {
      type: "quiz",
      prompt: "What is speed?",
      options: [
        "How heavy something is",
        "How far something travels in a given time",
        "How strong a force is",
        "How much energy something has"
      ],
      correct: 1,
    },
    {
      type: "fill",
      prompt: "Complete the speed formula",
      template: "Speed = _____ ÷ Time",
      blanks: ["distance"],
      acceptAny: ["distance", "Distance"],
    },
  ],

  "Science — Lesson 2.3": [
    {
      type: "quiz",
      prompt: "What type of energy does a moving ball have?",
      options: ["Potential energy", "Kinetic energy", "Thermal energy", "Chemical energy"],
      correct: 1,
    },
    {
      type: "sort",
      prompt: "Sort these into potential or kinetic energy",
      items: ["Ball at rest on a hill", "Rolling ball", "Stretched rubber band", "Flying airplane", "Compressed spring", "Running water"],
      categories: [
        { name: "Potential Energy", items: ["Ball at rest on a hill", "Stretched rubber band", "Compressed spring"] },
        { name: "Kinetic Energy", items: ["Rolling ball", "Flying airplane", "Running water"] },
      ],
    },
  ],

  "Science — Lesson 2.4": [
    {
      type: "quiz",
      prompt: "What is the law of conservation of energy?",
      options: [
        "Energy can be created from nothing",
        "Energy cannot be created or destroyed, only transformed",
        "Energy always increases",
        "Energy only exists as heat"
      ],
      correct: 1,
    },
    {
      type: "match",
      prompt: "Match each energy transformation",
      pairs: [
        { left: "Battery powering a light", right: "Chemical → Electrical → Light" },
        { left: "Eating food", right: "Chemical → Mechanical + Heat" },
        { left: "Solar panel", right: "Light → Electrical" },
      ],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // SCIENCE - Unit 3: Earth Science
  // ═══════════════════════════════════════════════════════════════════════════

  "Science — Lesson 3.1": [
    {
      type: "quiz",
      prompt: "What is the water cycle?",
      options: [
        "Water flowing in rivers",
        "The continuous movement of water through Earth's systems",
        "Water freezing and melting",
        "Water being purified"
      ],
      correct: 1,
    },
    {
      type: "sort",
      prompt: "Sort these processes into the water cycle",
      items: ["Evaporation", "Condensation", "Precipitation", "Collection", "Transpiration"],
      categories: [
        { name: "Water goes up", items: ["Evaporation", "Transpiration"] },
        { name: "Forms clouds", items: ["Condensation"] },
        { name: "Falls to Earth", items: ["Precipitation", "Collection"] },
      ],
    },
  ],

  "Science — Lesson 3.2": [
    {
      type: "quiz",
      prompt: "What causes weather on Earth?",
      options: [
        "The moon's gravity",
        "Differences in temperature and air pressure",
        "Ocean currents only",
        "The Earth's rotation only"
      ],
      correct: 1,
    },
    {
      type: "match",
      prompt: "Match each weather instrument to what it measures",
      pairs: [
        { left: "Thermometer", right: "Temperature" },
        { left: "Barometer", right: "Air pressure" },
        { left: "Anemometer", right: "Wind speed" },
        { left: "Rain gauge", right: "Precipitation" },
      ],
    },
  ],

  "Science — Lesson 3.3": [
    {
      type: "quiz",
      prompt: "What are the three main layers of the Earth?",
      options: [
        "Crust, mantle, core",
        "Surface, middle, center",
        "Rock, liquid, gas",
        "Top, bottom, middle"
      ],
      correct: 0,
    },
    {
      type: "match",
      prompt: "Match each Earth layer to its characteristics",
      pairs: [
        { left: "Crust", right: "Thin, solid outer layer" },
        { left: "Mantle", right: "Thick, hot rock layer" },
        { left: "Outer core", right: "Liquid iron and nickel" },
        { left: "Inner core", right: "Solid iron and nickel" },
      ],
    },
  ],

  "Science — Lesson 3.4": [
    {
      type: "quiz",
      prompt: "What is the rock cycle?",
      options: [
        "Rocks growing in circles",
        "The process by which rocks change from one type to another",
        "Rocks melting into lava",
        "Rocks breaking into smaller pieces"
      ],
      correct: 1,
    },
    {
      type: "sort",
      prompt: "Sort these into the three main rock types",
      items: ["Granite", "Sandstone", "Marble", "Limestone", "Basalt", "Slate"],
      categories: [
        { name: "Igneous", items: ["Granite", "Basalt"] },
        { name: "Sedimentary", items: ["Sandstone", "Limestone"] },
        { name: "Metamorphic", items: ["Marble", "Slate"] },
      ],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // SCIENCE - Unit 4: Life Science
  // ═══════════════════════════════════════════════════════════════════════════

  "Science — Lesson 4.1": [
    {
      type: "quiz",
      prompt: "What is photosynthesis?",
      options: [
        "How animals eat food",
        "How plants convert light energy into food",
        "How water moves through plants",
        "How plants reproduce"
      ],
      correct: 1,
    },
    {
      type: "match",
      prompt: "Match each part of photosynthesis to its role",
      pairs: [
        { left: "Sunlight", right: "Energy source" },
        { left: "Carbon dioxide", right: "Taken from air" },
        { left: "Water", right: "Taken from soil" },
        { left: "Glucose", right: "Food produced" },
      ],
    },
  ],

  "Science — Lesson 4.2": [
    {
      type: "quiz",
      prompt: "What is adaptation?",
      options: [
        "When an animal changes color",
        "A trait that helps an organism survive in its environment",
        "When animals migrate",
        "A type of behavior"
      ],
      correct: 1,
    },
    {
      type: "sort",
      prompt: "Sort these adaptations into structural or behavioral",
      items: ["Thick fur", "Hibernation", "Sharp claws", "Migration", "Camouflage color", "Building a nest"],
      categories: [
        { name: "Structural", items: ["Thick fur", "Sharp claws", "Camouflage color"] },
        { name: "Behavioral", items: ["Hibernation", "Migration", "Building a nest"] },
      ],
    },
  ],

  "Science — Lesson 4.3": [
    {
      type: "quiz",
      prompt: "What is a food chain?",
      options: [
        "A group of animals living together",
        "A linear sequence showing who eats whom",
        "A type of habitat",
        "A cycle of seasons"
      ],
      correct: 1,
    },
    {
      type: "match",
      prompt: "Match each role in the food chain",
      pairs: [
        { left: "Producer", right: "Makes its own food (plants)" },
        { left: "Consumer", right: "Eats other organisms" },
        { left: "Decomposer", right: "Breaks down dead organisms" },
        { left: "Predator", right: "Hunts and eats prey" },
      ],
    },
  ],

  "Science — Lesson 4.4": [
    {
      type: "quiz",
      prompt: "What is an ecosystem?",
      options: [
        "A single organism and its traits",
        "All living and non-living things in an area interacting together",
        "A group of the same species",
        "A type of habitat"
      ],
      correct: 1,
    },
    {
      type: "sort",
      prompt: "Sort these into biotic or abiotic factors",
      items: ["Sunlight", "Trees", "Water", "Animals", "Rocks", "Bacteria"],
      categories: [
        { name: "Biotic (living)", items: ["Trees", "Animals", "Bacteria"] },
        { name: "Abiotic (non-living)", items: ["Sunlight", "Water", "Rocks"] },
      ],
    },
  ],
};
