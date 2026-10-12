import { effect, inject, Injectable, signal, untracked } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { getFirebase } from '../auth/firebase-client';

const STORAGE_KEY = 'medievalismes:saved';

function readStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function writeStorage(slugs: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...slugs]));
  } catch {
    // Private browsing / storage disabled — saved state just won't persist.
  }
}

const sameSet = (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every((slug) => b.has(slug));

/**
 * Places a visitor has saved. They always live on the device; while someone is
 * signed in they are also kept in their own Firestore document (users/{uid}),
 * which is what makes them follow the person between devices.
 */
@Injectable({ providedIn: 'root' })
export class SavedService {
  private readonly auth = inject(AuthService);

  private readonly _slugs = signal<Set<string>>(readStorage());
  readonly slugs = this._slugs.asReadonly();

  private uid: string | null = null;
  private stopListening?: () => void;
  /** Bumped on every change of session so a slow response from a previous one is ignored. */
  private session = 0;

  constructor() {
    effect(() => {
      const uid = this.auth.user()?.uid ?? null;
      untracked(() => this.onSessionChange(uid));
    });
  }

  isSaved(slug: string): boolean {
    return this._slugs().has(slug);
  }

  toggle(slug: string): boolean {
    const next = new Set(this._slugs());
    const nowSaved = !next.has(slug);
    nowSaved ? next.add(slug) : next.delete(slug);
    this.apply(next);
    void this.push();
    return nowSaved;
  }

  /** Writes the current list to the account (used after a failed account deletion). */
  async pushNow(): Promise<void> {
    await this.push();
  }

  /** Removes the account's document. */
  async deleteRemote(): Promise<void> {
    if (!this.uid) return;
    const { db, firestoreApi } = await getFirebase();
    this.stopListening?.();
    this.stopListening = undefined;
    await firestoreApi.deleteDoc(firestoreApi.doc(db, 'users', this.uid));
  }

  private apply(slugs: Set<string>): void {
    this._slugs.set(slugs);
    writeStorage(slugs);
  }

  private onSessionChange(uid: string | null): void {
    if (uid === this.uid) return;
    const wasSignedIn = this.uid !== null;
    this.stopListening?.();
    this.stopListening = undefined;
    this.uid = uid;
    const session = ++this.session;

    if (uid) {
      void this.startSync(uid, session);
    } else if (wasSignedIn) {
      // Signing out of a shared phone or tablet shouldn't leave the person's places behind.
      this.apply(new Set());
    }
  }

  private async startSync(uid: string, session: number): Promise<void> {
    try {
      const { db, firestoreApi } = await getFirebase();
      if (session !== this.session) return;
      const ref = firestoreApi.doc(db, 'users', uid);
      let first = true;

      this.stopListening = firestoreApi.onSnapshot(
        ref,
        (snapshot) => {
          if (session !== this.session || snapshot.metadata.hasPendingWrites) return;
          const remote = new Set<string>((snapshot.data()?.['saved'] as string[] | undefined) ?? []);

          if (first) {
            // The first time on this device: what was saved before signing in joins the account.
            first = false;
            const merged = new Set([...remote, ...this._slugs()]);
            this.apply(merged);
            if (!sameSet(merged, remote)) void this.push();
          } else if (!sameSet(remote, this._slugs())) {
            this.apply(remote);
          }
        },
        () => {
          // Offline or not allowed: the device copy keeps working.
        },
      );
    } catch {
      // Firebase unreachable: carry on with the device copy.
    }
  }

  private async push(): Promise<void> {
    const uid = this.uid;
    if (!uid) return;
    try {
      const { db, firestoreApi } = await getFirebase();
      await firestoreApi.setDoc(firestoreApi.doc(db, 'users', uid), { saved: [...this._slugs()] });
    } catch {
      // Will be sent with the next change; the device copy is already up to date.
    }
  }
}
