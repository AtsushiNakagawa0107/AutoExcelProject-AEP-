import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebaseConfig";
import SignInWithGoogle from './signIn';
import AutoExcelApp from './AutoExcelApp';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  if (!currentUser) {
    return <SignInWithGoogle />;
  }

  return <AutoExcelApp />;
}

export default App;
