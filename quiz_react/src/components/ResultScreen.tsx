import type { ReviewItem } from '../engine';
import { useFocusOnMount } from '../hooks/useFocusOnMount';

type ResultScreenProps = {
  score: number;
  total: number;
  review: ReviewItem[];
  onRestart: () => void;
};

/** Score, an answer review and Restart. Right/wrong is shown with a symbol and words, not colour alone. */
export function ResultScreen({ score, total, review, onRestart }: ResultScreenProps) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();

  return (
    <section className="card" aria-labelledby="result-title">
      <h1 id="result-title" ref={headingRef} tabIndex={-1}>
        You scored {score} out of {total}
      </h1>
      <h2 className="subheading">Review</h2>
      <ol className="review">
        {review.map((item) => (
          <li
            key={item.id}
            className={`review-item ${item.isCorrect ? 'is-correct' : 'is-incorrect'}`}
          >
            <p className="review-prompt">{item.prompt}</p>
            <p>
              <span className="mark" aria-hidden="true">
                {item.isCorrect ? '✓' : '✗'}
              </span>{' '}
              Your answer: {item.options[item.chosenIndex]}{' '}
              <span className="visually-hidden">
                {item.isCorrect ? '(correct)' : '(incorrect)'}
              </span>
            </p>
            {!item.isCorrect && (
              <p className="muted">Correct answer: {item.options[item.correctIndex]}</p>
            )}
          </li>
        ))}
      </ol>
      <button type="button" className="btn" onClick={onRestart}>
        Restart quiz
      </button>
    </section>
  );
}
