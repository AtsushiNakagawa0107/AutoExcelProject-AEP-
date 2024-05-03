import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useTime } from './TimeContext';
import GoToDetailPage from './GoToDetailPage';

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
  const { checkInTime, setCheckInTime, checkOutTime, setCheckOutTime } = useTime();
  const [entries, setEntries] = useState<Entry[]>([]); // entries状態を追加

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleAttendanceUpdate = async (type: 'checkIn' | 'checkOut') => {
    const now = new Date();
    const yearStr = now.getFullYear().toString();
    const monthStr = (now.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = now.getDate().toString().padStart(2, '0');
    const timeStr = formatTime(now);
  
    const docKey = `${yearStr}-${monthStr}-${dayStr}`; // 日付を年月日形式で統一
    const userDocRef = doc(db, "attendance", `${userId}-${yearStr}-${monthStr}`);
    const docSnapshot = await getDoc(userDocRef);
  
    let currentEntries = docSnapshot.exists() && docSnapshot.data().entries ? docSnapshot.data().entries : {};
  
    if (!docSnapshot.exists() || Object.keys(currentEntries).length === 0) {
      const daysInMonth = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();
      currentEntries = {};
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${yearStr}-${monthStr}-${day.toString().padStart(2, '0')}`;
        currentEntries[dateStr] = {
          day: day,
          checkIn: '00:00',
          checkOut: '00:00',
          task: '',
          note: ''
        };
      }
    }
  
    // 特定の日のデータを更新
    currentEntries[docKey] = currentEntries[docKey] || {
      day: parseInt(dayStr),
      checkIn: '00:00',
      checkOut: '00:00',
      task: '',
      note: ''
    };
    currentEntries[docKey][type] = timeStr;
  
    await setDoc(userDocRef, { entries: currentEntries }, { merge: true });
  
    alert(`${type === 'checkIn' ? '出勤' : '退勤'}時間が更新されました: ${timeStr}`);
  };
  


  return (
    <div>
      <h1>タイムトラッカー</h1>
      <button onClick={() => handleAttendanceUpdate('checkIn')}>出勤</button>
      <button onClick={() => handleAttendanceUpdate('checkOut')}>退勤</button>
      {checkInTime && <p>出勤時間: {checkInTime.toLocaleTimeString()}</p>}
      {checkOutTime && <p>退勤時間: {checkOutTime.toLocaleTimeString()}</p>}
      <GoToDetailPage />
    </div>
  );
};

export default TimeTracker;
