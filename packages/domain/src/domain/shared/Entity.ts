/**
 * エンティティの基底インターフェース
 */
export interface Entity<TId> {
  readonly id: TId
  equals(other: Entity<TId>): boolean
}

/**
 * タイムスタンプを持つエンティティ
 */
export interface TimestampedEntity<TId> extends Entity<TId> {
  readonly createdAt: Date
  readonly updatedAt: Date
}
