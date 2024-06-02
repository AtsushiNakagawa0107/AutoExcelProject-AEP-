import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from "../firebaseConfig";
import './EditTimePage.scss'

interface Entry {
  year: number;
  month: number;
  day: number;
  checkIn: string;
  checkOut: string;
  task: string;
  note: string;
}

const EditTimePage: React.FC = () => {
  // URLからパラメータを取得
  const params = useParams<{ userId: string, year: string, month: string, day: string }>();
  
  // 2桁のフォーマットに整形
  const year = params.year;
  const month = (params.month ?? '01').padStart(2, '0'); // 2桁にフォーマット
  const day = (params.day ?? '01').padStart(2, '0'); // 2桁にフォーマット
  const userId = params.userId;

  const navigate = useNavigate();
  const [entry, setEntry] = useState<Entry | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !year || !month || !day) {
      console.error("Required parameters are missing.");
      return;
    }
    const fetchEntry = async () => {
      const entryKey = `${year}-${month}-${day}`;
      const userDocRef = doc(db, "users", userId, "attendance", `${year}-${month}`);
      const docSnapshot = await getDoc(userDocRef);
      if (docSnapshot.exists()) {
        const entriesData = docSnapshot.data().entries || {};
        setEntry(entriesData[entryKey]);
        setLoading(false);
      } else {
        console.error("Document does not exist for this path.");
        setLoading(false);
      }
    };

    fetchEntry();
  }, [userId, year, month, day]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!entry) {
    return <p>データが存在しません。</p>;
  }

  return (
    <div className='edit-date'>
      <h2>時間を修正: {entry.day}日</h2>
      <div className='edit-time'>
        <div className='edit-checkIn'>
          <p>現在のチェックイン: {entry.checkIn}</p>
          <button onClick={() => navigate(`/edit-time/${userId}/${year}/${month}/${day}/checkin`, { state: { entry } })}>チェックイン修正</button>
        </div>
        <div className='edit-checkOut'>
          <p>現在のチェックアウト: {entry.checkOut}</p>
          <button onClick={() => navigate(`/edit-time/${userId}/${year}/${month}/${day}/checkout`, { state: { entry } })}>チェックアウト修正</button>
        </div>
      </div>
      <button className='back-button' onClick={() => navigate(`/auto-excel-app`)}>戻る</button>
    </div>
  );
};

export default EditTimePage;
