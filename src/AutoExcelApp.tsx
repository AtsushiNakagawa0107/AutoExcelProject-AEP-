import React, { useEffect,useState } from 'react';
import './AutoExcelApp.css';
import { database } from './firebaseConfig';
import { ref, push, set, serverTimestamp, onValue, } from 'firebase/database';
import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";

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
interface TaskInputProps {
  onAdd: (newTask: string) => void;
}

function TaskInput({ onAdd }: TaskInputProps) {
  const [newTask, setNewTask] = useState<string>('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newTask.trim() !== '') {
        // タスクをデータベースに追加
        const tasksRef = ref(database, 'tasks');
        const newTaskRef = push(tasksRef);
        set(newTaskRef, {
            name: newTask,
            timestamp: serverTimestamp() // タスクの追加時刻
        })
        .then(() => {
            console.log('新しいタスクが追加されました');
            setNewTask('');
        })
        .catch((error) => {
            console.error('タスクの追加に失敗しました', error);
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
}

function DateTable({ year, month, tasks }: DateTableProps) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const rows = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return (
      <tr key={day}>
        <td>{`${month}月${day}日`}</td>
        <td><input type="time" /></td>
        <td><input type="time" /></td>
        <td>
          <select>
            <option value="">選択してください</option>
            {tasks.map((task, index) => (
              <option key={index} value={task}>{task}</option>
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
    );
  });

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
      <tbody>{rows}</tbody>
    </table>
  );
}

function AutoExcelApp() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [tasks, setTasks] = useState<string[]>(['']);

  const addTask = (newTask: string) => {
    if (newTask && !tasks.includes(newTask)) {
      setTasks([...tasks, newTask]);
    }
  };

  useEffect(() => {
    const tasksRef = ref(database, 'tasks');
    onValue(tasksRef, (snapshot) => {
      const tasksData = snapshot.val();
      const loadedTasks = [];
      for (const key in tasksData) {
        loadedTasks.push(tasksData[key].name);
      }
      setTasks(loadedTasks);
    });
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
        <TaskInput onAdd={addTask} />
      </div>
      <div className='year'>{`${year}年`}</div>
      <DateTable year={year} month={month} tasks={tasks} />
      <button className='submit-button'>送信</button>
    </div>
  );
}

export default AutoExcelApp;
