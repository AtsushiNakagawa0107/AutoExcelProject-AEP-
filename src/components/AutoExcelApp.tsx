import React, { useEffect,useState } from 'react';
import './AutoExcelApp.scss';
import axios from 'axios';
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp, Timestamp, deleteDoc, doc, setDoc, orderBy, onSnapshot, query, getDoc} from 'firebase/firestore';
import { useNavigate, useLocation, Location } from 'react-router-dom';
import { formatFirestoreTime } from './utils';
import  useUserFlag  from './UseUserFlag';
import { formatFirestoreText } from './taskDisplay';
import LoadingModal from './LoadingModal';

const LogoutButton = () => {
  const handleLogout = () => {
    signOut(auth).then(() => {
      console.log("ログアウトしました");
    }).catch((error) => {
      console.error("ログアウトエラー", error);
    });
  };

  return (
    <button className='logeOut' onClick={handleLogout}>ログアウト</button>
  )
}

function TaskInput({userId}: {userId: string}) {
  const [newTask, setNewTask] = useState<string>('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newTask.trim() !== '') {
        addDoc(collection(db, "users", userId, "tasks"), {
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
    <form className='task-input-form' onSubmit={handleSubmit}>
      <input
        className='task-input'
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="新しい作業内容"
      />
      <button className='input-button' type="submit">追加</button>
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
  checkIn: string | null;
  checkOut: string | null;
  task: string;
  note: string;
  year: number;
  month: number;
}


function DateTable({ year, month, tasks, entries, setEntries, userId }: DateTableProps &
  {dataUpdated: boolean; setDataUpdated: React.Dispatch<React.SetStateAction<boolean>> }) {
  const navigate = useNavigate();

  const handleEdit = (entryIndex: number) => {
    const entry = entries[entryIndex];
    console.log(entry.day - 1)
    if (!entry) {
      console.error('Entry data is undefined');
      return;
    }
    navigate(`/edit-time-check/${userId}/${year}/${month}/${entry.day}`, {state: {
      entry: {
        year: year,
        month: month,
        day: entry.day,
        checkIn: entry.checkIn,
        checkOut: entry.checkOut
      }
    } });
  }

  const getDayWithWeekday = (day: number) => {
    const date = new Date(year, month - 1, day);
    const weekday = date.toLocaleDateString('js-JP', {weekday: 'short'});
    return `${month}/${day} (${weekday})`;
  };

  const isWeekday = (day: number) => {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }


  useEffect(() => {
    if (!userId || !year || !month) {
      console.error("必要なパラメータがありません");
      return;
    }
  
    const adjustedMonth = month.toString().padStart(2, '0');
    const attendanceDocRef = doc(db, "users", userId, "attendance", `${year}-${adjustedMonth}`);
    
    const unsubscribe = onSnapshot(attendanceDocRef, (docSnapshot) => {
      if (!docSnapshot.exists()) {
        console.error("ドキュメントが存在しません");
        setEntries([]);
        return;
      }

      const data = docSnapshot.data();
      const entriesFromDb = data.entries || {};

      const sortedKeys = Object.keys(entriesFromDb).sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime();
      });

      const newEntries = sortedKeys.map((key) => {
        const entry = entriesFromDb[key];
        return {
          day: parseInt(key.split('-')[2]),
          ...entry
        };
      });

      setEntries(newEntries);
    });

    return () => unsubscribe();
  }, [userId, year, month, db]);


  const handleChange = async (index: number, field: string, value: string) => {
    const newEntries = [...entries];
    const entry = newEntries[index];


    if (!entry) {
      console.error("選択されたエントリが存在しません。");
      return;
    }

    entry[field] = value === '選択' ? '' : value;
    setEntries(newEntries);

    const yearStr = entry.year.toString().padStart(4, '0');
    const monthStr = entry.month.toString().padStart(2, '0');
    const dayStr = entry.day.toString().padStart(2, '0');

    if (!entry.year || !entry.month || !entry.day) {
      console.error("日付のデータが存在しません");
      return;
    }

    const entryKey = `${yearStr}-${monthStr}-${dayStr}`;
    const userDocRef = doc(db, "users", userId, "attendance", `${yearStr}-${monthStr}`);

    try {
      const docSnapshot = await getDoc(userDocRef);
      if (docSnapshot.exists()) {
        const entriesData = docSnapshot.data().entries || {};
        entriesData[entryKey] = {...entriesData[entryKey], [field]: value === '選択' ? '' : value};
        await setDoc(userDocRef, {entries: entriesData}, {merge: true});
        console.log("タスクが更新されました。");
      }
    } catch (error) {
      console.error("タスクの更新中にエラーが発生しました", error);
    }
  };

  return (
    <table className='main-table'>
      <thead>
        <tr className='item-name'>
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
          const formattedTask = formatFirestoreText(entry.task);
          const formattedNote = formatFirestoreText(entry.note);
          const dayString = getDayWithWeekday(entry.day);
          const weekendClass = isWeekday(entry.day) ? 'weekend' : '';
          console.log(formattedTask)
          return (
            <tr key={index} className= {weekendClass}>
              <td className='date'>{dayString}</td>
              <td className='checkIn-time'>{formattedStartTime}</td>
              <td className='checkOut-time'>{formattedEndTime}</td>
              <td className='select-td'>
                <select className='task-select' value={entry.task || ''} onChange={(e) => handleChange(index, 'task', e.target.value)}>
                  <option value="" disabled>選択</option>
                  {tasks.map((task, taskIdx) => (
                    <option value={task} key={taskIdx}>{task}</option>
                  ))}
                </select>
                {entry.task && <div className='db-value'>{formattedTask}</div>}
              </td>
              <td className='select-td'>
                <select className='note-select' value={entry.note || ''} onChange={(e) => handleChange(index, 'note', e.target.value)}>
                  <option value="通常">通常</option>
                  <option value="有給">有給</option>
                  <option value="遅刻">遅刻</option>
                  <option value="早退">早退</option>
                  <option value="夏季休暇">夏季休暇</option>
                </select>
                {entry.note && <div className='db-value'>{formattedNote}</div>}
              </td>
              <td>
                <button onClick={() => handleEdit(index)}>修正</button>
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
      <button className='backButton' onClick={backToPage}>戻る</button>
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
  const selectExcelFileFlag = useUserFlag();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [modalMessage, setModalMessage] = useState('送信中...');


  const deleteTask = async (taskId: string) => {
    if(userId) {
      await deleteDoc(doc(db, "users", userId, "tasks", taskId));
    } else {
      console.error("userId is undefined");
    }
  };

  const createDefaultEntriesForMonth = async (userId: string, year: number, month: number) => {
    const docRef = doc(db, "users", userId, "attendance", `${year}-${month.toString().padStart(2, '0')}`);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      const daysInMonth = new Date(year, month, 0).getDate();
      const defaultEntries: Record<string, any> = {};

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        defaultEntries[dateStr] = {
          month: month.toString().padStart(2, '0'),
          year: year,
          day: day,
          checkIn: '00:00',
          checkOut: '00:00',
          task: '',
          note: '',
        };
      }
      await setDoc(docRef, { entries: defaultEntries });
    }
  };

  const handleMonthChange = (newMonth: number) => {
    setMonth(newMonth);
    if (userId) {
      createDefaultEntriesForMonth(userId, year, newMonth)
    } else {
      console.error("UserId is undefined");
    }
  }

  const apiUrl = 'https://autoexcelproject-aep.onrender.com/process_data/';

  async function sendDataToAPI(data:any) {
    try {
      const response = await axios.post(apiUrl, data);
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Request Failed:', error);
      throw error;
    }
  }

  const request_body = {
    select_excel_file_flag: selectExcelFileFlag,
    preset_list: [],
    target_year: year.toString(),
    target_month: month.toString().padStart(2, '0'),
    working_date_list: entries.map(entry => entry.checkIn),
    closing_date_list: entries.map(entry => entry.checkOut),
    work_details_list: entries.map(entry => entry.task),
    remarks_column_list: entries.map(entry => entry.note)
  };

  const handleSaveExcel = async () => {
    setLoading(true);
    setProgress(0);
    setCompleted(false);
    setModalMessage('送信中...');

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 10;
        return next <= 90 ? next : prev;
      });
    }, 1000);


    try {
      const result = await sendDataToAPI(request_body)
      console.log('Excel data processed:', result);
      setCompleted(true);
      setProgress(100);
      setModalMessage('送信完了しました');
    } catch (error) {
      console.error('Failed to process Excel data:', error);
      setCompleted(true);
      setModalMessage('送信に失敗しました');
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 3000);
    }
  };


  useEffect(() => {
    if (userId) {
      const tasksQuery = query(collection(db, "users", userId, "tasks"), orderBy("timestamp"));
      const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
        const loadedTasks = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name, timestamp: doc.data().timestamp}));
        setTasks(loadedTasks);
      })
      return () => unsubscribe();
    }
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
        <h1 className='header-title'>詳細画面</h1>
        <div className='header-button'>
          <LogoutButton />
          <BackToPage />
        </div>
      </div>
      <div className="inputTask__box">
        <div className='date-select-box'>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))}>
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select value={month} onChange={(e) => handleMonthChange(parseInt(e.target.value, 10))} >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}月</option>
            ))}
          </select>
        </div>
        <TaskInput userId={userId!} />
      </div>
      <table className='task-list'>
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
      <button onClick={handleSaveExcel} className='submit-button' disabled={loading}>
        {loading ? '処理中' : '送信'}
      </button>
      <LoadingModal loading={loading} progress={progress} completed={completed} message={modalMessage}/>
    </div>
  );
}

export default AutoExcelApp;