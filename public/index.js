document.addEventListener('DOMContentLoaded', function() {
  // DOM要素の取得
  const yearSelect = document.getElementById('year-select');
  const monthSelect = document.getElementById('month-select');
  const addTaskButton = document.getElementById('add-task-button');
  const newTaskInput = document.getElementById('new-task-input');
  const tbody = document.querySelector('#date-table tbody');

  // 現在の年を取得して年の選択肢を設定
  const currentYear = new Date().getFullYear();
  [currentYear - 1, currentYear, currentYear + 1].forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });

  // 月の選択肢を設定
  for (let month = 1; month <= 12; month++) {
    const option = document.createElement('option');
    option.value = month;
    option.textContent = `${month}月`;
    monthSelect.appendChild(option);
  };

  // 作業内容のプリセットを保持する配列
  let taskPresets = [''];

  // プリセット追加ボタンのイベントリスナー
  addTaskButton.addEventListener('click', function() {
    const newTask = newTaskInput.value.trim();
    if (newTask && !taskPresets.includes(newTask)) {
      taskPresets.push(newTask); // プリセット配列に追加
      newTaskInput.value = ''; // 入力フィールドをクリア
      updateAllTaskSelects(); // すべての作業内容選択肢を更新
    }
  });

  // 年または月が変更されたときにテーブルの日付を更新
  yearSelect.addEventListener('change', updateTableBasedOnYearAndMonth);
  monthSelect.addEventListener('change', updateTableBasedOnYearAndMonth);

  function updateTableBasedOnYearAndMonth() {
    const selectedYear = yearSelect.value;
    const selectedMonth = monthSelect.value - 1; // JavaScriptの月は0から始まるため
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    tbody.innerHTML = ''; // テーブルの内容をクリア

    for (let day = 1; day <= daysInMonth; day++) {
      const row = tbody.insertRow();
      const dateCell = row.insertCell(0);
      const startCell = row.insertCell(1);
      const endCell = row.insertCell(2);
      const workCell = row.insertCell(3);
      const noteCell = row.insertCell(4);

      dateCell.textContent = `${selectedMonth + 1}/${day}/${selectedYear}`;

      const startTimeInput = createTimeInput();
      startCell.appendChild(startTimeInput);

      const endTimeInput = createTimeInput();
      endCell.appendChild(endTimeInput);

      const taskSelect = createTaskSelect(taskPresets);
      workCell.appendChild(taskSelect);

      // 備考欄のドロップダウンを生成する新しい関数を呼び出し
      const noteSelect = createNoteSelect();
      noteCell.appendChild(noteSelect);
    }
  }

  // 作業内容選択肢を更新する関数
  function updateAllTaskSelects() {
    const allTaskSelects = document.querySelectorAll('.task-select');
    allTaskSelects.forEach(select => {
      const currentValue = select.value;
      select.innerHTML = ''; // 選択肢をクリア
      taskPresets.forEach(task => {
        const option = document.createElement('option');
        option.value = task;
        option.textContent = task;
        select.appendChild(option);
      });
      select.value = currentValue; // 以前の選択を復元
    });
  }

  // 時間入力フィールドを生成する関数
  function createTimeInput() {
    const input = document.createElement('input');
    input.type = 'time';
    return input;
  }

  // 作業内容選択フィールドを生成する関数
  function createTaskSelect(presets) {
    const select = document.createElement('select');
    select.classList.add('task-select');
    presets.forEach(task => {
      const option = document.createElement('option');
      option.value = task;
      option.textContent = task;
      select.appendChild(option);
    });
    return select;
  }

  // 備考欄のドロップダウンを生成する関数
  function createNoteSelect() {
    const select = document.createElement('select');
    select.classList.add('note-select');
    ['通常', '有給', '遅刻', '早退'].forEach(optionValue => {
      const option = document.createElement('option');
      option.value = optionValue;
      option.textContent = optionValue;
      select.appendChild(option);
    });
    return select;
  }

  // 初期テーブル生成
  updateTableBasedOnYearAndMonth();
});
