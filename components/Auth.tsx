'use client';

import { useState, useEffect } from 'react';
import { auth, db, provider } from '@/lib/firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // 🔹 Firestore 操作を追加
import { Button } from '@/components/ui/button';
import Image from 'next/image'; // 追加
import { FirebaseError } from 'firebase/app';

export default function Auth({
  onLogin,
}: {
  onLogin: (user: User | null) => void;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      onLogin(currentUser);

      if (currentUser) {
        try {
          await saveUserToFirestore(currentUser);
        } catch (error) {
          throw new Error(`Failed to save user to Firestore: ${error}`);
        }
      }
    });

    return () => unsubscribe();
  }, [onLogin]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
      await saveUserToFirestore(user);
      onLogin(user);
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/popup-blocked') {
          alert(
            'ポップアップがブロックされました。ブラウザの設定を確認してください。'
          );
        } else if (error.code === 'auth/popup-closed-by-user') {
          // ユーザーが閉じた場合は何もしない
        } else {
          alert('ログインに失敗しました。もう一度お試しください。');
        }
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      onLogin(null);
    } catch {
      // エラーは静かに処理
    }
  };

  // 🔹 Firestore にユーザー情報を保存する関数
  const saveUserToFirestore = async (user: User) => {
    if (!user?.uid) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: new Date(),
        });
      }
    } catch (error) {
      throw new Error(`Failed to save user to Firestore: ${error}`);
    }
  };

  return (
    <div className="mb-4 flex justify-between items-center p-4 bg-card rounded-lg border shadow-sm">
      {user ? (
        <div className="flex items-center gap-4">
          <div className="relative">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt="プロフィール画像"
                width={40}
                height={40}
                className="rounded-full ring-2 ring-primary/10"
                unoptimized
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-medium">
                {user.displayName?.[0] || '?'}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              {user.displayName}
            </span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="ml-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            ログアウト
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleLogin}
          variant="default"
          size="lg"
          className="font-medium"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Googleでログイン
        </Button>
      )}
    </div>
  );
}
