import { cn } from '../../../lib/utils'
import { Required } from '../../icon'
import { formFieldWrapper } from './const'
import type { FormFieldWrapperProps } from './type'

export const FormFieldWrapper = ({
  label,
  description,
  error,
  required = false,
  children,
  className,
  htmlFor,
  disabled = false,
  ...props
}: FormFieldWrapperProps) => {
  const styles = formFieldWrapper({ disabled })

  return (
    <div className={cn(styles.container(), className)} {...props}>
      {/* ラベル部分 */}
      <div className={styles.labelWrapper()}>
        <label htmlFor={htmlFor} className={styles.label()}>
          {label}
        </label>
        {required && <Required className={styles.requiredMark()} />}
      </div>

      {/* 説明文（オプション） */}
      {description && <p className={styles.description()}>{description}</p>}

      {/* 子要素（入力フィールド） */}
      <div className={styles.content()}>{children}</div>

      {/* エラーメッセージ（オプション） */}
      {error && (
        <p className={styles.error()} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
