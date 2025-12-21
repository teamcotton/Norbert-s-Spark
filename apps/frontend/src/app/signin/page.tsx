'use server'

import SignInFormWrapper from './SignInFormWrapper.js'

// Server component that renders the client `SignInForm` via a small wrapper.
export default function SignInPage() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem' }}>
      <SignInFormWrapper />
    </div>
  )
}
