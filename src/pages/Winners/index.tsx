import { buttonVariants } from '@/components/ui/button'
import { WinnersTable } from '@/components/ui/WinnersTable'
import { useActiveGame } from '@/lib/useActiveGame'
import { cn } from '@/lib/utils'
import { Link } from 'react-router'

export function Winners() {
  const { players } = useActiveGame()

  return (
    <section className="relative">
      <h1 className="text-6xl font-bold">Winners</h1>
      <WinnersTable players={players} />
      <Link
        className={cn(buttonVariants(), 'absolute right-4 top-4')}
        to="/home"
      >
        Home
      </Link>
    </section>
  )
}
