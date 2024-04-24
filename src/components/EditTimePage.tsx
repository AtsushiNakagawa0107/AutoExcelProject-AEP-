import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { db } from "../firebaseConfig";
import { doc, setDoc } from 'firebase/firestore';


interface Entry {
  year: number;
  month: number;
  day: number;
  checkIn: string;
  checkOut: string;
}


const EditTimePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const entry = location.state.entry;
  const [checkIn, setCheckIn] = useState(entry ? entry.checkIn : '');
  const [checkOut, setCheckOut] = useState(entry ? entry.checkOut : '');

  const handleSave = async () => {
    if (!userId) {
      console.error("UserId is undefined.");
      return;
    }

    const dateString = `${entry.year}-${String(entry.month).padStart(2, '0')}-${String(entry.day).padStart(2, '0')}`;
    const checkInDateTimeString = `${String(entry.checkInHour).padStart(2, '0')}:${String(entry.checkInMinute).padStart(2, '0')}`;
    const checkOutDateTimeString = `${String(entry.checkOutHour).padStart(2, '0')}:${String(entry.checkOutMinute).padStart(2, '0')}`;

    const attendanceRecord = {
      checkIn: checkInDateTimeString,
      checkOut: checkOutDateTimeString,
    };

    const userDoc = doc(db, "attendance", userId);

    try {
      await setDoc(userDoc, {
        [dateString]: attendanceRecord ,
      }, { merge: true });
      console.log("Document updated successfully");
      navigate('/auto-excel-app', { state: {dateUpdated: true}});
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  return (
    <div>
      <h2>時間を修正: {entry.day}日</h2>
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
