export function analyzeVisaEvidence(vacancyText: string) {
  const sentences = vacancyText
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter(sentence => /visa|sponsor|work permit|right to work|work authori[sz]ation|immigration/i.test(sentence));
  const positive = sentences.filter(sentence =>
    /visa sponsorship|sponsor(?:ship|ing)? (?:a |the )?work visa|work permit sponsorship|sponsorship available|will sponsor/i.test(sentence)
  );
  const negative = sentences.filter(sentence =>
    /no sponsorship|unable to sponsor|cannot sponsor|must have (?:the )?right to work|existing work authori[sz]ation required/i.test(sentence)
  );
  const conditional = sentences.filter(sentence =>
    /may sponsor|might sponsor|subject to sponsorship|case.by.case|depending on (?:the )?candidate|eligible candidates/i.test(sentence)
  );
  let status: "explicit_support_mentioned" | "support_not_stated" | "unclear_or_conditional" = "support_not_stated";
  let evidence: string[] = [];
  let explanation = "No explicit statement about employer visa sponsorship was found in the supplied text. This does not prove that sponsorship is unavailable; contact the employer.";
  if (positive.length && !negative.length) {
    status = "explicit_support_mentioned";
    evidence = positive.slice(0, 5);
    explanation = "The supplied vacancy text explicitly mentions visa or work-permit sponsorship. This is an employer-statement signal only; confirm eligibility, country-specific rules, costs, and sponsorship availability directly with the employer.";
  } else if (conditional.length || (positive.length && negative.length) || negative.length) {
    status = "unclear_or_conditional";
    evidence = [...positive, ...negative, ...conditional].slice(0, 5);
    explanation = "The vacancy contains conditional or potentially conflicting work-authorization wording. Ask the employer for written clarification before relying on it.";
  }
  return {
    status,
    evidence,
    explanation,
    disclaimer: "This is text analysis, not legal advice or a determination of immigration eligibility. The employer and relevant immigration authority must confirm the current requirements."
  };
}
