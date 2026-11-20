import { useQuery } from '@tanstack/react-query'
import { cn } from '@/shared/lib'
import { USER_QUERY } from './user.queries'

type Props = React.ComponentProps<'div'> & {
  userId: string | null
}

export function UserAvatar({ userId, className, ...props }: Props) {
  const { data: user } = useQuery(USER_QUERY.queryOptions(userId))

  return (
    <div
      data-testid="user-avatar"
      {...props}
      title={user?.name}
      className={cn(
        'rounded-full bg-primary-foreground/15 px-3 py-1.5 text-sm font-semibold text-primary-foreground max-w-40 truncate backdrop-blur',
        className,
      )}
    >
      {user?.name}
    </div>
  )
}
