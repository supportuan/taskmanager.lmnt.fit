import { AuthBranding } from '../components/auth/AuthBranding'
import { AuthContainer } from '../components/auth/AuthContainer'
import { AtmosphericBackground } from '../components/layout/AtmosphericBackground'

export function AuthPage() {
  return (
    <div className="auth-page-shell relative min-h-screen">
      <AtmosphericBackground />

      <div className="relative z-10 flex min-h-screen flex-col px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
        <AuthBranding />

        <div className="auth-page-main">
          <AuthContainer />
        </div>
      </div>
    </div>
  )
}
