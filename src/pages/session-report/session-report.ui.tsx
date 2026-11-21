import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { formatGameUpdatedAt } from '@/entities/game'
import { SESSION_REPORT_QUERY } from '@/entities/history'
import { WinnersTable } from '@/entities/player'
import { DeleteSessionRecordButton } from '@/features/history/delete-session-record'
import { cn } from '@/shared/lib'
import {
  buttonVariants,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui'

const formatMs = (ms: number | null) =>
  ms === null ? '—' : `${(ms / 1000).toFixed(1)} s`

/** FR-81: the report of a finished session — standings and every answer per question */
export function SessionReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const {
    data: report,
    isLoading,
    isError,
  } = useQuery(SESSION_REPORT_QUERY.queryOptions(sessionId))

  return (
    <div className="relative min-h-full w-full bg-gradient-to-b from-primary to-primary-deep p-6 flex flex-col items-center gap-8">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="min-w-0 truncate text-3xl font-extrabold tracking-tight text-primary-foreground drop-shadow-sm">
            {report?.quizTitle ?? 'Session report'}
          </h1>
          <Link
            data-testid="back-to-history-link"
            className={cn(buttonVariants({ variant: 'secondary' }), 'shrink-0')}
            to="/history"
          >
            History
          </Link>
        </div>

        {isLoading && <p className="text-primary-foreground">Loading…</p>}
        {isError && (
          <p
            data-testid="report-unavailable"
            className="text-primary-foreground"
          >
            This session record is not available.
          </p>
        )}

        {report && (
          <>
            <Card className="rounded-3xl border-0 shadow-2xl">
              <CardHeader className="flex-row items-center justify-between gap-4">
                <CardTitle>
                  Standings · {formatGameUpdatedAt(report.startedAt)} ·{' '}
                  {report.status === 'finished' ? 'Finished' : 'Aborted'}
                </CardTitle>
                <DeleteSessionRecordButton
                  sessionId={report.id}
                  onDeleted={() => navigate('/history')}
                />
              </CardHeader>
              <CardContent className="p-0">
                <WinnersTable
                  className="p-4"
                  winners={report.standings.map((p) => ({
                    place: p.place ?? 0,
                    id: p.userId,
                    name: p.nickname,
                    score: p.score,
                    correctCount: p.correctCount,
                  }))}
                />
              </CardContent>
            </Card>

            {report.questions.map((question) => (
              <Card
                key={question.id}
                data-testid={`report-question-${question.id}`}
                className="rounded-3xl border-0 shadow-2xl"
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {question.position} · {question.timeLimitSec} s
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="font-medium">{question.text}</p>
                  <p className="text-sm text-muted-foreground">
                    Accepted: {question.acceptedAnswers.join(', ')}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {question.answers.map((answer) => (
                      <li
                        key={answer.userId}
                        data-testid={`report-answer-${question.id}-${answer.userId}`}
                        className={cn(
                          'flex items-center justify-between gap-4 rounded-xl px-3 py-2 text-sm',
                          answer.isCorrect
                            ? 'bg-success/15 text-success'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        <span className="font-semibold">{answer.nickname}</span>
                        <span>
                          {answer.text ?? 'No answer'} ·{' '}
                          {formatMs(answer.responseTimeMs)} · +{answer.points}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
