import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';

const auth = getAuth();

export const login = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email.trim(), password);
};

export const logout = async () => {
  return signOut(auth);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};