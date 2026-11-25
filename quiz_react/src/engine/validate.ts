import type { Question } from './types';

/**
 * Checks the quiz data once at startup and fails loudly if it's malformed.
 * Collects every problem before throwing, so all issues can be fixed in one pass.
 * TypeScript only checks the bundled data at compile time; this runtime check
 * also covers data that might come from JSON or an API later.
 * @throws {Error} Listing every invalid question and why.
 */
export function validateQuestions(questions: readonly Question[]): void {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Quiz data must be a non-empty array of questions.');
  }

  const errors: string[] = [];
  const seenIds = new Set<string>();

  questions.forEach((q: Partial<Question> | null | undefined, i) => {
    const label = `Question ${i + 1}${q?.id ? ` (${q.id})` : ''}`;

    if (typeof q?.id !== 'string' || q.id.trim() === '') {
      errors.push(`${label}: "id" must be a non-empty string.`);
    } else if (seenIds.has(q.id)) {
      errors.push(`${label}: duplicate id "${q.id}".`);
    } else {
      seenIds.add(q.id);
    }

    if (typeof q?.prompt !== 'string' || q.prompt.trim() === '') {
      errors.push(`${label}: "prompt" must be a non-empty string.`);
    }

    if (!Array.isArray(q?.options) || q.options.length < 2) {
      errors.push(`${label}: "options" must be an array of at least 2 strings.`);
      return; // the checks below need valid options
    }

    const { options, answerIndex } = q;

    if (options.some((opt) => typeof opt !== 'string' || opt.trim() === '')) {
      errors.push(`${label}: every option must be a non-empty string.`);
    }

    if (new Set(options).size !== options.length) {
      errors.push(`${label}: options must be unique.`);
    }

    if (
      typeof answerIndex !== 'number' ||
      !Number.isInteger(answerIndex) ||
      answerIndex < 0 ||
      answerIndex >= options.length
    ) {
      errors.push(`${label}: "answerIndex" must be an integer from 0 to ${options.length - 1}.`);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Invalid quiz data:\n- ${errors.join('\n- ')}`);
  }
}
