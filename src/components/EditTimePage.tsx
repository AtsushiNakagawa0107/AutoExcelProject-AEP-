import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { db } from "../firebaseConfig";
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface Entry {
  year: number;
  month: number;
  day: number;
  checkIn: string;
  checkOut: string;
}

const EditTimePage: React.FC = () => {
  const { userId, year, month } = useParams<{ userId: string, year: string, month: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const entry = (location.state as { entry?: Entry }).entry;

  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');

  useEffect(() => {
    if (entry) {
      setCheckIn(entry.checkIn);
      setCheckOut(entry.checkOut);
    }
  }, [entry]);

  const handleSave = async () => {
    if (!userId || !year || !month || !entry) {
      console.error("Required fields are missing.");
      return;
    }

    // const dateString = `${year}-${month.padStart(2, '0')}-${entry.day.toString().padStart(2, '0')}`;
    // const attendanceRecord = {
    //   checkIn: checkIn,
    //   checkOut: checkOut,
    // };

    const userDoc = doc(db, "attendance", `${userId}-${year}-${month.toString().padStart(2, '0')}`);

    try {
      const docSnapshot = await getDoc(userDoc)
      let entries = docSnapshot.exists() ? docSnapshot.data().entries || [] : [];
      const entryIndex = entries.findIndex((e: Entry) => e.day === entry.day)
      const updatedEntry = {
        ...entry,
        checkIn: checkIn,
        checkOut: checkOut
      };
      if (entryIndex > -1) {
        entries[entryIndex] = updatedEntry;
      } else {
        entries.push(updatedEntry);
      }

      await setDoc(userDoc, { entries }, { merge: true });
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
