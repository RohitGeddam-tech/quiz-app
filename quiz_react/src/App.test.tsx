// The progress text also appears in the live region, so progress is found by its progressbar role.
// End-to-end flow tests through the real components. Elements are found by role and
// accessible name only, the same way a keyboard or screen-reader user finds them.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import App from './App';
import { questions } from './data/questions';

const setup = () => {
  const user = userEvent.setup();
  render(<App />);
  return { user };
};

/** Answers every question by clicking; pick(index) chooses the option index for question `index`. */
async function answerAll(
  user: ReturnType<typeof userEvent.setup>,
  pick: (questionIndex: number) => number,
) {
  for (const [i, question] of questions.entries()) {
    await user.click(screen.getByRole('radio', { name: question.options[pick(i)] }));
    await user.click(
      screen.getByRole('button', { name: i === questions.length - 1 ? 'Finish' : 'Next' }),
    );
  }
}

const correct = (i: number) => questions[i].answerIndex;

describe('App', () => {
  it('starts on the start screen', () => {
    setup();
    expect(screen.getByRole('heading', { name: 'JavaScript Quiz' })).toBeInTheDocument();
    expect(screen.getByText(/8 questions/)).toBeInTheDocument();
  });

  it('shows one question at a time with progress', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Start quiz' }));

    expect(screen.getByRole('progressbar', { name: 'Question 1 of 8' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: questions[0].prompt })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
  });

  it('blocks Next until an option is chosen', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Start quiz' }));

    const nextButton = screen.getByRole('button', { name: 'Next' });
    expect(nextButton).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: 'let' }));
    expect(nextButton).toBeEnabled();
  });

  it('scores a full correct run', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Start quiz' }));
    await answerAll(user, correct);

    expect(screen.getByRole('heading', { name: 'You scored 8 out of 8' })).toBeInTheDocument();
  });

  it('shows the review with wrong answers marked', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Start quiz' }));
    // Get only the first question wrong.
    await answerAll(user, (i) => (i === 0 ? 0 : correct(i)));

    expect(screen.getByRole('heading', { name: 'You scored 7 out of 8' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(8);
    expect(screen.getByText('(incorrect)')).toBeInTheDocument();
    expect(screen.getByText('Correct answer: let')).toBeInTheDocument();
  });

  it('restart returns to a clean first question', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Start quiz' }));
    await answerAll(user, correct);
    await user.click(screen.getByRole('button', { name: 'Restart quiz' }));

    expect(screen.getByRole('heading', { name: 'JavaScript Quiz' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Start quiz' }));
    expect(screen.getByRole('progressbar', { name: 'Question 1 of 8' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio').some((radio) => (radio as HTMLInputElement).checked)).toBe(
      false,
    );
  });

  it('works with the keyboard and moves focus to each new question', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Start quiz' }));

    for (const [i, question] of questions.entries()) {
      expect(screen.getByText(question.prompt)).toHaveFocus();
      await user.tab(); // into the radio group
      // Arrow keys move and select within the group; land on the correct option.
      for (let step = 0; step < question.answerIndex; step++) {
        await user.keyboard('{ArrowDown}');
      }
      if (question.answerIndex === 0) await user.keyboard(' '); // select the focused first radio
      expect(
        screen.getByRole('radio', { name: question.options[question.answerIndex] }),
      ).toBeChecked();
      await user.keyboard('{Enter}');
      if (i < questions.length - 1) {
        expect(
          screen.getByRole('progressbar', { name: `Question ${i + 2} of 8` }),
        ).toBeInTheDocument();
      }
    }

    expect(screen.getByRole('heading', { name: 'You scored 8 out of 8' })).toHaveFocus();
  });
});
