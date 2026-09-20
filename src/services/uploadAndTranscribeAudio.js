import { functions } from '../services/firebase'; // ✅ import your initialized functions
import { httpsCallable } from 'firebase/functions';
const uploadAudioToFirebase = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob(); // Convert local file to blob
  
    const filename = `recordings/${Date.now()}.webm`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);
    return filename;
  };