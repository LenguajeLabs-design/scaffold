export function getCanonicalUnitProfile(gradeLevel: string, topic: string, notes: string, unitProfile?: string): string {
  if (!unitProfile) return "";
  return [
    `Selected Scaffold curriculum profile: ${unitProfile}`,
    `Grade: ${gradeLevel}`,
    `Topic: ${topic}`,
    "Use only the selected reviewed curriculum context. Preserve the intellectual goal while adjusting access and language support.",
    "Choose supports based on observable evidence from the classroom and state when the evidence is insufficient.",
    `Teacher notes for this request: ${notes}`,
  ].join("\n");
}
