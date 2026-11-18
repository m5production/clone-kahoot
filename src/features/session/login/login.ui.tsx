import { useForm } from 'react-hook-form'
import { Button, Input, Label } from '@/shared/ui'
import type { UserCredentials } from '@/entities/user'
import { useLogin } from './login.model'

const defaultValues: UserCredentials = { name: '', password: '' }

export function LoginForm({ onLoggedIn }: { onLoggedIn: () => void }) {
  const { register, handleSubmit } = useForm({ defaultValues })
  const { login } = useLogin(onLoggedIn)

  return (
    <form
      data-testid="login-form"
      className="max-w-3xs flex flex-col gap-4 p-4"
      onSubmit={handleSubmit(login)}
    >
      <Label>
        <Input
          data-testid="login-name-input"
          placeholder="Nickname"
          {...register('name', { required: true })}
        />
      </Label>
      <Label>
        <Input
          data-testid="login-password-input"
          type="password"
          placeholder="Password"
          {...register('password', { required: true })}
        />
      </Label>
      <Button data-testid="login-submit-button" type="submit">
        Enter
      </Button>
    </form>
  )
}
