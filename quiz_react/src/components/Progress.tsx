import { useId } from 'react';

type ProgressProps = {
  current: number;
  total: number;
};

/** "Question 2 of 8" plus a native progress bar labelled by that text. */
export function Progress({ current, total }: ProgressProps) {
  const labelId = useId();

  return (
    <div className="progress">
      <p id={labelId} className="muted">
        Question {current} of {total}
      </p>
      <progress max={total} value={current} aria-labelledby={labelId} />
    </div>
  );
}
