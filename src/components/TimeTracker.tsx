import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useTime } from './TimeContext';
import GoToDetailPage from './GoToDetailPage';
import './TimeTracker.scss';

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
  const [currentTime, setCurrentTime] = useState(new Date());

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('js-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  const handleAttendanceUpdate = async (type: 'checkIn' | 'checkOut') => {
    const now = new Date();
    const yearStr = now.getFullYear().toString();
    const monthStr = (now.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = now.getDate().toString().padStart(2, '0');
    const timeStr = formatTime(now);
  
    const docKey = `${yearStr}-${monthStr}-${dayStr}`; // 日付を年月日形式で統一
    const userDocRef = doc(db, "users", userId, "attendance", `${yearStr}-${monthStr}`);
    const docSnapshot = await getDoc(userDocRef);
  
    let currentEntries = docSnapshot.exists() && docSnapshot.data().entries ? docSnapshot.data().entries : {};

    if (!docSnapshot.exists() || Object.keys(currentEntries).length === 0) {
      const daysInMonth = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();
      currentEntries = {};
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${yearStr}-${monthStr}-${day.toString().padStart(2, '0')}`;
        currentEntries[dateStr] = {
          year: yearStr,
          month: monthStr,
          day: day,
          checkIn: '00:00',
          checkOut: '00:00',
          task: '',
          note: ''
        };
      }
    }

    // 特定の日のデータを更新
    if (!currentEntries[docKey]) {
      currentEntries[docKey] = {
        year: parseInt(yearStr),
        month: parseInt(monthStr),
        day: parseInt(dayStr),
        checkIn: '00:00',
        checkOut: '00:00',
        task: '',
        note: ''
      };
    }

    // 更新処理: 既存の値を保持しつつ、指定された type (checkIn または checkOut) を更新
    currentEntries[docKey][type] = timeStr;


    try {
      await setDoc(userDocRef, { entries: currentEntries }, { merge: true });
      alert(`${type === 'checkIn' ? '出勤' : '退勤'}時間が更新されました: ${timeStr}`);
    } catch (error) {
      console.error('Error updating document:', error);
      alert('データの更新中にエラーが発生しました')
    }
  };



  return (
    <div className='timeTracker'>
      <h1 className='timeTracker-title'>{formattedTime}</h1>
      <div className='timeTracker-button'>
        <button className='checkIn-button' onClick={() => handleAttendanceUpdate('checkIn')}>
          <img src="/image/出勤.png" alt="出勤" />
          <p>出勤</p>
        </button>
        <button className='checkOut-button' onClick={() => handleAttendanceUpdate('checkOut')}>
          <img src="/image/退勤.png" alt="退勤" />
          <p>退勤</p>
        </button>
      </div>
      <GoToDetailPage />
    </div>
  );
};

export default TimeTracker;