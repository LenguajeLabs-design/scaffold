import type { LessonPlan } from "@workspace/api-client-react";

export const DEMO_LESSON_PLANS: LessonPlan[] = [
  {
    title: "Fractions as Fair Shares — Grade 3 WIDA 1–2",
    contentObjective:
      "Students will identify halves, thirds, and fourths by partitioning shapes into equal parts.",
    languageObjective:
      "Students will use sentence frames to name and compare fractions using the words 'half,' 'third,' and 'fourth.'",
    keyVocabulary: ["fraction", "half", "third", "fourth", "equal parts", "numerator", "denominator"],
    sentenceFrames: [
      "This shape is divided into ___ equal parts.",
      "Each part is called a ___.",
      "This fraction is bigger / smaller because ___.",
    ],
    warmUp:
      "Show students three images: a circle cut in 2 equal slices, a rectangle cut in 3, and a square cut in 4.\n\n1. Hold up each image and ask: 'How many equal parts do you see?'\n2. Students hold up fingers to show the number of parts.\n3. Introduce the word for each: half, third, fourth.\n\nDebrief: Point to the vocabulary wall and say each word together as a class.",
    mainActivity:
      "Students work with fraction strips and shape mats to model halves, thirds, and fourths.\n\n1. Fold a paper strip in half. Label each part '1/2'.\n2. Fold a second strip into thirds. Label each part '1/3'.\n3. Fold a third strip into fourths. Label each part '1/4'.\n4. With a partner, compare strips using the frame: 'My strip shows ___ equal parts. Each part is called a ___.'",
    speakingActivity:
      "Gallery Walk: post 6 laminated shapes around the room — some correctly partitioned into equal parts, some not.\n\nSetup:\n• Pairs visit 3 shapes each with a recording sheet.\n• For each shape, decide: equal parts or not?\n\nSentence frame to use: 'This shape shows / does not show equal parts because ___.\n\nDebrief: Cold-call 2–3 pairs. Ask the class to give a thumbs up/down for each answer.",
    exitTicket:
      "Show a rectangle divided into 3 unequal parts on the board.\n\n• Students draw the shape on a mini whiteboard.\n• Write: 'This is / is not a fraction because ___.' using at least one vocabulary word.\n\nTeacher tip: Collect and sort into three piles — got it / almost / needs support — to plan the next day's grouping.",
    teacherNotes:
      "• WIDA 1 students: allow pointing, drawing, or gestures alongside speech.\n• Provide labeled fraction manipulatives and bilingual vocabulary cards where available.\n• For early finishers: ask 'Which is larger — 1/2 or 1/4? How do you know?'\n• During the gallery walk, give WIDA 1 students a visual anchor card with the sentence frames printed on it.",
  },
  {
    title: "Animal Adaptations — Grade 4 WIDA 2–3",
    contentObjective:
      "Students will explain how specific physical adaptations help animals survive in their habitat.",
    languageObjective:
      "Students will write and orally present one cause-and-effect sentence explaining an adaptation using 'because,' 'so that,' or 'as a result.'",
    keyVocabulary: ["adaptation", "habitat", "survive", "camouflage", "predator", "prey", "trait"],
    sentenceFrames: [
      "The ___ has ___ so that it can ___.",
      "This adaptation helps the ___ survive because ___.",
      "Without this adaptation, the animal would ___.",
    ],
    warmUp:
      "Play 'Spot the Animal' — show 3 photographs where an animal is camouflaged in its environment.\n\n1. Give students 30 seconds to find the animal in each photo.\n2. Ask: 'How does looking like its habitat help this animal?'\n3. Turn-and-Talk using the frame: 'I think the ___ is hard to see because ___.\n\nDebrief: Introduce the word 'camouflage' and add it to the vocabulary wall.",
    mainActivity:
      "Each pair receives an Adaptation Card with an animal photo, habitat description, and 3 labelled adaptations.\n\n1. Read the card together.\n2. Complete 2–3 rows of the graphic organizer: Adaptation → Function → Survival Benefit.\n3. Use the sentence frames on the board to write one cause-and-effect sentence.\n\nDifferentiation:\n• WIDA 2: provide a pre-filled example row on the organizer.\n• WIDA 3: ask students to compare two animals' adaptations for the same challenge.",
    speakingActivity:
      "Jigsaw presentation — students become 'experts' on their animal.\n\nSetup:\n• Expert groups (same animal): 5 minutes to rehearse the explanation using sentence frames.\n• Mixed groups: each student presents for 60 seconds.\n\nListener task: Complete a peer feedback strip — 'You used the word ___. One question I have is ___.\n\nDebrief: Whole class — which adaptation did you find most surprising, and why?",
    exitTicket:
      "Students write 2 sentences independently:\n\n• Sentence 1: Name one adaptation.\n• Sentence 2: Explain how it helps the animal survive (use a cause-and-effect connector).\n\nQuick score: 2 pts for correct cause/effect language, 1 pt for content accuracy.",
    teacherNotes:
      "• Pre-teach 'adaptation' vs. 'behavior' — students often confuse structural and behavioral adaptations.\n• Bilingual glossary cards in Spanish, Mandarin, and Korean are in the resource cabinet.\n• For WIDA 2 students: provide the graphic organizer with one example row pre-filled.\n• For WIDA 3 students: challenge them to compare two animals' adaptations for the same survival challenge.",
  },
];
