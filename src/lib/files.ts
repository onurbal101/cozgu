export type LocalFile = {
  id: string
  title: string
  text: string
  updatedAt: string
}

const DATABASE_NAME = 'kripsiyon-local-v1'
const STORE_NAME = 'files'
const DATABASE_VERSION = 1

let databasePromise: Promise<IDBDatabase> | null = null

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise
  databasePromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB kullanılamıyor'))
      return
    }
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Dosya alanı açılamadı'))
  })
  return databasePromise
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Dosya işlemi başarısız'))
  })
}

export async function listLocalFiles(): Promise<LocalFile[]> {
  const database = await openDatabase()
  const transaction = database.transaction(STORE_NAME, 'readonly')
  const files = await requestResult(transaction.objectStore(STORE_NAME).getAll())
  return files.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function saveLocalFile(file: LocalFile): Promise<void> {
  const database = await openDatabase()
  const transaction = database.transaction(STORE_NAME, 'readwrite')
  await requestResult(transaction.objectStore(STORE_NAME).put(file))
}

export async function deleteLocalFile(id: string): Promise<void> {
  const database = await openDatabase()
  const transaction = database.transaction(STORE_NAME, 'readwrite')
  await requestResult(transaction.objectStore(STORE_NAME).delete(id))
}

export async function createLocalFile(index: number): Promise<LocalFile> {
  const file: LocalFile = {
    id: globalThis.crypto?.randomUUID?.() ?? `file-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: `Metin ${String(index).padStart(2, '0')}`,
    text: '',
    updatedAt: new Date().toISOString(),
  }
  await saveLocalFile(file)
  return file
}
