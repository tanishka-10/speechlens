import React from 'react';
import { Button } from 'react-native-paper';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

export default function LogoutButton({ navigation }) {
  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace('Auth');
  };

  return <Button mode="contained" onPress={handleLogout}  color="#1a263f"  buttonColor="#1a263f" textColor="white" >Logout</Button>;
};