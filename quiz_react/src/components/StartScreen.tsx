import { useFocusOnMount } from '../hooks/useFocusOnMount';

type StartScreenProps = {
  title: string;
  total: number;
  /** False on first page load (don't steal focus), true when coming back after a restart. */
  focusOnMount: boolean;
  onStart: () => void;
};

export function StartScreen({ title, total, focusOnMount, onStart }: StartScreenProps) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>(focusOnMount);

  return (
    <section className="card" aria-labelledby="start-title">
      <h1 id="start-title" ref={headingRef} tabIndex={-1}>
        {title}
      </h1>
      <p className="muted">
        {total} questions, one correct answer each. Pick an answer and press Next.
      </p>
      <button type="button" className="btn" onClick={onStart}>
        Start quiz
      </button>
    </section>
  );
}
