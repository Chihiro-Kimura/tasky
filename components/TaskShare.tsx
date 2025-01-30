import { useState } from 'react';
import { db, auth } from '@/lib/firebase';
import {
  doc,
  updateDoc,
  arrayUnion,
  getDocs,
  collection,
  query,
  where,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function TaskShare({
  taskId,
  ownerId,
  onClose,
}: {
  taskId: string;
  ownerId: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const user = auth.currentUser;

  const handleShareTask = async () => {
    if (!email) {
      toast({
        title: '共有するユーザーのメールアドレスを入力してください',
        variant: 'destructive',
      });
      return;
    }

    try {
      // 🔹 Firestore でユーザーを検索して UID を取得
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', email)
      );
      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        toast({
          title: '指定されたユーザーが見つかりません',
          variant: 'destructive',
        });
        return;
      }
      const sharedUserId = usersSnapshot.docs[0].id; // 🔹 共有するユーザーの UID

      console.log('共有するユーザーの UID:', sharedUserId);

      // 🔹 タスクのオーナーIDを取得
      const taskSnapshot = await getDocs(
        query(
          collection(db, `users/${user?.uid}/tasks`),
          where('__name__', '==', taskId)
        )
      );

      if (taskSnapshot.empty) {
        toast({
          title: 'タスクが見つかりません',
          variant: 'destructive',
        });
        return;
      }

      const taskData = taskSnapshot.docs[0].data();
      console.log('タスクデータ:', taskData);

      if (!taskData.ownerId) {
        toast({
          title: 'タスクのオーナーIDが見つかりません',
          variant: 'destructive',
        });
        return;
      }

      const ownerIdFromTask = taskData.ownerId;
      console.log('タスクのオーナーID:', ownerIdFromTask);

      // 🔹 Firestore の正しいパスを参照
      const ownerTaskRef = doc(db, `users/${ownerId}/tasks`, taskId);

      await updateDoc(ownerTaskRef, {
        sharedWith: arrayUnion(sharedUserId), // 🔹 UID を `sharedWith` に追加
      });

      setEmail('');
      toast({
        title: 'タスクを共有しました！',
      });
      onClose();
    } catch (error) {
      console.error('タスク共有エラー:', error);
      toast({
        title: 'タスクの共有に失敗しました',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mt-2 flex gap-2">
      <Input
        type="email"
        placeholder="共有するユーザーのメールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button onClick={handleShareTask}>共有</Button>
    </div>
  );
}
