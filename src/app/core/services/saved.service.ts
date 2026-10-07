import { Injectable, signal } from '@angular/core';

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

@Injectable({ providedIn: 'root' })
export class SavedService {
  private readonly _slugs = signal<Set<string>>(readStorage());
  readonly slugs = this._slugs.asReadonly();

  isSaved(slug: string): boolean {
    return this._slugs().has(slug);
  }

  toggle(slug: string): boolean {
    const next = new Set(this._slugs());
    const nowSaved = !next.has(slug);
    nowSaved ? next.add(slug) : next.delete(slug);
    this._slugs.set(next);
    writeStorage(next);
    return nowSaved;
  }
}
