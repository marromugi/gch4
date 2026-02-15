import { useCallback } from 'react'
import { questionCard } from './const'
import { OptionButton } from './OptionButton'
import type { QuestionCardProps } from './type'

export function QuestionCard({
  question,
  selectedOptionIds,
  freeText,
  onSelectionChange,
  onFreeTextChange,
  disabled,
}: QuestionCardProps) {
  const styles = questionCard()

  const handleOptionToggle = useCallback(
    (optionId: string) => {
      if (question.selectionType === 'radio') {
        // ラジオボタン: 単一選択
        onSelectionChange(question.id, [optionId])
      } else {
        // チェックボックス: 複数選択
        const isSelected = selectedOptionIds.includes(optionId)
        if (isSelected) {
          onSelectionChange(
            question.id,
            selectedOptionIds.filter((id) => id !== optionId)
          )
        } else {
          onSelectionChange(question.id, [...selectedOptionIds, optionId])
        }
      }
    },
    [question.id, question.selectionType, selectedOptionIds, onSelectionChange]
  )

  return (
    <div className={styles.container()}>
      <h3 className={styles.question()}>{question.question}</h3>
      <div className={styles.optionsContainer()}>
        {question.options.map((option) => (
          <OptionButton
            key={option.id}
            option={option}
            isSelected={selectedOptionIds.includes(option.id)}
            selectionType={question.selectionType}
            onToggle={() => handleOptionToggle(option.id)}
            disabled={disabled}
          />
        ))}
      </div>
      <p className={styles.selectionHint()}>
        {question.selectionType === 'radio' ? '1つ選択してください' : '複数選択可能'}
      </p>
      <div className={styles.freeTextContainer()}>
        <textarea
          className={styles.freeTextInput()}
          placeholder="自由に回答を入力できます（任意）"
          value={freeText}
          onChange={(e) => onFreeTextChange(question.id, e.target.value)}
          disabled={disabled}
          rows={2}
        />
      </div>
    </div>
  )
}
