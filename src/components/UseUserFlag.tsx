import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebaseConfig";

// TypeScriptを使用したカスタムフック
function useUserFlag(): number {
  const [selectExcelFileFlag, setSelectExcelFileFlag] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        // ここでユーザーの属性に基づいてフラグを設定
        // 例: user.email が特定のドメインに含まれるかどうかをチェック
        const isSpecialDomain = user.email && user.email.startsWith('matikado');
        setSelectExcelFileFlag(isSpecialDomain ? 0 : 1);
      } else {
        setSelectExcelFileFlag(0); // ユーザーがログインしていない場合はデフォルト値
      }
    });
    return () => unsubscribe();
  }, []);

  return selectExcelFileFlag;
}

export default useUserFlag;
