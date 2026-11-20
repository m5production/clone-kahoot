import { Link } from 'react-router'
import { useActiveGame } from '@/entities/active-game'
import { WinnersTable } from '@/entities/player'
import { cn } from '@/shared/lib'
import { buttonVariants, Card, CardContent } from '@/shared/ui'

export function WinnersPage() {
  const { standings } = useActiveGame()

  return (
    <section className="min-h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-primary to-primary-deep p-6 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight text-primary-foreground drop-shadow-sm">
        Winners
      </h1>

      <Card className="w-full max-w-md rounded-3xl border-0 shadow-2xl">
        <CardContent className="p-0">
          <WinnersTable className="p-4" winners={standings ?? []} />
        </CardContent>
      </Card>

      <Link
        data-testid="home-link"
        className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }))}
        to="/home"
      >
        Home
      </Link>
    </section>
  )
}
