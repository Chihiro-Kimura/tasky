import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';

// 🔹 環境変数のチェック（デバッグ用）
const missingVars = Object.entries({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}).filter(([value]) => !value);

if (missingVars.length > 0) {
  throw new Error(
    `Missing environment variables: ${missingVars
      .map(([key]) => key)
      .join(', ')}`
  );
}

// 🔹 Firebase の初期化（すでに初期化済みなら getApp() を使用）
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 🔹 Firestore & Auth の初期化
const db = getFirestore(app);
const auth = getAuth(app);

// 🔹 ログインの持続性を設定（リロード後もログイン情報を保持）
(async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    throw new Error(`Failed to set auth persistence: ${error}`);
  }
})();

// 🔹 Google 認証プロバイダーの設定
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' }); // すべてのログインでアカウント選択を要求

export { db, auth, provider };
