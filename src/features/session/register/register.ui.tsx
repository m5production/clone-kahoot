import { useForm } from 'react-hook-form'
import type { UserCredentials } from '@/entities/user'
import { Button, Input, Label } from '@/shared/ui'
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
      <Label>
        <Input
          data-testid="register-name-input"
          className="h-11"
          placeholder="Nickname"
          {...register('name', { required: true })}
        />
      </Label>
      <Label>
        <Input
          data-testid="register-password-input"
          className="h-11"
          type="password"
          placeholder="Password"
          {...register('password', { required: true })}
        />
      </Label>
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
