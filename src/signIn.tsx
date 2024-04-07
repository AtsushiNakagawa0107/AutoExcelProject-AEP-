import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from "./firebaseConfig";
import './signIn.css';


function SignInWithGoogle() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        console.log(user);
      }).catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className='signIn__button'>
      <h1 className='title'>Auto Excel Project</h1>
      <button onClick={signInWithGoogle}>Googleでログイン</button>
    </div>
  );
}

export default SignInWithGoogle;
