// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { db } from "../firebaseConfig";
// import { doc, getDoc, setDoc } from 'firebase/firestore';


// const EditTimePage: React.FC = () => {
//   const { userId, year, month } = useParams<{ userId: string, year: string, month: string }>();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const entry = location.state?.entry as Entry | undefined;

//   const [checkIn, setCheckIn] = useState<string>('');
//   const [checkOut, setCheckOut] = useState<string>('');

//   // 現在のエントリの値をフォームに設定
//   useEffect(() => {
//     if (entry) {
//       setCheckIn(entry.checkIn);
//       setCheckOut(entry.checkOut);
//     }
//   }, [entry]);

//   // 保存処理
//   const handleSave = async () => {
//     if (!userId || !year || !month || !entry) {
//       console.error("Required fields are missing.");
//       return;
//     }

//     const entryKey = `${year.padStart(2, '0')}-${month.padStart(2, '0')}-${entry.day.toString().padStart(2, '0')}`;

//     const userDocRef = doc(db, "users", userId, "attendance", `${year}-${month.padStart(2, '0')}`);
//     try {
//       const docSnapshot = await getDoc(userDocRef);
//       let entriesData = docSnapshot.exists() ? docSnapshot.data().entries || {} : {};
  
//       const existingEntry = entriesData[entryKey] || {};
//       const updatedEntry = {
//         ...existingEntry,
//         checkIn: checkIn || existingEntry.checkIn,
//         checkOut: checkOut || existingEntry.checkOut,
//         task: entry.task ?? existingEntry.task, // undefined なら既存のデータを保持
//         note: entry.note ?? existingEntry.note  // undefined なら既存のデータを保持
//       };
  
//       entriesData[entryKey] = updatedEntry; // 直接キーに対して更新
  
//       await setDoc(userDocRef, { entries: entriesData }, { merge: true });
//       console.log("Document updated successfully");
//       navigate('/auto-excel-app', { state: { dateUpdated: true } });
//     } catch (error) {
//       console.error("Error updating document:", error);
//     }
//   };

//   return (
//     <div>
//       <h2>時間を修正: {entry?.day}日</h2>
//       <div>
//         <div>
//           <p>出勤</p>
//           <input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
//         </div>
//         <div>
//           <p>退勤</p>
//           <input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
//         </div>
//       </div>
//       <button onClick={handleSave}>保存</button>
//     </div>
//   );
// };

// export default EditTimePage;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from "../firebaseConfig";

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
      console.log(`Year: ${year}, Month: ${month}, Day: ${day}`);
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
    <div>
      <h2>時間を修正: {entry.day}日</h2>
      <div>
        <p>現在のチェックイン: {entry.checkIn}</p>
        <p>現在のチェックアウト: {entry.checkOut}</p>
        <button onClick={() => navigate(`/edit-time/${userId}/${year}/${month}/${day}/checkin`, { state: { entry } })}>チェックイン修正</button>
        <button onClick={() => navigate(`/edit-time/${userId}/${year}/${month}/${day}/checkout`, { state: { entry } })}>チェックアウト修正</button>
      </div>
    </div>
  );
};

export default EditTimePage;
