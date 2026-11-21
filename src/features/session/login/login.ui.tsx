import { useForm } from 'react-hook-form'
import type { UserCredentials } from '@/entities/user'
import { Button, Input } from '@/shared/ui'
import { useLogin } from './login.model'

const defaultValues: UserCredentials = { name: '', password: '' }

export function LoginForm({ onLoggedIn }: { onLoggedIn: () => void }) {
  const { register, handleSubmit } = useForm({ defaultValues })
  const { login } = useLogin(onLoggedIn)

  return (
    <form
      data-testid="login-form"
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(login)}
    >
      <Input
        data-testid="login-name-input"
        className="h-11"
        placeholder="Nickname"
        aria-label="Nickname"
        {...register('name', { required: true })}
      />
      <Input
        data-testid="login-password-input"
        className="h-11"
        type="password"
        placeholder="Password"
        aria-label="Password"
        {...register('password', { required: true })}
      />
      <Button
        data-testid="login-submit-button"
        type="submit"
        size="lg"
        className="w-full text-base font-bold"
      >
        Enter
      </Button>
    </form>
  )
}
