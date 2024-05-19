import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
  const { userId, year, month } = useParams<{ userId: string, year: string, month: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const entry = location.state?.entry as Entry | undefined;

  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');

  // 現在のエントリの値をフォームに設定
  useEffect(() => {
    if (entry) {
      setCheckIn(entry.checkIn);
      setCheckOut(entry.checkOut);
    }
  }, [entry]);

  // 保存処理
  const handleSave = async () => {
    if (!userId || !year || !month || !entry) {
      console.error("Required fields are missing.");
      return;
    }

    const entryKey = `${year.padStart(2, '0')}-${month.padStart(2, '0')}-${entry.day.toString().padStart(2, '0')}`;

    const userDocRef = doc(db, "users", userId, "attendance", `${year}-${month.padStart(2, '0')}`);
    try {
      const docSnapshot = await getDoc(userDocRef);
      let entriesData = docSnapshot.exists() ? docSnapshot.data().entries || {} : {};
  
      const existingEntry = entriesData[entryKey] || {};
      const updatedEntry = {
        ...existingEntry,
        checkIn: checkIn || existingEntry.checkIn,
        checkOut: checkOut || existingEntry.checkOut,
        task: entry.task ?? existingEntry.task, // undefined なら既存のデータを保持
        note: entry.note ?? existingEntry.note  // undefined なら既存のデータを保持
      };
  
      entriesData[entryKey] = updatedEntry; // 直接キーに対して更新
  
      await setDoc(userDocRef, { entries: entriesData }, { merge: true });
      console.log("Document updated successfully");
      navigate('/auto-excel-app', { state: { dateUpdated: true } });
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  return (
    <div>
      <h2>時間を修正: {entry?.day}日</h2>
      <div>
        <div>
          <p>出勤</p>
          <input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
        </div>
        <div>
          <p>退勤</p>
          <input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
        </div>
      </div>
      <button onClick={handleSave}>保存</button>
    </div>
  );
};

export default EditTimePage;
