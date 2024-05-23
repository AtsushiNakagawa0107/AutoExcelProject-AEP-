import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from "../firebaseConfig";
import './EditTimeFieldPage.scss';

interface Entry {
  year: number;
  month: number;
  day: number;
  checkIn: string;
  checkOut: string;
  task: string;
  note: string;
}

interface EditTimeFieldPageProps {
  field: 'checkIn' | 'checkOut';  // 'checkIn' または 'checkOut' を指定
}

const EditTimeFieldPage: React.FC<EditTimeFieldPageProps> = ({ field }) => {
  const { userId, year, month, day } = useParams<{ userId: string, year: string, month: string, day: string }>();
  const navigate = useNavigate();
  const [time, setTime] = useState<string>('');
  const [entry, setEntry] = useState<Entry | undefined>(undefined);

  // エントリの取得
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
        setTime(entriesData[entryKey]?.[field] ?? '');
      } else {
        console.error("Document does not exist for this month.");
      }
    };
  
    fetchEntry();
  }, [userId, year, month, day, field]);

  // 時間の保存
  const handleSave = async () => {
    if (!userId || !year || !month || !day || !entry) {
      console.error("Required fields are missing.");
      return;
    }

    const entryKey = `${year}-${month}-${day}`;
    const userDocRef = doc(db, "users", userId, "attendance", `${year}-${month}`);
    const docSnapshot = await getDoc(userDocRef);
    const entriesData = docSnapshot.exists() ? docSnapshot.data().entries || {} : {};
    const updatedEntry = {
      ...entriesData[entryKey],
      [field]: time
    };

    entriesData[entryKey] = updatedEntry;
    await setDoc(userDocRef, { entries: entriesData }, { merge: true });
    console.log("Time updated successfully");
    navigate('/auto-excel-app', { state: { dateUpdated: true } });
  };

  return (
    <div className='time-flex'>
      <h2>時間を修正: {entry?.day}日</h2>
      <div className='checkTime'>
        <p>現在の{field === 'checkIn' ? 'チェックイン' : 'チェックアウト'}: {time}</p>
        <div className='time-edit-form'>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          <button onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
};

export default EditTimeFieldPage;
