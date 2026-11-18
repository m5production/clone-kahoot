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
        'fixed top-4 left-4 border-3 px-2 max-w-40 truncate bg-white rounded-xl',
        className
      )}
    >
      {user?.name}
    </div>
  )
}
