import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Link, useNavigate } from 'react-router'
import { useGetGames } from './api/useGetGames'
import { usePostAddNewGame } from './api/usePostAddNewGame'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import {
  AUTH_COOKIE_NAME,
  axiosInstance,
  DOMAIN,
  LS_USER_ID_KEY,
} from '@/constants'
import { toast } from 'react-toastify'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useQueryClient } from '@tanstack/react-query'

export function MainWindow() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: games } = useGetGames()

  const { mutate: postNewGame } = usePostAddNewGame({
    handleSuccess: (id: string) => {
      navigate(`/${id}/admin`)
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { gameId: '' } })

  const onJoinGameSubmit = async ({ gameId }: { gameId: string }) => {
    try {
      await axiosInstance.get(`/active-game/${gameId}`)

      navigate(`/${gameId}/player`)
    } catch (e: any) {
      toast(e.response.data)
    }
  }

  const handleMakeNewGameClick = async () => {
    postNewGame()
  }

  const handleLogoutClick = () => {
    localStorage.removeItem(LS_USER_ID_KEY)

    document.cookie =
      AUTH_COOKIE_NAME +
      '=; Max-Age=-1; path=' +
      '/' +
      ';' +
      ' domain=' +
      DOMAIN +
      ';'

    queryClient.invalidateQueries({ queryKey: ['games'] })

    navigate('/')
  }

  return (
    <div className="relative w-full h-full flex flex-col gap-4 items-center justify-center">
      <div className="fixed opacity-55 hover:opacity-100 transition top-4 right-4 flex flex-col gap-4">
        <UserAvatar className="static" />
        <Button onClick={handleLogoutClick}>Logout</Button>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onJoinGameSubmit)} className="flex gap-2">
          <Input
            {...register('gameId', { required: 'Enter valid game link' })}
            aria-invalid={Boolean(errors.gameId)}
          />
          <Button type="submit">Join game</Button>
        </form>

        {Boolean(errors.gameId) && (
          <p className="text-red-300">{errors.gameId?.message}</p>
        )}

        <nav className="flex flex-col gap-6">
          <Button onClick={handleMakeNewGameClick}>+ Create new Quiz</Button>
        </nav>
      </Card>

      <Card className="p-4">
        {games && games.length !== 0 ? (
          <ul>
            {games?.map(({ id }, index) => (
              <li key={id}>
                <Link to={'../' + id + '/admin'}>Quiz #{index + 1}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>You haven't created any games yet.</p>
        )}
      </Card>
    </div>
  )
}
