import { useState } from 'react';
import { Progress } from './components/Progress';
import { QuestionCard } from './components/QuestionCard';
import { ResultScreen } from './components/ResultScreen';
import { StartScreen } from './components/StartScreen';
import { questions } from './data/questions';
import { Status, validateQuestions } from './engine';
import { useQuiz } from './hooks/useQuiz';

// Runs once when the module loads, not on every render: bad data fails loudly before anything renders.
validateQuestions(questions);

export default function App() {
  const quiz = useQuiz(questions);
  // Only move focus to the start screen after a restart, not on first page load.
  const [hasRestarted, setHasRestarted] = useState(false);

  const handleRestart = () => {
    setHasRestarted(true);
    quiz.restart();
  };

  const announcement =
    quiz.status === Status.PLAYING
      ? `Question ${quiz.progress.current} of ${quiz.progress.total}`
      : quiz.status === Status.FINISHED
        ? `Quiz finished. You scored ${quiz.score} out of ${quiz.total}.`
        : '';

  return (
    <main className="app">
      {quiz.status === Status.IDLE && (
        <StartScreen
          title="JavaScript Quiz"
          total={quiz.total}
          focusOnMount={hasRestarted}
          onStart={quiz.start}
        />
      )}

      {quiz.status === Status.PLAYING && quiz.currentQuestion && (
        <div className="card">
          <Progress current={quiz.progress.current} total={quiz.progress.total} />
          <QuestionCard
            key={quiz.currentQuestion.id}
            question={quiz.currentQuestion}
            selected={quiz.selected}
            isLast={quiz.isLast}
            onSelect={quiz.select}
            onNext={quiz.next}
          />
        </div>
      )}

      {quiz.status === Status.FINISHED && (
        <ResultScreen
          score={quiz.score}
          total={quiz.total}
          review={quiz.review}
          onRestart={handleRestart}
        />
      )}

      {/* Always in the DOM, so screen readers pick up changes to its text. */}
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </main>
  );
}
