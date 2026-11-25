// @ts-check
/** @typedef {import('./types.js').Question} Question */

/**
 * Checks the quiz data once at startup and fails loudly if it's malformed.
 * Collects every problem before throwing, so all issues can be fixed in one pass.
 * @param {ReadonlyArray<Question>} questions
 * @returns {void}
 * @throws {Error} Listing every invalid question and why.
 */
export function validateQuestions(questions) {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Quiz data must be a non-empty array of questions.');
  }

  /** @type {string[]} */
  const errors = [];
  const seenIds = new Set();

  questions.forEach((q, i) => {
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

    if (
      q.options.some((/** @type {string} */ opt) => typeof opt !== 'string' || opt.trim() === '')
    ) {
      errors.push(`${label}: every option must be a non-empty string.`);
    }

    if (new Set(q.options).size !== q.options.length) {
      errors.push(`${label}: options must be unique.`);
    }

    if (
      !Number.isInteger(q.answerIndex) ||
      q.answerIndex < 0 ||
      q.answerIndex >= q.options.length
    ) {
      errors.push(`${label}: "answerIndex" must be an integer from 0 to ${q.options.length - 1}.`);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Invalid quiz data:\n- ${errors.join('\n- ')}`);
  }
}
