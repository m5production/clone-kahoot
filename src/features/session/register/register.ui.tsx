import { useForm } from 'react-hook-form'
import type { UserCredentials } from '@/entities/user'
import { Button, Input } from '@/shared/ui'
import { useRegister } from './register.model'

const defaultValues: UserCredentials = { name: '', password: '' }

export function RegisterForm({ onRegistered }: { onRegistered: () => void }) {
  const { register, handleSubmit } = useForm({ defaultValues })
  const { register: signUp } = useRegister(onRegistered)

  return (
    <form
      data-testid="register-form"
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(signUp)}
    >
      <Input
        data-testid="register-name-input"
        className="h-11"
        placeholder="Nickname"
        aria-label="Nickname"
        {...register('name', { required: true })}
      />
      <Input
        data-testid="register-password-input"
        className="h-11"
        type="password"
        placeholder="Password"
        aria-label="Password"
        {...register('password', { required: true })}
      />
      <Button
        data-testid="register-submit-button"
        type="submit"
        size="lg"
        className="w-full text-base font-bold"
      >
        Create account
      </Button>
    </form>
  )
}
