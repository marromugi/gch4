import { Flex } from '@ding/ui/layout'
import { useRouter } from '@tanstack/react-router'
import { globalHeader } from './const'
import { ThemeToggleButton } from './ThemeToggleButton'

export function GlobalHeader() {
  const styles = globalHeader()
  const router = useRouter()

  const handleLogoClick = () => {
    router.navigate({ to: '/forms' })
  }

  return (
    <header className={styles.container()}>
      <Flex justify="between" align="center" className={styles.inner()}>
        <button type="button" onClick={handleLogoClick} className={styles.logo()}>
          Ding
        </button>

        <Flex align="center" gap={2} className={styles.actions()}>
          <ThemeToggleButton />
        </Flex>
      </Flex>
    </header>
  )
}
