import type { H3Event } from 'h3'
import admin from 'firebase-admin'
import type { Firestore } from 'firebase-admin/firestore'

let cachedApp: admin.app.App | null = null

/**
 * 取得已初始化的 Firebase Admin 與 Firestore 實例。
 * 應在 server API 或 event handler 內呼叫，並傳入 event 以正確讀取 runtimeConfig。
 *
 * @param event - Nuxt/Nitro 的 H3Event（從 defineEventHandler 取得），用於 useRuntimeConfig(event)
 * @returns { app, db } - Firebase App 與 Firestore 實例
 */
export function getFirebaseAdmin(event: H3Event): {
  app: admin.app.App
  db: Firestore
} {
  if (cachedApp) {
    return {
      app: cachedApp,
      db: admin.firestore(cachedApp)
    }
  }

  const config = useRuntimeConfig(event)
  const projectId = config.firebaseProjectId
  const clientEmail = config.firebaseClientEmail
  const privateKey = config.firebasePrivateKey

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase config. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in env or runtimeConfig.'
    )
  }

  // 環境變數中的 private key 常以 \n 字串形式儲存，需還原為換行
  const decodedPrivateKey = (privateKey as string).replace(/\\n/g, '\n')

  cachedApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: decodedPrivateKey
    })
  })

  return {
    app: cachedApp,
    db: admin.firestore(cachedApp)
  }
}
