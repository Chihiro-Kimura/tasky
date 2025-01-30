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
          await saveUserToFirestore(currentUser); // 🔹 Firestore にユーザーを保存
          console.log('✅ Firestore にユーザー情報を保存しました');
        } catch (error) {
          console.error('❌ Firestore へのユーザー保存エラー:', error);
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
      await saveUserToFirestore(user); // 🔹 ログイン時にも Firestore に保存
      onLogin(user);
      console.log('✅ ログイン成功:', user);
    } catch (error) {
      console.error('❌ ログインエラー:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      onLogin(null);
      console.log('✅ ログアウト成功');
    } catch (error) {
      console.error('❌ ログアウトエラー:', error);
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
          createdAt: new Date(), // 🔹 作成日時を追加
        });
        console.log(`✅ Firestore にユーザー ${user.uid} を登録しました`);
      } else {
        console.log(`ℹ️ Firestore に既にユーザー ${user.uid} が存在しています`);
      }
    } catch (error) {
      console.error('❌ Firestore へのユーザー保存エラー:', error);
    }
  };

  return (
    <div className="mb-4 flex justify-between items-center">
      {user ? (
        <div className="flex items-center gap-4">
          <img
            src={user.photoURL || ''}
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
          <span>{user.displayName}</span>
          <Button onClick={handleLogout}>ログアウト</Button>
        </div>
      ) : (
        <Button onClick={handleLogin}>Googleでログイン</Button>
      )}
    </div>
  );
}
