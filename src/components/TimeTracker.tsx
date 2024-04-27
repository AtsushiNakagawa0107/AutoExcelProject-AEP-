
import React, { useEffect, useState, useRef } from 'react';
import GoToDetailPage from './GoToDetailPage';
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useTime } from './TimeContext';

interface TimeTrackerProps {
  userId: string;
}

interface Entry {
  day: number;
  checkIn: string | null;
  checkOut: string | null;
  task: string;
  note: string;
}


const TimeTracker: React.FC<TimeTrackerProps> = ({ userId }) => {
  const { checkInTime, setCheckInTime, checkOutTime, setCheckOutTime} = useTime();


  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  const handleAttendanceUpdate = async (type: 'checkIn' | 'checkOut') => {
    const now = new Date();
    const yearStr = now.getFullYear().toString();
    const monthStr = (now.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = now.getDate().toString();
    const timeStr = formatTime(now);
    
    const userDocRef = doc(db, "attendance", `${userId}-${yearStr}-${monthStr}`);
    const docSnapshot = await getDoc(userDocRef);

    let entries: Entry[] = docSnapshot.exists() && docSnapshot.data().entries ? docSnapshot.data().entries : [];
    const dayIndex = entries.findIndex(entry => entry.day === parseInt(dayStr));

    if (dayIndex === -1) {
      // 新しいエントリを作成
      entries.push({
        day: parseInt(dayStr),
        checkIn: type === 'checkIn' ? formatTime(now) : null,
        checkOut: type === 'checkOut' ? formatTime(now) : null,
        task: '',
        note: ''
      })
    } else {
      // 既存のエントリを更新
      entries[dayIndex] = {
        ...entries[dayIndex],
        [type]: formatTime(now)
      };
    }

    await setDoc(userDocRef, { entries }, { merge: true });

    alert(`${type === 'checkIn' ? '出勤' : '退勤'}時間が更新されました: ${timeStr}`)
  };

  // チェックインのハンドラ
  const handleCheckIn = async () => {
    handleAttendanceUpdate('checkIn');
  };

  // チェックアウトのハンドラ
  const handleCheckOut = async () => {
    handleAttendanceUpdate('checkOut');
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
