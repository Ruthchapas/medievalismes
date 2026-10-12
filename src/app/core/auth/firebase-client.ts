import { FIREBASE_CONFIG } from './firebase.config';

/**
 * Firebase is only downloaded when someone actually needs it (a returning
 * signed-in user, the Perfil page, a sign-in link), so visitors who just browse
 * the map never pay for it.
 */
async function load() {
  const [{ initializeApp }, authApi, firestoreApi] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore'),
  ]);
  const app = initializeApp(FIREBASE_CONFIG);
  return {
    auth: authApi.getAuth(app),
    db: firestoreApi.getFirestore(app),
    authApi,
    firestoreApi,
  };
}

let client: ReturnType<typeof load> | undefined;

export function getFirebase() {
  return (client ??= load());
}
