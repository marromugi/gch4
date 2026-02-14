const AGENT_TYPES = ['greeter', 'architect', 'interviewer', 'reviewer'] as const

export type AgentTypeValue = (typeof AGENT_TYPES)[number]

/**
 * エージェント種別を表す値オブジェクト
 */
export class AgentType {
  private constructor(private readonly _value: AgentTypeValue) {}

  get value(): AgentTypeValue {
    return this._value
  }

  static from(value: string): AgentType {
    if (!AGENT_TYPES.includes(value as AgentTypeValue)) {
      throw new Error(`Invalid AgentType: ${value}`)
    }
    return new AgentType(value as AgentTypeValue)
  }

  static greeter(): AgentType {
    return new AgentType('greeter')
  }

  static architect(): AgentType {
    return new AgentType('architect')
  }

  static interviewer(): AgentType {
    return new AgentType('interviewer')
  }

  static reviewer(): AgentType {
    return new AgentType('reviewer')
  }

  isGreeter(): boolean {
    return this._value === 'greeter'
  }

  isArchitect(): boolean {
    return this._value === 'architect'
  }

  isInterviewer(): boolean {
    return this._value === 'interviewer'
  }

  isReviewer(): boolean {
    return this._value === 'reviewer'
  }

  equals(other: AgentType): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
