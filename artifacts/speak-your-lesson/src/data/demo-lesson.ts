import type { LessonPlan } from "@workspace/api-client-react";

export const DEMO_LESSON_PLANS: LessonPlan[] = [
  {
    title: "Fractions as Fair Shares — Grade 3 WIDA 1–2",
    contentObjective:
      "Students will identify halves, thirds, and fourths by partitioning shapes into equal parts.",
    languageObjective:
      "Students will use sentence frames to name and compare fractions using the words 'half,' 'third,' and 'fourth.'",
    keyVocabulary: ["fraction", "half", "third", "fourth", "equal parts", "numerator", "denominator", "partition"],
    sentenceFrames: [
      "This shape is divided into ___ equal parts.",
      "Each part is called a ___.",
      "I know the parts are equal because ___.",
      "This fraction is bigger / smaller because ___.",
    ],
    warmUp:
      "Show students a circle cut into 2, 3, and 4 equal pieces. Ask: 'Which piece is the biggest? Which is the smallest?' Use total physical response — students hold up fingers for the number of equal parts they see. Preview key vocabulary with picture cards: half, third, fourth.",
    mainActivity:
      "Distribute fraction strips and shape mats. Students fold paper strips to model halves, thirds, and fourths, then label each part using the vocabulary wall. Pair students (WIDA 1 with a WIDA 2 partner) to compare strips: 'My strip shows ___ equal parts. Each part is called a ___.' Teacher circulates and uses questioning: 'How do you know the parts are equal?'",
    speakingActivity:
      "Gallery walk: post 6 laminated shapes around the room (some correctly partitioned, some not). Each pair visits 3 shapes with a recording sheet. They decide: equal or not equal? Use the sentence frame: 'This shape shows / does not show equal parts because ___.' Debrief as a class — cold call using equity sticks.",
    exitTicket:
      "Give each student a small whiteboard. Show a rectangle divided into 3 parts (not equal). Ask: 'Is this a fraction? Why or why not?' Students draw and write their answer using at least one vocabulary word. Collect and sort into 3 piles: got it / almost / needs support.",
    teacherNotes:
      "WIDA 1 students can point, draw, or use gestures alongside speech. Provide labeled fraction manipulatives and bilingual vocabulary cards in home languages where available. During the gallery walk, pair WIDA 1 students with a visual anchor card showing the sentence frames. For early finishers, extend to comparing fractions: 'Which is larger — 1/2 or 1/4? How do you know?'",
  },
  {
    title: "Animal Adaptations — Grade 4 WIDA 2–3",
    contentObjective:
      "Students will explain how specific physical adaptations help animals survive in their habitat.",
    languageObjective:
      "Students will write and orally present one cause-and-effect sentence explaining an animal adaptation using 'because,' 'so that,' or 'as a result.'",
    keyVocabulary: ["adaptation", "habitat", "survive", "camouflage", "predator", "prey", "trait", "environment"],
    sentenceFrames: [
      "The ___ has ___ so that it can ___.",
      "This adaptation helps the ___ survive because ___.",
      "Without this adaptation, the animal would ___.",
      "The ___ and the ___ are similar because both ___.",
    ],
    warmUp:
      "Play 'Spot the Animal' — show 3 photographs where an animal is camouflaged in its environment (stick insect on bark, Arctic fox in snow, leafy sea dragon). Give students 30 seconds to find the animal. Ask: 'How does looking like its habitat help this animal?' Turn-and-talk using the frame: 'I think the ___ is hard to see because ___.'",
    mainActivity:
      "Students receive an 'Adaptation Card' with an animal photo, habitat description, and 3 labeled adaptations. Using a graphic organizer (Adaptation → Function → Survival Benefit), they complete 2–3 rows with a partner. Mid-activity: teacher models one card aloud using sentence frames, thinking aloud about the cause-and-effect relationship between structure and function.",
    speakingActivity:
      "Jigsaw: students who have the same animal form an 'expert group' for 5 minutes to rehearse their explanation. Then return to mixed groups to share. Each student presents for 60 seconds using the sentence frames posted on the board. Listeners use a peer feedback strip: 'You used the word ___. One question I have is ___.'",
    exitTicket:
      "Students write 2 sentences independently: one naming an adaptation and one explaining how it helps the animal survive. Collect and use as formative data for next day's grouping. Quick-score: 2 pts for correct cause/effect language, 1 pt for content accuracy.",
    teacherNotes:
      "Pre-teach 'adaptation' vs 'behavior' — students often confuse structural and behavioral adaptations. For WIDA 2 students, provide the graphic organizer pre-filled with one example row. For WIDA 3 students, challenge them to compare two animals' adaptations for the same challenge (e.g., staying warm). Bilingual glossary cards in Spanish, Mandarin, and Korean are available in the resource cabinet.",
  },
];
