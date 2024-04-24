
import React, { useState } from 'react';
import GoToDetailPage from './GoToDetailPage';
import { db } from '../firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useTime } from './TimeContext';

interface TimeTrackerProps {
  userId: string;
}


const TimeTracker: React.FC<TimeTrackerProps> = ({ userId }) => {
  const { checkInTime, setCheckInTime, checkOutTime, setCheckOutTime} = useTime();

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // チェックインのハンドラ
  const handleCheckIn = async () => {
    const now = new Date();
    setCheckInTime(now);
    const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const attendanceRef = doc(db, "attendance", userId);

    await setDoc(attendanceRef, {
      [dateStr]: {
        checkIn: formatTime(now),
        checkOut: null
      }
    }, {merge: true});
  };

  // チェックアウトのハンドラ
  const handleCheckOut = async () => {
    const now = new Date();
    setCheckOutTime(now);
    const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const attendanceRef = doc(db, "attendance", userId);

    await setDoc(attendanceRef, {
      [dateStr]: {
        checkOut: formatTime(now)
      }
    }, {merge: true});
  };

  return (
    <div>
      <h1>タイムトラッカー</h1>
      <button onClick={handleCheckIn}>出勤</button>
      <button onClick={handleCheckOut}>退勤</button>
      {checkInTime && <p>出勤時間: {checkInTime.toLocaleTimeString()}</p>}
      {checkOutTime && <p>退勤時間: {checkOutTime.toLocaleTimeString()}</p>}
      <GoToDetailPage />
    </div>
  );
};

export default TimeTracker;
