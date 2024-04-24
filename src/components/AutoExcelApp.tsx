import React, { useEffect,useState } from 'react';
import './AutoExcelApp.css';
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp, Timestamp, deleteDoc, doc, setDoc, orderBy, onSnapshot, query, getDoc} from 'firebase/firestore';
import { useNavigate, useLocation, Location } from 'react-router-dom';

const LogoutButton = () => {
  const handleLogout = () => {
    signOut(auth).then(() => {
      console.log("ログアウトしました");
    }).catch((error) => {
      console.error("ログアウトエラー", error);
    });
  };

  return (
    <button onClick={handleLogout}>ログアウト</button>
  )
}

// TaskInputのpropsの型定義

function TaskInput() {
  const [newTask, setNewTask] = useState<string>('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newTask.trim() !== '') {
        addDoc(collection(db, "tasks"), {
          name: newTask,
          timestamp: serverTimestamp()
        })
        .then(() => {
          console.log('新しいタスクが追加されました');
          setNewTask('');
        })
        .catch((error) => {
          console.log('タスクの追加に失敗しました', error);
        });
    }
};

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="新しい作業内容"
      />
      <button type="submit">作業内容を追加</button>
    </form>
  );
}


// DateTableのpropsの型定義
interface DateTableProps {
  year: number;
  month: number;
  tasks: string[];
  entries: any[];
  setEntries: React.Dispatch<React.SetStateAction<any[]>>;
  userId: string;
}

interface Entry {
  day: number;
  checkIn: Date | string;
  checkOut: Date | string;
  task: string;
  note: string;
}

interface FirestoreTimeEntry {
  checkIn?: string | null;
  checkOut?: string | null;
}

function DateTable({ year, month, tasks, entries, setEntries, userId, dataUpdated, setDataUpdated }: DateTableProps &
  {dataUpdated: boolean; setDataUpdated: React.Dispatch<React.SetStateAction<boolean>> }) {
  const navigate = useNavigate();

  const handleEdit = (entryIndex: number) => {
    const entry = entries[entryIndex];
    console.log(entry)
    if (!entry) {
      console.error('Entry data is undefined');
      return;
    }
    navigate(`/edit-time/${userId}/${year}/${month}/${entry.day - 1}`, {state: {
      entry: {
        year: year,
        month: month,
        day: entry.day - 1,
        checkIn: entry.checkIn,
        checkOut: entry.checkOut
      }
    } });
  }

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      const attendanceDocRef = doc(db, "attendance", userId);
      try {
        const docSnapshot = await getDoc(attendanceDocRef);
        const data = docSnapshot.data() || {};
        const newEntries: Entry[] = [];
        const daysInMonth = new Date(year, month - 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const dayData = data[dateStr] || [];
          newEntries.push({
            day: day,
            checkIn: dayData.checkIn || '00:00',
            checkOut: dayData.checkOut || '00:00',
            task: dayData.task,
            note: dayData.note
          });
        }
        setEntries(newEntries);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, [year, month, userId, db, dataUpdated, setDataUpdated]);


  const handleChange = (index: number, field: string, value: string) => {
    const newEntries = [...entries];
    newEntries[index] = {...newEntries[index], [field]: value};
    setEntries(newEntries);
  };



  const formatFirestoreTime = (time: string | null): string => {
    console.log(time)
    if (!time) {
      return '00:00';
    }
    const [hours, minutes] = time.split(':').map((t) => t.padStart(2, '0'));
    return `${hours}:${minutes}`;
  };

  const [entry, setEntry] = useState<FirestoreTimeEntry | null>(null);

  const getFormattedTimesFromEntry = (entry: FirestoreTimeEntry): { formattedCheckIn: string; formattedCheckOut: string} => {
    const formattedCheckIn = entry.checkIn ? formatFirestoreTime(entry.checkIn) : '00:00';
    const formattedCheckOut = entry.checkOut ? formatFirestoreTime(entry.checkOut) : '00:00';
    console.log(formattedCheckIn)
    return { formattedCheckIn, formattedCheckOut };
  }

  let formattedCheckIn = '00:00';
  let formattedCheckOut = '00:00';

  if (entry) {
    const formattedTimes = getFormattedTimesFromEntry(entry);
    formattedCheckIn = formattedTimes.formattedCheckIn;
    formattedCheckOut = formattedTimes.formattedCheckOut;
  }



  return (
    <table>
      <thead>
        <tr>
          <th>日付</th>
          <th>出勤</th>
          <th>退勤</th>
          <th>作業内容</th>
          <th>備考欄</th>
          <th>修正</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, index) => {
          const formattedStartTime = formatFirestoreTime(entry.checkIn);
          const formattedEndTime = formatFirestoreTime(entry.checkOut);
          return (
            <tr key={index}>
              <td>{`${month}月${entry.day}日`}</td>
              <td>{formattedStartTime}</td>
              <td>{formattedEndTime}</td>
              <td>
                <select value={entry.task || ''} onChange={(e) => handleChange(index, 'task', e.target.value)}>
                  <option value="" disabled>選択してください</option>
                  {tasks.map((task, taskIdx) => (
                    <option value={task} key={taskIdx}>{task}</option>
                  ))}
                </select>
              </td>
              <td>
                <select>
                  <option value="通常">通常</option>
                  <option value="有給">有給</option>
                  <option value="遅刻">遅刻</option>
                  <option value="早退">早退</option>
                </select>
              </td>
              <td>
                <button onClick={() => handleEdit(entry.day)}>修正</button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  );
}

function BackToPage() {
  const navigate = useNavigate();
  const backToPage = () => {
    navigate('/');
  }
  return (
    <div>
      <button onClick={backToPage}>戻る</button>
    </div>
  )
}

interface Task {
  name: string;
  timestamp: Timestamp;
  id: string;
}

function AutoExcelApp() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | undefined>(auth.currentUser?.uid);
  const [dataUpdated, setDataUpdated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation() as Location & { state: LocationState };


  const deleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, "tasks", taskId));
  };

  const handleTableSave = async (entries: any) => {
    try {
      const docRef = doc(db, "attendance", `${year}-${month}`);
      await setDoc(docRef, { year, month, entries });
      alert("データが正常に保存されました。")
    } catch(error) {
      console.log("データの保存に失敗しました：", error);
      alert("データの保存に失敗しました。エラーを確認してください。");
    }
  };

  useEffect(() => {
    const tasksQuery = query(collection(db, "tasks"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const loadedTasks = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name, timestamp: doc.data().timestamp}));
      setTasks(loadedTasks);
    })
    return () => unsubscribe();
  }, []);

  interface LocationState {
    dateUpdated?: boolean;
  }

  useEffect(() => {
    if (location.state?.dataUpdated) {
      setDataUpdated(true);
      navigate(location.pathname, { state: {}, replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="container">
      <div className='header'>
        <h1>Auto Excel Project</h1>
        <LogoutButton />
        <BackToPage />
      </div>
      <div className="inputTask__box">
        <div>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))}>
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}月</option>
            ))}
          </select>
        </div>
        <TaskInput />
      </div>
      <table>
      <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.name}</td>
              <td>
                <button onClick={() => deleteTask(task.id)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='year'>{`${year}年`}</div>
      <DateTable year={year} month={month} tasks={tasks.map(task => task.name)} entries={entries} setEntries={setEntries} userId={userId!} setDataUpdated={setDataUpdated} dataUpdated={dataUpdated} />
      <button className='submit-button'>送信</button>
      <button onClick={() => handleTableSave(entries)}>保存</button>
    </div>
  );
}

export default AutoExcelApp;
