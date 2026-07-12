import { doc } from 'firebase/firestore'
import { db } from './firebase'

export const versionRef = doc(db, 'settings', 'app')