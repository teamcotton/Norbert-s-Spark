'use client'

import { SignInForm } from '@/view/components/SignInForm.js'
import { useSignInForm } from '@/view/hooks/useSignInForm.js'

export default function SignInFormWrapper() {
  const { errors, formData, handleChange, handleGitHubSignIn, handleGoogleSignIn } = useSignInForm()

  // Do not pass handleSubmit - we want the browser to perform a native POST to the server action
  return (
    <SignInForm
      formData={formData}
      errors={errors}
      onFieldChange={handleChange}
      onGoogleSignIn={handleGoogleSignIn}
      onGitHubSignIn={handleGitHubSignIn}
      action="/api/signin"
    />
  )
}
