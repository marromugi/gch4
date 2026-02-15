import { initializeApp, getApps } from 'firebase-admin/app'
import { getFirestore as getAdminFirestore, type Firestore } from 'firebase-admin/firestore'

interface FirestoreConfig {
  projectId?: string
  databaseId?: string
}

let firestoreInstance: Firestore | null = null

/**
 * Firestore インスタンスを取得（シングルトン）
 *
 * Firebase Admin SDK は一度だけ初期化する必要があるため、
 * インスタンスをキャッシュして返す。
 */
export function getFirestore(config: FirestoreConfig): Firestore {
  if (firestoreInstance) {
    return firestoreInstance
  }

  // Firebase Admin が未初期化の場合は初期化
  if (getApps().length === 0) {
    initializeApp({
      projectId: config.projectId,
    })
  }

  // Firestore インスタンスを取得
  firestoreInstance = getAdminFirestore()

  return firestoreInstance
}
