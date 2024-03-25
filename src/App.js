import React, { useState } from 'react';
import './App.css';

function TaskInput({ onAdd }) {
  const [newTask, setNewTask] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onAdd(newTask);
    setNewTask('');
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

function DateTable({ year, month, tasks }) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const rows = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return (
      <tr key={day}>
        <td>{`${year}-${month}-${day}`}</td>
        <td><input type="time" /></td>
        <td><input type="time" /></td>
        <td>
          <select>
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
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [tasks, setTasks] = useState(['']);

  const addTask = (newTask) => {
    if (newTask && !tasks.includes(newTask)) {
      setTasks([...tasks, newTask]);
    }
  };

  return (
    <div className="container">
      <h1>Auto Excel Project</h1>
      <TaskInput onAdd={addTask} />
      <div>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{m}月</option>
          ))}
        </select>
      </div>
      <DateTable year={year} month={month} tasks={tasks} />
      <button className='submit-button'>送信</button>
    </div>
  );
}

export default AutoExcelApp;
