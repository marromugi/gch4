import { ChatMessage } from './ChatMessage'
import { ChatMessageId } from '../../valueObject/ChatMessageId/ChatMessageId'
import { ChatSessionId } from '../../valueObject/ChatSessionId/ChatSessionId'
import { ChatMessageRole } from '../../valueObject/ChatMessageRole/ChatMessageRole'

describe('ChatMessage', () => {
  it('有効なプロパティで作成できる', () => {
    const msg = ChatMessage.create({
      id: ChatMessageId.fromString('cm-1'),
      chatSessionId: ChatSessionId.fromString('cs-1'),
      role: ChatMessageRole.user(),
      content: 'こんにちは',
      targetFormFieldId: null,
      reviewPassed: null,
      createdAt: new Date('2025-01-01'),
    })
    expect(msg.content).toBe('こんにちは')
    expect(msg.role.isUser()).toBe(true)
  })

  it('空のcontentでエラーを投げる', () => {
    expect(() =>
      ChatMessage.create({
        id: ChatMessageId.fromString('cm-1'),
        chatSessionId: ChatSessionId.fromString('cs-1'),
        role: ChatMessageRole.assistant(),
        content: '',
        targetFormFieldId: null,
        reviewPassed: null,
        createdAt: new Date('2025-01-01'),
      })
    ).toThrow('ChatMessage content cannot be empty')
  })
})
