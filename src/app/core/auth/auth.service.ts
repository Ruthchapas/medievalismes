import { computed, Injectable, signal } from '@angular/core';
import { getFirebase } from './firebase-client';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

const SIGNED_IN_HINT = 'medievalismes:signed-in';
const EMAIL_FOR_LINK = 'medievalismes:email-for-signin';

// Brand colors the avatar can take. All of them carry the light "calç" text at 4.5:1 or more.
const AVATAR_COLORS = ['var(--color-blau)', 'var(--color-terracota-text)', '#55623a', '#7a3f22'];

function remember(key: string, value: string | null): void {
  try {
    value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value);
  } catch {
    // Storage disabled: the user simply has to type their email again.
  }
}

function recall(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

const MESSAGES: Record<string, string> = {
  'auth/invalid-email': "Aquest correu no sembla vàlid.",
  'auth/network-request-failed': 'No hi ha connexió. Torna-ho a provar.',
  'auth/too-many-requests': 'Massa intents. Espera una estona i torna-ho a provar.',
  'auth/popup-blocked': "El navegador ha bloquejat la finestra de Google. Permet-la i torna-ho a provar.",
  'auth/expired-action-code': "Aquest enllaç ha caducat. Demana'n un de nou.",
  'auth/invalid-action-code': "Aquest enllaç ja s'ha fet servir o no és vàlid. Demana'n un de nou.",
  'auth/requires-recent-login': 'Per fer-ho, torna a iniciar la sessió i prova-ho de nou.',
};
const IGNORED = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];

/**
 * Sign-in with Google or an emailed link (no passwords). Optional: without a
 * session the app works as always and keeps everything on the device.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<AppUser | null>(null);
  readonly user = this._user.asReadonly();
  /** False until we know whether someone is signed in. */
  readonly ready = signal(false);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  /** A sign-in link was opened on a device that doesn't know the email. */
  readonly needsEmailConfirm = signal(false);
  /** The link has been sent to this address. */
  readonly linkSentTo = signal<string | null>(null);

  readonly name = computed(() => {
    const user = this._user();
    if (!user) return null;
    return user.displayName?.trim() || user.email?.split('@')[0] || null;
  });

  readonly initials = computed(() => {
    const name = this.name();
    if (!name) return '';
    const words = name.split(/[\s._-]+/).filter(Boolean);
    const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : name.slice(0, 2);
    return letters.toUpperCase();
  });

  /** A stable color per person, so the avatar doesn't change between visits. */
  readonly avatarColor = computed(() => {
    const uid = this._user()?.uid;
    if (!uid) return null;
    let hash = 0;
    for (const char of uid) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
  });

  private started?: Promise<void>;

  /** Called at startup. Only loads Firebase if someone is likely to be signed in. */
  init(): void {
    const comingFromLink = typeof location !== 'undefined' && location.search.includes('oobCode=');
    if (comingFromLink || recall(SIGNED_IN_HINT)) void this.start();
    else this.ready.set(true);
  }

  /** Loads Firebase and starts listening to the session. Safe to call many times. */
  start(): Promise<void> {
    return (this.started ??= this.connect());
  }

  private async connect(): Promise<void> {
    try {
      const { auth, authApi } = await getFirebase();

      const first = new Promise<void>((resolve) => {
        authApi.onAuthStateChanged(auth, (user) => {
          this._user.set(user ? { uid: user.uid, email: user.email, displayName: user.displayName } : null);
          remember(SIGNED_IN_HINT, user ? '1' : null);
          resolve();
        });
      });
      await first;

      if (authApi.isSignInWithEmailLink(auth, location.href)) {
        const email = recall(EMAIL_FOR_LINK);
        if (email) await this.finishEmailLink(email);
        else this.needsEmailConfirm.set(true);
      }
    } catch {
      this.error.set("No s'ha pogut connectar amb el servei d'accés.");
    } finally {
      this.ready.set(true);
    }
  }

  async signInWithGoogle(): Promise<void> {
    await this.run(async () => {
      const { auth, authApi } = await getFirebase();
      await authApi.signInWithPopup(auth, new authApi.GoogleAuthProvider());
    });
  }

  async sendEmailLink(email: string): Promise<void> {
    const address = email.trim();
    await this.run(async () => {
      const { auth, authApi } = await getFirebase();
      await authApi.sendSignInLinkToEmail(auth, address, {
        url: `${location.origin}/perfil`,
        handleCodeInApp: true,
      });
      remember(EMAIL_FOR_LINK, address);
      this.linkSentTo.set(address);
    });
  }

  /** Finishes a sign-in link opened on a device that didn't ask for it. */
  async confirmEmailLink(email: string): Promise<void> {
    await this.finishEmailLink(email.trim());
  }

  private async finishEmailLink(email: string): Promise<void> {
    await this.run(async () => {
      const { auth, authApi } = await getFirebase();
      await authApi.signInWithEmailLink(auth, email, location.href);
      remember(EMAIL_FOR_LINK, null);
      this.needsEmailConfirm.set(false);
      // The link carries one-time codes; no reason to leave them in the address bar.
      history.replaceState(null, '', location.pathname);
    });
  }

  async updateName(name: string): Promise<void> {
    await this.run(async () => {
      const { auth, authApi } = await getFirebase();
      if (!auth.currentUser) return;
      await authApi.updateProfile(auth.currentUser, { displayName: name.trim() || null });
      const user = auth.currentUser;
      this._user.set({ uid: user.uid, email: user.email, displayName: user.displayName });
    });
  }

  async signOut(): Promise<void> {
    await this.run(async () => {
      const { auth, authApi } = await getFirebase();
      await authApi.signOut(auth);
    });
  }

  /** Deletes the account. `beforeDelete` clears the person's data while they can still reach it. */
  async deleteAccount(beforeDelete: () => Promise<void>): Promise<boolean> {
    let deleted = false;
    await this.run(async () => {
      const { auth, authApi } = await getFirebase();
      if (!auth.currentUser) return;
      await beforeDelete();
      await authApi.deleteUser(auth.currentUser);
      deleted = true;
    });
    return deleted;
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    try {
      await action();
    } catch (error) {
      const code = (error as { code?: string }).code ?? '';
      if (!IGNORED.includes(code)) this.error.set(MESSAGES[code] ?? "Alguna cosa ha anat malament. Torna-ho a provar.");
    } finally {
      this.busy.set(false);
    }
  }
}
