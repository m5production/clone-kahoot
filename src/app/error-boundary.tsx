import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '@/shared/lib'
import { buttonVariants, Card, CardContent } from '@/shared/ui'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/** Last-resort fallback: an uncaught render error must not leave a blank page.
    A class component is required — error boundaries cannot be functions. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <p className="font-bold">Something went wrong</p>
            <p className="text-muted-foreground">
              Please reload the page or go back to the home page.
            </p>
            <Link
              className={cn(buttonVariants({ variant: 'secondary' }))}
              to="/home"
              onClick={() => this.setState({ hasError: false })}
            >
              Home
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
}
