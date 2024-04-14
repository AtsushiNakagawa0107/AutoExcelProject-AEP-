import React, { useEffect,useState } from 'react';
import './AutoExcelApp.css';
import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { db } from "./firebaseConfig";
import { collection, addDoc, serverTimestamp, Timestamp, deleteDoc, doc, setDoc, orderBy, onSnapshot, query, QuerySnapshot, DocumentData, where, getDocs } from 'firebase/firestore';

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
// DateTableのpropsの型定義
interface DateTableProps {
  year: number;
  month: number;
  tasks: string[];
  entries: any[];
  setEntries: React.Dispatch<React.SetStateAction<any[]>>;
}

function DateTable({ year, month, tasks, entries, setEntries }: DateTableProps) {
  // 月が変更されたときのみ初期化を行う
  useEffect(() => {
    async function fetchData() {
      const q = query(collection(db, "attendance"), where("year", "==", year), where("month", "==", month));
      const docs = await getDocs(q);
      if (!docs.empty) {
        const data = docs.docs[0].data().entries;
        setEntries(data);
      } else {
        const daysInMonth = new Date(year, month, 0).getDate();
        const newEntries = Array.from({ length: daysInMonth }, (_, index) => ({
          day: index + 1,
          startTime: '',
          endTime: '',
          task: '',
          note: ''
        }));
        setEntries(newEntries);
      }
    }
    fetchData();
  }, [year, month, setEntries]);

  const handleChange = (index: number, field: string, value: string) => {
    const newEntries = [...entries];
    newEntries[index] = {...newEntries[index], [field]: value};
    setEntries(newEntries);
  };

  return (
    <table>
      <thead>
        <tr>
          <th>日付</th>
          <th>出勤</th>
          <th>退勤</th>
          <th>作業内容</th>
          <th>備考欄</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, index) => (
          <tr key={index}>
            <td>{`${month}月${entry.day}日`}</td>
            <td><input type="time" value={entry.startTime} onChange={(e) => handleChange(index, 'startTime', e.target.value)} /></td>
            <td><input type="time" value={entry.endTime} onChange={(e) => handleChange(index, 'endTime', e.target.value)} /></td>
            <td>
              <select value={entry.task} onChange={(e) => handleChange(index, 'task', e.target.value)}>
                {tasks.map((task, idx) => (
                  <option key={idx} value={task}>{task}</option>
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
          </tr>
        ))}
      </tbody>
    </table>
  );
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


  const deleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, "tasks", taskId));
  };

  const handleSave = async (entries: any) => {
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
    const q = query(collection(db, "tasks"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const loadedTasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        timestamp: doc.data().timestamp as Timestamp
      }));
      setTasks(loadedTasks);
    }, (error: Error) => console.log("タスクの読み込みに失敗しました：", error));
  }, []);


  return (
    <div className="container">
      <div className='header'>
        <h1>Auto Excel Project</h1>
        <LogoutButton />
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
      <DateTable year={year} month={month} tasks={tasks.map(task => task.name)} entries={entries} setEntries={setEntries} />
      <button className='submit-button'>送信</button>
      <button onClick={() => handleSave(entries)}>保存</button>
    </div>
  );
}

export default AutoExcelApp;
