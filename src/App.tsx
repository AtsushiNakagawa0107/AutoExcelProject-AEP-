import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebaseConfig";
import SignInWithGoogle from './components/signIn';
import TimeTracker from './components/TimeTracker';
import AutoExcelApp from './components/AutoExcelApp';
import GoToDetailPage from './components/GoToDetailPage';
import { TimeProvider } from './components/TimeContext';
import EditTimePage from './components/EditTimePage';
import EditTimeFieldPage from './components/EditTimeFieldPage';
import './App.scss';
function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  if (!currentUser) {
    return <SignInWithGoogle />;
  }

  return (
      <div>
        <h1 className='main-title'>勤怠管理アプリ</h1>
        <TimeProvider>
          <Routes>
            <Route path="/detail" element={<GoToDetailPage />} />
            <Route path="/" element={<TimeTracker userId={currentUser.uid} />} />
            <Route path="/auto-excel-app" element={<AutoExcelApp />} />
            <Route path='/edit-time-check/:userId/:year/:month/:day' element={<EditTimePage />}/>
            <Route path='/edit-time/:userId/:year/:month/:day/checkin' element={<EditTimeFieldPage field='checkIn'/>}/>
            <Route path='/edit-time/:userId/:year/:month/:day/checkout' element={<EditTimeFieldPage field='checkOut'/>}/>
          </Routes>
        </TimeProvider>
      </div>
  );
}

export default App;