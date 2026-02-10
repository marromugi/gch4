import { Box, Button } from '@ding/ui'
import { Google } from '@ding/ui/icon'
import { cn } from '@ding/ui/lib'
import { useRouter } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { loginPage } from './const'
import type { LoginPageProps } from './type'

export function LoginPage({ className }: LoginPageProps) {
  const styles = loginPage()
  const router = useRouter()
  const { signInWithGoogle, isPending, isAuthenticated } = useAuth()

  // ログイン済みの場合はホームページにリダイレクト
  useEffect(() => {
    if (!isPending && isAuthenticated) {
      router.navigate({ to: '/' })
    }
  }, [isAuthenticated, isPending, router])

  const handleGoogleLogin = async () => {
    await signInWithGoogle()
  }

  // リダイレクト中は何も表示しない
  if (isAuthenticated) {
    return null
  }

  return (
    <Box className={cn(styles.container(), className)}>
      <motion.div
        className={styles.content()}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <h1 className={styles.title()}>ログイン</h1>
        <p className={styles.description()}>Googleアカウントでログインしてください</p>

        <Button
          variant="secondary"
          icon={Google}
          onClick={handleGoogleLogin}
          className={styles.googleButton()}
          disabled={isPending}
        >
          <span>Googleでログイン</span>
        </Button>
      </motion.div>
    </Box>
  )
}
