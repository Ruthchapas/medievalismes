// Identifies the Firebase project. None of this is secret: the web API key only
// names the project. What protects the data is firestore.rules and the list of
// authorized domains in the Firebase console.
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAA6e5UQbpKu8aLQ5ODRv0VAHjFMfl0RJs',
  authDomain: 'medievalismes-654c1.firebaseapp.com',
  projectId: 'medievalismes-654c1',
  storageBucket: 'medievalismes-654c1.firebasestorage.app',
  messagingSenderId: '461962078947',
  appId: '1:461962078947:web:cc462e8eee5f7288c133d6',
} as const;

// Shown on the privacy page. Swap it for a project address (e.g. info@medievalismes.cat) when there is one.
export const CONTACT_EMAIL = 'ruthchavar@gmail.com';
