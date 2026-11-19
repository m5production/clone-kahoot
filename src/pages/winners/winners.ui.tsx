import { Link } from 'react-router'
import { useActiveGame } from '@/entities/active-game'
import { WinnersTable } from '@/entities/player'
import { cn } from '@/shared/lib'
import { buttonVariants } from '@/shared/ui'

export function WinnersPage() {
  const { standings } = useActiveGame()

  return (
    <section className="relative">
      <h1 className="text-6xl font-bold">Winners</h1>
      <WinnersTable winners={standings ?? []} />
      <Link
        data-testid="home-link"
        className={cn(buttonVariants(), 'absolute right-4 top-4')}
        to="/home"
      >
        Home
      </Link>
    </section>
  )
}
