import { useId, type FormEvent } from 'react';
import type { Question } from '../engine';
import { useFocusOnMount } from '../hooks/useFocusOnMount';

type QuestionCardProps = {
  question: Question;
  selected: number | null;
  isLast: boolean;
  onSelect: (option: number) => void;
  onNext: () => void;
};

/**
 * One question as a native radio group inside a fieldset; the legend is the question,
 * which is what screen readers announce. A real <form>, so Enter submits natively.
 * App renders this with key={question.id}, so it remounts per question and the
 * legend gets focus each time without any extra effect logic.
 */
export function QuestionCard({ question, selected, isLast, onSelect, onNext }: QuestionCardProps) {
  const groupName = useId();
  const legendRef = useFocusOnMount<HTMLLegendElement>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // stay on the page; the reducer decides what happens next
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <legend className="question" ref={legendRef} tabIndex={-1}>
          {question.prompt}
        </legend>
        <div className="options">
          {question.options.map((text, i) => {
            const id = `${groupName}-${i}`;
            return (
              <label key={text} className="option" htmlFor={id}>
                <input
                  type="radio"
                  id={id}
                  name={groupName}
                  value={i}
                  checked={selected === i}
                  onChange={() => onSelect(i)}
                />
                <span>{text}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="actions">
        <button type="submit" className="btn" disabled={selected === null}>
          {isLast ? 'Finish' : 'Next'}
        </button>
      </div>
    </form>
  );
}
