import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode, SVGProps } from 'react'
import {
  allKeys,
  diacriticKeys,
  keyById,
  keyForCase,
  lowercaseKeys,
  lowercasePaletteKeys,
  specialKeys,
  uppercaseKeys,
  uppercasePaletteKeys,
  type KeyItem,
} from './data/keys'
import { applyDiacriticRepeated, countGraphemes, countLines, countWords, insertAtSelection, segmentGraphemes, type Selection } from './lib/editor'
import { createLocalFile, deleteLocalFile, listLocalFiles, saveLocalFile, type LocalFile } from './lib/files'
import { LANGUAGE_OPTIONS, translate, type LanguageId, type TranslationKey } from './i18n'
import { applyMenuScript, menuScriptLabel, type MenuScript } from './lib/menuScripts'
import { getDiacriticShortcut, getDiacriticShortcutCode } from './lib/shortcuts'

type Theme = 'light' | 'dark'
type ThemePreference = 'system' | Theme
type PaletteMode = 'uppercase' | 'lowercase' | 'special' | 'diacritic'
type PaletteFilter = 'all' | 'recent' | 'favorites'
type Normalisation = 'unchanged' | 'NFC' | 'NFD'
type SortDirection = 'az' | 'za'
type PalettePlacement = 'bottom' | 'top' | 'left' | 'right'
type MenuId = 'file' | 'edit' | 'view' | 'characters' | 'misc' | 'more'
type PrimaryMenuId = Exclude<MenuId, 'more'>
type DownloadFormat = 'txt' | 'md'

  const primaryMenuItems: Array<{ id: PrimaryMenuId; label: string }> = [
  { id: 'file', label: 'Dosya' },
  { id: 'edit', label: 'Düzenle' },
  { id: 'view', label: 'Görünüm' },
  { id: 'characters', label: 'Karakterler' },
  { id: 'misc', label: 'Diğer' },
]

type Snapshot = {
  text: string
  selection: Selection
}

type SelectionToolbarPosition = {
  open: boolean
  top: number
  left: number
  marksOpen: boolean
}

const DRAFT_PREFERENCES_KEY = 'kripsiyon-preferences-v2'
const MAX_RECENT = 10

function systemPrefersDark() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function storedThemePreference() {
  const preferences = readJson<{ themePreference?: ThemePreference; theme?: Theme }>(DRAFT_PREFERENCES_KEY, {})
  return preferences.themePreference ?? preferences.theme ?? 'system'
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private browsing can deny localStorage. IndexedDB remains the source of truth for files.
  }
}

function Icon({ name, size = 18, strokeWidth = 1.8, ...props }: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...props }
  switch (name) {
    case 'copy': return <svg {...common}><rect x="9" y="9" width="11" height="11" rx="1.5" /><path d="M5 15H4a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4.999 3h9A1.5 1.5 0 0 1 15.5 4.5v1" /></svg>
    case 'download': return <svg {...common}><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19.5h16" /></svg>
    case 'sun': return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>
    case 'moon': return <svg {...common}><path d="M20.8 15.6A8.5 8.5 0 0 1 8.4 3.2 8.6 8.6 0 1 0 20.8 15.6Z" /></svg>
    case 'undo': return <svg {...common}><path d="M9 7 4 12l5 5" /><path d="M4 12h9.5a6.5 6.5 0 0 1 6.5 6.5" /></svg>
    case 'redo': return <svg {...common}><path d="m15 7 5 5-5 5" /><path d="M20 12h-9.5A6.5 6.5 0 0 0 4 18.5" /></svg>
    case 'search': return <svg {...common}><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>
    case 'star': return <svg {...common}><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" /></svg>
    case 'clock': return <svg {...common}><circle cx="12" cy="12" r="8.8" /><path d="M12 7v5l3.5 2" /></svg>
    case 'plus': return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>
    case 'minus': return <svg {...common}><path d="M5 12h14" /></svg>
    case 'folder': return <svg {...common}><path d="M3.5 7.5h6l2-2h9v12.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" /><path d="M3.5 7.5h17" /></svg>
    case 'file': return <svg {...common}><path d="M6 3.5h8l4 4V20.5H6z" /><path d="M14 3.5v4h4" /></svg>
    case 'files': return <svg {...common}><path d="M5 5.5h10a2 2 0 0 1 2 2v11H7a2 2 0 0 1-2-2z" /><path d="M8 5.5V3h9a2 2 0 0 1 2 2v11h-2" /></svg>
    case 'trash': return <svg {...common}><path d="M4.5 7h15M9 3.5h6l1 3.5H8zM7 7l.8 13h8.4L17 7M10 10.5v6M14 10.5v6" /></svg>
    case 'check': return <svg {...common}><path d="m5 12 4.2 4.2L19 6.5" /></svg>
    case 'chevron': return <svg {...common}><path d="m7 9 5 5 5-5" /></svg>
    case 'close': return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>
    case 'sort': return <svg {...common}><path d="M7 5v14m0 0-3-3m3 3 3-3M17 19V5m0 0-3 3m3-3 3 3" /></svg>
    case 'bold': return <svg {...common}><path d="M7 5h5a3 3 0 0 1 0 6H7zm0 6h6a3.5 3.5 0 0 1 0 7H7z" /></svg>
    case 'italic': return <svg {...common}><path d="M10 5h8M6 19h8M14 5 10 19" /></svg>
    case 'text': return <svg {...common}><path d="M5 5h14M12 5v14M8 19h8" /></svg>
    case 'lines': return <svg {...common}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
    case 'keyboard': return <svg {...common}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M7 14h10" /></svg>
    default: return null
  }
}

type IconName = 'copy' | 'download' | 'sun' | 'moon' | 'undo' | 'redo' | 'search' | 'star' | 'clock' | 'plus' | 'minus' | 'folder' | 'file' | 'files' | 'trash' | 'check' | 'chevron' | 'close' | 'sort' | 'bold' | 'italic' | 'text' | 'lines' | 'keyboard'

const diacriticVisuals: Record<string, string> = {
  breve: '⌒',
  caron: 'ˇ',
  macron: '—',
  'dot-above': '•',
  'ring-above': '°',
  'vertical-line-above': '│',
  grave: '`',
  acute: '´',
  diaeresis: '¨',
  'diaeresis-below': '¨',
  'tie-above': '⌒',
  'dot-below': '•',
  'ring-below': '°',
  syllabic: 'ˌ',
  'macron-below': '—',
  'tie-below': '⌣',
}

function baseLetter(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[͜͡]/gu, '')
    .toLocaleLowerCase('tr-TR')
}

function codePoints(value: string) {
  return Array.from(value).map((character) => `U+${character.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`)
}

function sortKeys(keys: KeyItem[], direction: SortDirection) {
  return [...keys].sort((a, b) => {
    const result = a.label.localeCompare(b.label, 'tr-TR', { sensitivity: 'base' })
    return direction === 'az' ? result : -result
  })
}

function searchNormalise(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('tr-TR')
}

function keyMatchesQuery(key: KeyItem, query: string) {
  if (!query.trim()) return true
  const needle = searchNormalise(query.trim())
  if (needle.length === 1 && /^[a-zçğıöşü]$/u.test(needle)) {
    if (key.category !== 'standard') return false
    const firstIdPart = searchNormalise(key.id.split('-')[0] ?? '')
    const normalisedLabel = searchNormalise(key.label)
    return firstIdPart === needle || normalisedLabel === needle || normalisedLabel.startsWith(needle)
  }
  const fields = [key.label, ...(key.aliases ?? []), key.description ?? '']
  if (/^(u\+|0x)/iu.test(query.trim())) fields.push(...key.codePoints)
  return fields.some((field) => searchNormalise(field).includes(needle))
}

function keyCase(value: string): 'upper' | 'lower' | 'shared' {
  const letters = value.replace(/\p{M}/gu, '').replace(/[͜͡]/gu, '')
  if (!letters) return 'shared'
  if (letters === letters.toLocaleUpperCase('tr-TR') && letters !== letters.toLocaleLowerCase('tr-TR')) return 'upper'
  if (letters === letters.toLocaleLowerCase('tr-TR') && letters !== letters.toLocaleUpperCase('tr-TR')) return 'lower'
  return 'shared'
}

function measureWrappedLineCounts(text: string, width: number, font: string, wrap: boolean) {
  const logicalLines = text.split('\n')
  if (!wrap || width <= 0) return logicalLines.map(() => 1)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return logicalLines.map(() => 1)
  context.font = font
  return logicalLines.map((line) => {
    if (!line) return 1
    let rows = 1
    let currentWidth = 0
    for (const { segment } of segmentGraphemes(line)) {
      const segmentWidth = context.measureText(segment === '\t' ? '    ' : segment).width
      if (currentWidth > 0 && currentWidth + segmentWidth > width) {
        rows += 1
        currentWidth = segmentWidth
      } else {
        currentWidth += segmentWidth
      }
    }
    return rows
  })
}

function DiacriticGlyph({ keyItem }: { keyItem: KeyItem }) {
  const position = keyItem.position ?? 'above'
  return (
    <span className={`diacritic-glyph glyph-${keyItem.id} position-${position}`} aria-hidden="true">
      <span className="diacritic-diagram">
        <span className="dotted-circle">◌</span>
        <span className="visual-mark">{diacriticVisuals[keyItem.id] ?? '·'}</span>
      </span>
    </span>
  )
}

function KeyButton({ keyItem, selected, favorite, selectionMode, menuScript, showFavoriteMark = true, showShortcut = false, onInsert, onToggleSelection, onMouseDown }: { keyItem: KeyItem; selected: boolean; favorite: boolean; selectionMode: boolean; menuScript: MenuScript; showFavoriteMark?: boolean; showShortcut?: boolean; onInsert: (key: KeyItem, shiftKey?: boolean) => void; onToggleSelection: (key: KeyItem) => void; onMouseDown?: (event: ReactMouseEvent<HTMLElement>) => void }) {
  const onClick = (event: ReactMouseEvent<HTMLButtonElement>) => selectionMode ? onToggleSelection(keyItem) : onInsert(keyItem, event.shiftKey)
  const scriptText = (value: string) => applyMenuScript(value, menuScript)
  const label = `${scriptText(keyItem.category === 'standard' ? 'Standart harf' : 'Diyakritik')} ${keyItem.label}`
  const shortcut = showShortcut && keyItem.category === 'diacritic' ? getDiacriticShortcutCode(keyItem.id) : undefined
  const shortcutLabel = shortcut ? ` · ${scriptText('Kısayol')} ${shortcut}` : ''
  const selectionLabel = selectionMode ? ` ${scriptText(selected ? 'seçildi' : 'seçilmedi')}` : ''
  const detail = keyItem.description ? scriptText(keyItem.description) : keyItem.codePoints.join(' ')
  return (
    <button className={`key-button ${keyItem.category === 'diacritic' ? 'is-diacritic' : ''} ${selected ? 'is-selected' : ''} ${favorite && showFavoriteMark ? 'is-favorite' : ''} ${selectionMode ? 'is-selection-mode' : ''}`} type="button" data-key-id={keyItem.id} title={`${keyItem.label}${shortcut ? ` · ${shortcut}` : ''} · ${detail}`} aria-label={`${label}${shortcutLabel}${selectionLabel}`} aria-pressed={selectionMode ? selected : undefined} onMouseDown={onMouseDown} onClick={onClick}>
      {shortcut && <span className="key-shortcut" aria-hidden="true">{shortcut}</span>}
      {keyItem.category === 'diacritic' ? <DiacriticGlyph keyItem={keyItem} /> : <span>{keyItem.label}</span>}
      {!selectionMode && showFavoriteMark && favorite && <span className="key-favorite-mark" aria-label={scriptText('Sık kullanılan')}>★</span>}
      {selectionMode && <span className="selection-check"><Icon name="check" size={12} /></span>}
    </button>
  )
}

function formatFileDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function App() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const menuBarRef = useRef<HTMLDivElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const bootstrapStarted = useRef(false)
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => storedThemePreference())
  const [systemDark, setSystemDark] = useState(systemPrefersDark)
  const [language, setLanguage] = useState<LanguageId>(() => readJson<{ language?: LanguageId }>(DRAFT_PREFERENCES_KEY, {}).language ?? 'tr')
  const [files, setFiles] = useState<LocalFile[]>([])
  const [currentFileId, setCurrentFileId] = useState('')
  const [storageReady, setStorageReady] = useState(false)
  const [editor, setEditor] = useState<Snapshot>({ text: '', selection: { start: 0, end: 0 } })
  const [past, setPast] = useState<Snapshot[]>([])
  const [future, setFuture] = useState<Snapshot[]>([])
  const [normalisation, setNormalisation] = useState<Normalisation>('unchanged')
  const [paletteMode, setPaletteMode] = useState<PaletteMode>(() => readJson<{ paletteMode?: PaletteMode }>(DRAFT_PREFERENCES_KEY, {}).paletteMode ?? 'uppercase')
  const [paletteFilter, setPaletteFilter] = useState<PaletteFilter>(() => readJson<{ paletteFilter?: PaletteFilter }>(DRAFT_PREFERENCES_KEY, {}).paletteFilter ?? 'all')
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => readJson<{ sortDirection?: SortDirection }>(DRAFT_PREFERENCES_KEY, {}).sortDirection ?? 'az')
  const [palettePlacement, setPalettePlacement] = useState<PalettePlacement>(() => readJson<{ palettePlacement?: PalettePlacement }>(DRAFT_PREFERENCES_KEY, {}).palettePlacement ?? 'bottom')
  const [shortcutMode, setShortcutMode] = useState(() => readJson<{ shortcutMode?: boolean }>(DRAFT_PREFERENCES_KEY, {}).shortcutMode ?? false)
  const [capsMode, setCapsMode] = useState(() => readJson<{ capsMode?: boolean }>(DRAFT_PREFERENCES_KEY, {}).capsMode ?? false)
  const [shiftMode, setShiftMode] = useState(() => readJson<{ shiftMode?: boolean }>(DRAFT_PREFERENCES_KEY, {}).shiftMode ?? false)
  const [showLineNumbers, setShowLineNumbers] = useState(() => readJson<{ showLineNumbers?: boolean }>(DRAFT_PREFERENCES_KEY, {}).showLineNumbers ?? true)
  const [wrapText, setWrapText] = useState(() => readJson<{ wrapText?: boolean }>(DRAFT_PREFERENCES_KEY, {}).wrapText ?? true)
  const [lineNumberCounts, setLineNumberCounts] = useState<number[]>([1])
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [shiftPaletteMode, setShiftPaletteMode] = useState<PaletteMode | null>(null)
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<string[]>(() => readJson<{ recent?: string[] }>(DRAFT_PREFERENCES_KEY, {}).recent ?? [])
  const [favorites, setFavorites] = useState<string[]>(() => readJson<{ favorites?: string[] }>(DRAFT_PREFERENCES_KEY, {}).favorites ?? [])
  const [favoriteMode, setFavoriteMode] = useState(false)
  const [favoriteDraft, setFavoriteDraft] = useState<string[]>([])
  const [favoriteConfirmOpen, setFavoriteConfirmOpen] = useState(false)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [fileModalOpen, setFileModalOpen] = useState(false)
  const [selectedFileId, setSelectedFileId] = useState('')
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null)
  const [openSubmenu, setOpenSubmenu] = useState<'normalisation' | 'area' | 'shortcuts' | null>(null)
  const [shortcutInfoOpen, setShortcutInfoOpen] = useState<'shift' | 'caps' | 'qq' | null>(null)
  const shortcutInfoTimer = useRef<number | null>(null)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [scriptMenuOpen, setScriptMenuOpen] = useState(false)
  const [menuScript, setMenuScript] = useState<MenuScript>(() => readJson<{ menuScript?: MenuScript }>(DRAFT_PREFERENCES_KEY, {}).menuScript ?? 'native')
  const [visibleMenuCount, setVisibleMenuCount] = useState(() => typeof window !== 'undefined' && window.innerWidth < 480 ? 3 : primaryMenuItems.length)
  const [downloadModalOpen, setDownloadModalOpen] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>('txt')
  const [downloadName, setDownloadName] = useState('')
  const [selectionToolbar, setSelectionToolbar] = useState<SelectionToolbarPosition>({ open: false, top: 90, left: 32, marksOpen: false })
  // Counts belong to one open selection-toolbar session. A missing value is
  // intentionally different from zero: missing renders as blank, while zero
  // remains visible until the menu closes.
  const [diacriticCounts, setDiacriticCounts] = useState<Record<string, number>>({})

  const currentFile = files.find((file) => file.id === currentFileId)
  const theme: Theme = themePreference === 'system' ? (systemDark ? 'dark' : 'light') : themePreference
  const t = (key: TranslationKey) => applyMenuScript(translate(language, key), menuScript)
  const mt = t
  const scriptLabel = (value: MenuScript) => menuScriptLabel(language, value)

  const showShortcutInfo = (id: 'shift' | 'caps' | 'qq') => {
    if (shortcutInfoTimer.current !== null) window.clearTimeout(shortcutInfoTimer.current)
    shortcutInfoTimer.current = window.setTimeout(() => setShortcutInfoOpen(id), 650)
  }

  const hideShortcutInfo = () => {
    if (shortcutInfoTimer.current !== null) window.clearTimeout(shortcutInfoTimer.current)
    shortcutInfoTimer.current = null
    setShortcutInfoOpen(null)
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setSystemDark(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    const updateCapsLock = (event: Event) => {
      const keyboardEvent = event instanceof KeyboardEvent ? event : undefined
      const nextCaps = keyboardEvent?.getModifierState?.('CapsLock') ?? false
      setCapsLockOn(nextCaps)
      if (!nextCaps) {
        setShiftPaletteMode(null)
      } else if (capsMode && nextCaps && !capsLockOn) {
        setPaletteFilter('all')
        setPaletteMode('uppercase')
      }
    }
    window.addEventListener('keydown', updateCapsLock)
    window.addEventListener('keyup', updateCapsLock)
    window.addEventListener('blur', updateCapsLock)
    return () => {
      window.removeEventListener('keydown', updateCapsLock)
      window.removeEventListener('keyup', updateCapsLock)
      window.removeEventListener('blur', updateCapsLock)
    }
  }, [capsMode, capsLockOn])

  useEffect(() => {
    if (!shiftMode) return undefined
    const down = (event: KeyboardEvent) => {
      if (event.key !== 'Shift' || shiftPaletteMode) return
      setShiftPaletteMode(paletteMode)
      setPaletteFilter('all')
      setPaletteMode('uppercase')
    }
    const up = (event: KeyboardEvent) => {
      if (event.key !== 'Shift' || !shiftPaletteMode) return
      setPaletteFilter('all')
      setPaletteMode(shiftPaletteMode)
      setShiftPaletteMode(null)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [shiftMode, shiftPaletteMode, paletteMode])

  useEffect(() => {
    if (!storageReady) return
    writeJson(DRAFT_PREFERENCES_KEY, { themePreference, language, menuScript, recent, favorites, paletteMode, paletteFilter, sortDirection, palettePlacement, shortcutMode, capsMode, shiftMode, showLineNumbers, wrapText, currentFileId })
  }, [themePreference, language, menuScript, recent, favorites, paletteMode, paletteFilter, sortDirection, palettePlacement, shortcutMode, capsMode, shiftMode, showLineNumbers, wrapText, currentFileId, storageReady])

  useEffect(() => {
    if (bootstrapStarted.current) return
    bootstrapStarted.current = true
    const preferences = readJson<{ currentFileId?: string }>(DRAFT_PREFERENCES_KEY, {})
    listLocalFiles()
      .then(async (storedFiles) => {
        const nextFiles = storedFiles.length > 0 ? storedFiles : [await createLocalFile(1)]
        const selected = nextFiles.find((file) => file.id === preferences.currentFileId) ?? nextFiles[0]
        setFiles(nextFiles)
        setCurrentFileId(selected.id)
        setEditor({ text: selected.text, selection: { start: selected.text.length, end: selected.text.length } })
        setStorageReady(true)
      })
      .catch(() => {
        const fallback: LocalFile = { id: 'memory-file', title: 'Metin 01', text: '', updatedAt: new Date().toISOString() }
        setFiles([fallback])
        setCurrentFileId(fallback.id)
        setStorageReady(true)
      })
  }, [])

  useEffect(() => {
    if (!storageReady || !currentFileId) return
    const timer = window.setTimeout(() => {
      const updated: LocalFile = { id: currentFileId, title: currentFile?.title ?? 'Metin', text: editor.text, updatedAt: new Date().toISOString() }
      saveLocalFile(updated).then(() => setFiles((items) => items.map((file) => file.id === updated.id ? updated : file))).catch(() => undefined)
    }, 180)
    return () => window.clearTimeout(timer)
  }, [currentFileId, currentFile?.title, editor.text, storageReady])

  useEffect(() => {
    if (import.meta.env.PROD && 'serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  }, [])

  useEffect(() => {
    if (document.activeElement === textareaRef.current) textareaRef.current?.setSelectionRange(editor.selection.start, editor.selection.end)
  }, [editor])

  useEffect(() => {
    requestAnimationFrame(syncLineNumbers)
  }, [editor.text, showLineNumbers, wrapText])

  useEffect(() => {
    if (!openMenu) return undefined
    const closeMenu = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (!target?.closest('[data-menu-root]')) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('pointerdown', closeMenu)
    return () => document.removeEventListener('pointerdown', closeMenu)
  }, [openMenu])

  useEffect(() => {
    if (!themeMenuOpen && !languageMenuOpen && !scriptMenuOpen) return undefined
    const closeSelectors = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (!target?.closest('[data-topbar-menu]')) {
        setThemeMenuOpen(false)
        setLanguageMenuOpen(false)
        setScriptMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', closeSelectors)
    return () => document.removeEventListener('pointerdown', closeSelectors)
  }, [themeMenuOpen, languageMenuOpen, scriptMenuOpen])

  useLayoutEffect(() => {
    const menuBar = menuBarRef.current
    if (!menuBar) return undefined
    const measure = () => {
      const probe = menuBar.querySelector<HTMLElement>('.menu-size-probe')
      if (!probe) return
      const items = Array.from(probe.querySelectorAll<HTMLElement>('[data-menu-size]'))
      const widths = items.map((item) => item.getBoundingClientRect().width)
      const overflow = probe.querySelector<HTMLElement>('[data-menu-overflow]')?.getBoundingClientRect().width ?? 40
      const historyWidth = menuBar.querySelector<HTMLElement>('.history-actions')?.getBoundingClientRect().width ?? 0
      const available = Math.min(Math.max(0, menuBar.getBoundingClientRect().width - historyWidth - 2), window.innerWidth - 32)
      const gap = 2
      let used = 0
      let fit = 0
      for (const width of widths) {
        if (used + width + (fit ? gap : 0) > available) break
        used += width + (fit ? gap : 0)
        fit += 1
      }
      if (fit < widths.length) {
        used = 0
        fit = 0
        for (const width of widths) {
          const next = used + width + (fit ? gap : 0)
          if (next + overflow + gap > available) break
          used = next
          fit += 1
        }
        // Keep the overflow control itself as the final menu item. When there
        // is not enough room, always leave one primary item for it to collect.
        fit = Math.max(0, fit)
      }
      const nextCount = available < widths.reduce((sum, width, index) => sum + width + (index ? gap : 0), 0) ? fit : widths.length
      setVisibleMenuCount((current) => current === nextCount ? current : nextCount)
    }
    measure()
    const firstFrame = requestAnimationFrame(measure)
    const secondFrame = requestAnimationFrame(() => requestAnimationFrame(measure))
    const fontReady = document.fonts?.ready.then(measure)
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : undefined
    observer?.observe(menuBar)
    return () => {
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
      void fontReady
      observer?.disconnect()
    }
  }, [language, menuScript])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea || !showLineNumbers) {
      setLineNumberCounts([1])
      return undefined
    }
    const measure = () => {
      const computed = getComputedStyle(textarea)
      const padding = Number.parseFloat(computed.paddingLeft) + Number.parseFloat(computed.paddingRight)
      const width = Math.max(1, textarea.clientWidth - padding)
      const lineHeight = Number.parseFloat(computed.lineHeight)
      const paddingTop = Number.parseFloat(computed.paddingTop) + Number.parseFloat(computed.borderTopWidth)
      const paddingBottom = Number.parseFloat(computed.paddingBottom) + Number.parseFloat(computed.borderBottomWidth)
      if (lineNumbersRef.current) {
        if (Number.isFinite(lineHeight)) lineNumbersRef.current.style.setProperty('--editor-line-height', `${lineHeight}px`)
        if (Number.isFinite(paddingTop)) lineNumbersRef.current.style.setProperty('--editor-padding-top', `${paddingTop}px`)
        if (Number.isFinite(paddingBottom)) lineNumbersRef.current.style.setProperty('--editor-padding-bottom', `${paddingBottom}px`)
      }
      setLineNumberCounts(measureWrappedLineCounts(editor.text, width, computed.font, wrapText))
      syncLineNumbers()
    }
    measure()
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : undefined
    observer?.observe(textarea)
    return () => observer?.disconnect()
  }, [editor.text, showLineNumbers, wrapText])

  const commitEdit = (next: Snapshot, previous = editor) => {
    if (next.text === previous.text && next.selection.start === previous.selection.start && next.selection.end === previous.selection.end) return
    setPast((items) => [...items, previous])
    setFuture([])
    setEditor(next)
  }

  const readEditorSnapshot = (): Snapshot => {
    const textarea = textareaRef.current
    return textarea ? { text: textarea.value, selection: { start: textarea.selectionStart, end: textarea.selectionEnd } } : editor
  }

  const restoreEditorFocus = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.focus({ preventScroll: true })
    textarea.setSelectionRange(editor.selection.start, editor.selection.end)
  }

  const keepEditorFocus = (event: ReactMouseEvent<HTMLElement>) => {
    if (event.currentTarget.tagName !== 'INPUT' && event.currentTarget.tagName !== 'SELECT') event.preventDefault()
    restoreEditorFocus()
  }

  const syncLineNumbers = () => {
    if (lineNumbersRef.current && textareaRef.current) lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
  }

  const computeToolbarPosition = (selection: Selection, text = editor.text): Pick<SelectionToolbarPosition, 'top' | 'left'> => {
    const textarea = textareaRef.current
    const sheet = sheetRef.current
    if (!textarea || !sheet) return { top: 72, left: 30 }
    const textareaRect = textarea.getBoundingClientRect()
    const sheetRect = sheet.getBoundingClientRect()
    const computed = getComputedStyle(textarea)
    const lineHeight = Number.parseFloat(computed.lineHeight) || 34
    const before = text.slice(0, selection.start)
    const line = before.split('\n').length - 1
    const lineText = before.split('\n').at(-1) ?? ''
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (context) context.font = computed.font
    const textWidth = context?.measureText(lineText).width ?? 0
    const maxLeft = Math.max(16, sheetRect.width - 360)
    const selectionTop = textareaRect.top - sheetRect.top + line * lineHeight - textarea.scrollTop
    const selectionLeft = textareaRect.left - sheetRect.left + Math.min(textWidth, Math.max(18, textarea.clientWidth - 330))
    return {
      top: Math.max(18, Math.min(sheetRect.height - 86, selectionTop + lineHeight + 8)),
      left: Math.max(16, Math.min(maxLeft, selectionLeft)),
    }
  }

  const updateSelection = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    const nextSelection = { start: textarea.selectionStart, end: textarea.selectionEnd }
    setEditor((current) => ({ ...current, selection: nextSelection }))
    if (nextSelection.start !== nextSelection.end) {
      setSelectionToolbar((current) => ({ ...current, open: true, ...computeToolbarPosition(nextSelection) }))
    }
  }

  const closeSelectionToolbar = () => {
    setDiacriticCounts({})
    setSelectionToolbar({ open: false, top: selectionToolbar.top, left: selectionToolbar.left, marksOpen: false })
  }

  const onTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    commitEdit({ text: event.target.value, selection: { start: event.target.selectionStart, end: event.target.selectionEnd } })
    closeSelectionToolbar()
  }

  const onTextScroll = () => {
    syncLineNumbers()
    updateSelection()
  }

  const onTextMouseDown = () => {
    if (selectionToolbar.open) closeSelectionToolbar()
  }

  const onTextClick = () => {
    const textarea = textareaRef.current
    if (textarea && textarea.selectionStart === textarea.selectionEnd) closeSelectionToolbar()
    updateSelection()
  }

  const onTextKeyUp = () => {
    updateSelection()
    if (textareaRef.current?.selectionStart === textareaRef.current?.selectionEnd) closeSelectionToolbar()
  }

  const remember = (key: KeyItem) => setRecent((items) => [key.id, ...items.filter((id) => id !== key.id)].slice(0, MAX_RECENT))

  const effectiveCase = (shiftKey = false): 'upper' | 'lower' => {
    const caps = capsMode && capsLockOn
    const shift = shiftMode && shiftKey
    return shift !== caps ? 'upper' : 'lower'
  }

  const resolvePaletteKey = (key: KeyItem, shiftKey = false) => {
    if (key.category === 'diacritic') return key
    const caseBehaviourActive = (capsMode && capsLockOn) || (shiftMode && shiftKey)
    if (!caseBehaviourActive) return key
    return keyForCase(key, effectiveCase(shiftKey) === 'upper' ? 'upper' : 'lower')
  }

  const insertKey = (key: KeyItem, shiftKey = false) => {
    const resolvedKey = resolvePaletteKey(key, shiftKey)
    const current = readEditorSnapshot()
    const rawNext = resolvedKey.category === 'diacritic' ? applyDiacriticRepeated(current.text, current.selection, resolvedKey.insert) : insertAtSelection(current.text, current.selection, resolvedKey.insert)
    const nextSelection = resolvedKey.category === 'diacritic' && current.selection.start !== current.selection.end
      ? { start: current.selection.start, end: rawNext.selection.end }
      : rawNext.selection
    const next = { text: rawNext.text, selection: nextSelection }
    commitEdit(next, current)
    remember(resolvedKey)
    if (resolvedKey.category === 'diacritic' && selectionToolbar.open) {
      setSelectionToolbar((currentToolbar) => ({ ...currentToolbar, ...computeToolbarPosition(nextSelection, next.text) }))
    }
    requestAnimationFrame(() => {
      textareaRef.current?.focus({ preventScroll: true })
      textareaRef.current?.setSelectionRange(nextSelection.start, nextSelection.end)
    })
  }

  const renameCurrentFile = (event: ChangeEvent<HTMLInputElement>) => {
    const title = event.target.value
    setFiles((items) => items.map((file) => file.id === currentFileId ? { ...file, title, updatedAt: new Date().toISOString() } : file))
    const file = files.find((item) => item.id === currentFileId)
    if (file) saveLocalFile({ ...file, title, updatedAt: new Date().toISOString() }).catch(() => undefined)
  }

  const shortcutTransform = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    const caps = event.getModifierState?.('CapsLock') ?? false
    if (caps !== capsLockOn) {
      setCapsLockOn(caps)
      if (capsMode && caps) {
        setPaletteFilter('all')
        setPaletteMode('uppercase')
      }
    }
    if (!shortcutMode || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return

    const textarea = textareaRef.current
    if (!textarea || textarea.selectionStart !== textarea.selectionEnd) return
    const current = readEditorSnapshot()
    const cursor = textarea.selectionStart
    if (cursor < 1) return

    const shortcutKey = event.key.toLocaleLowerCase('en-US')
    const prefix = current.text.slice(cursor - 1, cursor)
    const diacritic = getDiacriticShortcut(`${prefix}${shortcutKey}`, keyById)
    if (diacritic) {
      const beforeShortcut = current.text.slice(0, cursor - 1)
      const target = segmentGraphemes(beforeShortcut).at(-1)
      if (!target || /\s/u.test(target.segment)) return

      event.preventDefault()
      const targetEnd = target.index + target.segment.length
      const nextText = `${beforeShortcut.slice(0, target.index)}${target.segment}${diacritic.insert}${beforeShortcut.slice(targetEnd)}${current.text.slice(cursor)}`
      const nextCursor = targetEnd + diacritic.insert.length
      commitEdit({ text: nextText, selection: { start: nextCursor, end: nextCursor } }, current)
      remember(diacritic)
      requestAnimationFrame(() => {
        textareaRef.current?.focus({ preventScroll: true })
        textareaRef.current?.setSelectionRange(nextCursor, nextCursor)
      })
      return
    }

    if (!['q', 'w', 'x'].includes(shortcutKey) || prefix.toLocaleLowerCase('en-US') !== shortcutKey) return

    const beforeShortcut = current.text.slice(0, cursor - 1)
    const target = segmentGraphemes(beforeShortcut).at(-1)
    if (!target) return
    const targetCase = keyCase(target.segment)
    const targetList = targetCase === 'upper' ? uppercaseKeys : targetCase === 'lower' ? lowercaseKeys : (effectiveCase() === 'upper' ? uppercaseKeys : lowercaseKeys)
    const variants = sortKeys(targetList.filter((key) => baseLetter(key.label) === baseLetter(target.segment)), 'az')
    const variantIndex = shortcutKey === 'q' ? 0 : shortcutKey === 'w' ? 1 : 2
    const variant = variants[variantIndex]
    if (!variant) return

    event.preventDefault()
    const targetEnd = target.index + target.segment.length
    const nextText = `${beforeShortcut.slice(0, target.index)}${variant.insert}${beforeShortcut.slice(targetEnd)}${current.text.slice(cursor)}`
    const nextCursor = target.index + variant.insert.length
    commitEdit({ text: nextText, selection: { start: nextCursor, end: nextCursor } }, current)
    remember(variant)
    requestAnimationFrame(() => {
      textareaRef.current?.focus({ preventScroll: true })
      textareaRef.current?.setSelectionRange(nextCursor, nextCursor)
    })
  }

  const undo = () => {
    const previous = past.at(-1)
    if (!previous) return
    setPast((items) => items.slice(0, -1))
    setFuture((items) => [editor, ...items])
    setEditor(previous)
  }

  const redo = () => {
    const next = future[0]
    if (!next) return
    setFuture((items) => items.slice(1))
    setPast((items) => [...items, editor])
    setEditor(next)
  }

  const copy = async () => {
    if (!editor.text) return
    try {
      await navigator.clipboard.writeText(editor.text)
    } catch {
      textareaRef.current?.focus()
      textareaRef.current?.select()
    }
  }

  const download = () => {
    const format = downloadFormat
    const extension = format === 'md' ? 'md' : 'txt'
    const type = format === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8'
    const blob = new Blob([editor.text], { type })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${downloadName.trim() || currentFile?.title || 'cozgu'}.${extension}`
    anchor.click()
    URL.revokeObjectURL(url)
    setDownloadModalOpen(false)
  }

  const openDownload = () => {
    setDownloadName(currentFile?.title ?? 'Metin')
    setOpenMenu(null)
    setDownloadModalOpen(true)
  }

  const confirmClearText = () => {
    commitEdit({ text: '', selection: { start: 0, end: 0 } })
    setClearConfirmOpen(false)
    closeSelectionToolbar()
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  const newFile = async () => {
    const created = await createLocalFile(files.length + 1).catch(() => ({ id: `memory-${Date.now()}`, title: `Metin ${String(files.length + 1).padStart(2, '0')}`, text: '', updatedAt: new Date().toISOString() }))
    setFiles((items) => [created, ...items])
    setCurrentFileId(created.id)
    setEditor({ text: '', selection: { start: 0, end: 0 } })
    setPast([])
    setFuture([])
    setSelectedFileId(created.id)
    setFileModalOpen(false)
  }

  const selectFile = async (file: LocalFile) => {
    if (currentFile && currentFile.id !== file.id) await saveLocalFile({ ...currentFile, text: editor.text, updatedAt: new Date().toISOString() }).catch(() => undefined)
    setFiles((items) => items.map((item) => item.id === currentFile?.id ? { ...item, text: editor.text } : item))
    setCurrentFileId(file.id)
    setEditor({ text: file.text, selection: { start: file.text.length, end: file.text.length } })
    setPast([])
    setFuture([])
    setSelectedFileId(file.id)
  }

  const openFileModal = () => {
    setSelectedFileId(currentFileId)
    setDeleteFileId(null)
    setOpenMenu(null)
    setFileModalOpen(true)
  }

  const confirmOpenSelectedFile = async () => {
    const selected = files.find((file) => file.id === selectedFileId)
    if (!selected) return
    await selectFile(selected)
    setFileModalOpen(false)
  }

  const requestDeleteFile = () => {
    if (!selectedFileId) return
    setDeleteFileId(selectedFileId)
  }

  const confirmDeleteFile = async () => {
    if (!deleteFileId) return
    const deletingCurrent = deleteFileId === currentFileId
    await deleteLocalFile(deleteFileId).catch(() => undefined)
    const remaining = files.filter((file) => file.id !== deleteFileId)
    if (remaining.length === 0) {
      const replacement = await createLocalFile(1).catch(() => ({ id: `memory-${Date.now()}`, title: 'Metin 01', text: '', updatedAt: new Date().toISOString() }))
      setFiles([replacement])
      setSelectedFileId(replacement.id)
      if (deletingCurrent) {
        setCurrentFileId(replacement.id)
        setEditor({ text: replacement.text, selection: { start: 0, end: 0 } })
      }
    } else {
      setFiles(remaining)
      if (deletingCurrent) {
        const replacement = remaining[0]
        setCurrentFileId(replacement.id)
        setEditor({ text: replacement.text, selection: { start: replacement.text.length, end: replacement.text.length } })
        setPast([])
        setFuture([])
      }
      setSelectedFileId(deletingCurrent ? remaining[0].id : selectedFileId === deleteFileId ? remaining[0].id : selectedFileId)
    }
    setDeleteFileId(null)
  }

  const changeNormalisation = (value: Normalisation) => {
    setNormalisation(value)
    if (value === 'unchanged') return
    const nextText = editor.text.normalize(value)
    commitEdit({ text: nextText, selection: { start: nextText.length, end: nextText.length } })
  }

  const selectedText = editor.text.slice(editor.selection.start, editor.selection.end)
  const selectedSegments = useMemo(() => segmentGraphemes(selectedText), [selectedText])
  const selectedBases = useMemo(() => Array.from(new Set(selectedSegments.filter(({ segment }) => !/\s/u.test(segment)).map(({ segment }) => baseLetter(segment)).filter(Boolean))), [selectedSegments])
  const selectedBase = selectedBases.length === 1 ? selectedBases[0] : ''
  const selectionVariants = useMemo(() => {
    if (!selectedBase) return []
    const selectedSegment = selectedSegments.find(({ segment }) => !/\s/u.test(segment))?.segment ?? ''
    const isSingleLetter = Array.from(selectedBase).length === 1 && /\p{L}/u.test(selectedSegment)
    const regularVariants: KeyItem[] = isSingleLetter
      ? [
        { id: `regular-${selectedBase}-upper`, category: 'standard', label: selectedBase.toLocaleUpperCase('tr-TR'), insert: selectedBase.toLocaleUpperCase('tr-TR'), codePoints: codePoints(selectedBase.toLocaleUpperCase('tr-TR')) },
        { id: `regular-${selectedBase}-lower`, category: 'standard', label: selectedBase.toLocaleLowerCase('tr-TR'), insert: selectedBase.toLocaleLowerCase('tr-TR'), codePoints: codePoints(selectedBase.toLocaleLowerCase('tr-TR')) },
      ]
      : []
    const modifiedVariants: KeyItem[] = []
    uppercaseKeys.filter((key) => baseLetter(key.label) === selectedBase).forEach((upper) => {
      modifiedVariants.push(upper)
      const lower = keyForCase(upper, 'lower')
      if (lower.id !== upper.id) modifiedVariants.push(lower)
    })
    return [...regularVariants, ...modifiedVariants]
  }, [selectedBase, selectedSegments])

  const selectedVariantId = useMemo(() => {
    const nonWhitespace = selectedSegments.filter(({ segment }) => !/\s/u.test(segment)).map(({ segment }) => segment)
    if (!nonWhitespace.length || nonWhitespace.some((segment) => segment !== nonWhitespace[0])) return ''
    return selectionVariants.find((key) => key.insert === nonWhitespace[0])?.id ?? ''
  }, [selectedSegments, selectionVariants])
  const selectionHasMultipleWords = /\s/gu.test(selectedText.trim())
  const selectionHasMultipleCharacters = selectedSegments.filter(({ segment }) => !/\s/u.test(segment)).length > 1

  const transformGrapheme = (segment: string, transform: 'upper' | 'lower' | 'variant', variant?: KeyItem) => {
    if (/\s/u.test(segment)) return segment
    if (transform === 'upper') return segment.toLocaleUpperCase('tr-TR')
    if (transform === 'lower') return segment.toLocaleLowerCase('tr-TR')
    return variant?.insert ?? segment
  }

  const transformSelection = (transform: 'upper' | 'lower' | 'title' | 'variant', variant?: KeyItem) => {
    const current = readEditorSnapshot()
    const currentSelectedText = current.text.slice(current.selection.start, current.selection.end)
    if (!currentSelectedText) return
    const replacement = transform === 'title'
      ? currentSelectedText.replace(/\S+/gu, (word) => `${word.slice(0, 1).toLocaleUpperCase('tr-TR')}${word.slice(1).toLocaleLowerCase('tr-TR')}`)
      : segmentGraphemes(currentSelectedText).map(({ segment }) => transformGrapheme(segment, transform, variant)).join('')
    const nextText = `${current.text.slice(0, current.selection.start)}${replacement}${current.text.slice(current.selection.end)}`
    const nextSelection = { start: current.selection.start, end: current.selection.start + replacement.length }
    commitEdit({ text: nextText, selection: nextSelection }, current)
    setSelectionToolbar((currentToolbar) => ({ ...currentToolbar, open: true, ...computeToolbarPosition(nextSelection, nextText) }))
    requestAnimationFrame(() => {
      textareaRef.current?.focus({ preventScroll: true })
      textareaRef.current?.setSelectionRange(nextSelection.start, nextSelection.end)
    })
  }

  const toggleSelectionMarks = () => {
    if (selectionToolbar.marksOpen) {
      setDiacriticCounts({})
      setSelectionToolbar((current) => ({ ...current, marksOpen: false }))
      return
    }
    setDiacriticCounts({})
    setSelectionToolbar((current) => ({ ...current, marksOpen: true }))
  }

  const changeDiacriticCount = (key: KeyItem, delta: number) => {
    setDiacriticCounts((counts) => {
      const current = counts[key.id]
      const next = Math.max(0, (current ?? 0) + delta)
      return { ...counts, [key.id]: next }
    })
    restoreEditorFocus()
  }

  const insertToolbarMark = (key: KeyItem, repeat = diacriticCounts[key.id] ?? 1) => {
    if (repeat <= 0) return
    const current = readEditorSnapshot()
    const next = applyDiacriticRepeated(current.text, current.selection, key.insert, repeat)
    if (next.text === current.text) return
    const nextSelection = current.selection.start !== current.selection.end
      ? { start: current.selection.start, end: next.selection.end }
      : next.selection
    commitEdit({ text: next.text, selection: nextSelection }, current)
    remember(key)
    setSelectionToolbar((current) => ({ ...current, open: true, marksOpen: true, ...computeToolbarPosition(nextSelection, next.text) }))
    requestAnimationFrame(() => {
      textareaRef.current?.focus({ preventScroll: true })
      textareaRef.current?.setSelectionRange(nextSelection.start, nextSelection.end)
    })
  }

  const filterAndSort = (keys: KeyItem[]) => sortKeys(keys.filter((key) => keyMatchesQuery(key, query)), sortDirection)

  const recentKeys = useMemo(() => filterAndSort(recent.map((id) => keyById.get(id)).filter((key): key is KeyItem => Boolean(key))), [query, recent, sortDirection])
  const favoriteKeys = useMemo(() => filterAndSort(favorites.map((id) => keyById.get(id)).filter((key): key is KeyItem => Boolean(key))), [favorites, query, sortDirection])
  const regularKeys = useMemo(() => {
    if (paletteMode === 'diacritic') return filterAndSort(diacriticKeys)
    if (paletteMode === 'uppercase') return filterAndSort(uppercasePaletteKeys)
    if (paletteMode === 'lowercase') return filterAndSort(lowercasePaletteKeys)
    return filterAndSort(specialKeys)
  }, [paletteMode, query, sortDirection])
  const searchKeys = useMemo(() => filterAndSort(allKeys), [query, sortDirection])
  const sortDisabled = paletteFilter === 'all' && paletteMode === 'diacritic'

  const toggleFavoriteSelection = (key: KeyItem) => setFavoriteDraft((items) => items.includes(key.id) ? items.filter((id) => id !== key.id) : [...items, key.id])
  const beginFavoriteMode = () => {
    setFavoriteDraft(favorites)
    setFavoriteMode(true)
  }
  const cancelFavoriteMode = () => {
    setFavoriteMode(false)
    setFavoriteDraft([])
    setFavoriteConfirmOpen(false)
  }
  const confirmFavoriteMode = () => {
    if (favoriteDraft.length === favorites.length && favoriteDraft.every((id) => favorites.includes(id))) {
      cancelFavoriteMode()
      return
    }
    setFavoriteConfirmOpen(true)
  }
  const saveFavoriteMode = () => {
    setFavorites(favoriteDraft)
    cancelFavoriteMode()
  }
  const favoriteAdditions = favoriteDraft.map((id) => keyById.get(id)).filter((key): key is KeyItem => key !== undefined).filter((key) => !favorites.includes(key.id))
  const favoriteRemovals = favorites.map((id) => keyById.get(id)).filter((key): key is KeyItem => key !== undefined).filter((key) => !favoriteDraft.includes(key.id))

  const renderKeys = (keys: KeyItem[], selectionMode = false, showFavoriteMark = true) => (
    <div className="keys-grid">
      {keys.map((key) => <KeyButton key={key.id} keyItem={key} selected={selectionMode ? favoriteDraft.includes(key.id) : false} favorite={favorites.includes(key.id)} selectionMode={selectionMode} menuScript={menuScript} showFavoriteMark={showFavoriteMark} showShortcut={shortcutMode} onInsert={insertKey} onToggleSelection={toggleFavoriteSelection} onMouseDown={keepEditorFocus} />)}
      {keys.length === 0 && <p className="empty-keys">{t('noMatches')}</p>}
    </div>
  )

  const renderSelectionDiacritic = (key: KeyItem) => {
    const count = diacriticCounts[key.id]
    const repeat = count ?? 1
    const hasExplicitZero = count === 0
    const hasVisibleMinus = count !== undefined
    return (
      <div className="diacritic-adjuster" key={key.id}>
        <button className={`diacritic-stepper-button ${hasVisibleMinus ? '' : 'is-placeholder'}`} type="button" disabled={!hasVisibleMinus || count === 0} onMouseDown={keepEditorFocus} onClick={() => changeDiacriticCount(key, -1)} aria-label={`${key.label} ${mt('decreaseCount')}`}>
            <Icon name="minus" size={16} />
        </button>
        <button className="diacritic-apply" type="button" disabled={hasExplicitZero} onMouseDown={keepEditorFocus} onClick={() => insertToolbarMark(key, repeat)} title={`${key.label} ${mt('addDiacritic')}${count && count > 1 ? ` · ${count} ${mt('times')}` : ''}`}>
          <DiacriticGlyph keyItem={key} />
          <span>{key.label}</span>
          <span className="diacritic-count" aria-live="polite">{count === undefined ? '' : count}</span>
        </button>
        <button className="diacritic-stepper-button" type="button" onMouseDown={keepEditorFocus} onClick={() => changeDiacriticCount(key, 1)} aria-label={`${key.label} ${mt('increaseCount')}`}>
            <Icon name="plus" size={16} />
        </button>
      </div>
    )
  }

  const menuButton = (id: MenuId, label: string, options: { compact?: boolean } = {}) => <button className={`menu-button ${options.compact ? 'menu-button-compact' : ''} ${openMenu === id ? 'is-open' : ''}`} type="button" aria-haspopup="menu" aria-expanded={openMenu === id} onMouseDown={(event) => event.preventDefault()} onMouseEnter={() => { if (openMenu && openMenu !== id) { setOpenMenu(id); setOpenSubmenu(null) } }} onFocus={() => { if (openMenu && openMenu !== id) { setOpenMenu(id); setOpenSubmenu(null) } }} onClick={() => { setOpenMenu((current) => current === id ? null : id); setOpenSubmenu(null) }}>{label}</button>

  const menuItem = (label: string, action: () => void, options: { disabled?: boolean; checked?: boolean } = {}) => (
    <button className="menu-item" type="button" role="menuitem" disabled={options.disabled} onMouseDown={keepEditorFocus} onClick={action}>
      <span>{label}</span>
      {options.checked !== undefined && <span className="menu-check" aria-hidden="true">{options.checked ? '✓' : ''}</span>}
    </button>
  )

  const shortcutSubmenu = <div className="shortcut-options" role="none">
    {(['shift', 'caps', 'qq'] as const).map((id) => {
      const label = id === 'shift' ? mt('shiftShortcut') : id === 'caps' ? mt('capsLockShortcut') : mt('qqShortcut')
      const info = id === 'shift' ? mt('shiftShortcutInfo') : id === 'caps' ? mt('capsLockShortcutInfo') : mt('qqShortcutInfo')
      const enabled = id === 'shift' ? shiftMode : id === 'caps' ? capsMode : shortcutMode
      const toggle = id === 'shift' ? () => setShiftMode((value) => !value) : id === 'caps' ? () => setCapsMode((value) => !value) : () => setShortcutMode((value) => !value)
      return <div className="shortcut-row" key={id}>
        {menuItem(label, toggle, { checked: enabled })}
        <div className="shortcut-info">
          <button className="shortcut-info-trigger" type="button" aria-label={info} onMouseEnter={() => showShortcutInfo(id)} onMouseLeave={hideShortcutInfo} onFocus={() => showShortcutInfo(id)} onBlur={hideShortcutInfo}><span aria-hidden="true">i</span></button>
          {shortcutInfoOpen === id && <div className="shortcut-info-popover" role="note">{info}</div>}
        </div>
      </div>
    })}
  </div>

  const submenuItem = (label: string, id: 'normalisation' | 'area' | 'shortcuts') => <div className="menu-item menu-item-branch" role="menuitem" tabIndex={0} aria-haspopup="menu" aria-expanded={openSubmenu === id} onMouseDown={(event) => event.preventDefault()} onMouseEnter={() => setOpenSubmenu(id)} onFocus={() => setOpenSubmenu(id)} onClick={() => setOpenSubmenu(id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setOpenSubmenu(id) } }}><span>{label}</span><span aria-hidden="true">›</span>{openSubmenu === id && <div className="menu-subpopover" role="menu">{id === 'normalisation' ? <>{menuItem(mt('unchanged'), () => { changeNormalisation('unchanged'); setOpenMenu(null); setOpenSubmenu(null) }, { checked: normalisation === 'unchanged' })}{menuItem(mt('nfc'), () => { changeNormalisation('NFC'); setOpenMenu(null); setOpenSubmenu(null) }, { checked: normalisation === 'NFC' })}{menuItem(mt('nfd'), () => { changeNormalisation('NFD'); setOpenMenu(null); setOpenSubmenu(null) }, { checked: normalisation === 'NFD' })}</> : id === 'area' ? <>{menuItem(mt('bottom'), () => { setPalettePlacement('bottom'); setOpenMenu(null); setOpenSubmenu(null) }, { checked: palettePlacement === 'bottom' })}{menuItem(mt('top'), () => { setPalettePlacement('top'); setOpenMenu(null); setOpenSubmenu(null) }, { checked: palettePlacement === 'top' })}{menuItem(mt('left'), () => { setPalettePlacement('left'); setOpenMenu(null); setOpenSubmenu(null) }, { checked: palettePlacement === 'left' })}{menuItem(mt('right'), () => { setPalettePlacement('right'); setOpenMenu(null); setOpenSubmenu(null) }, { checked: palettePlacement === 'right' })}</> : shortcutSubmenu}</div>}</div>

  const openMenuItems = (id: MenuId) => {
    if (id === 'file') return <>
      {menuItem(mt('open'), openFileModal)}
      {menuItem(mt('new'), newFile)}
      {menuItem(mt('copy'), copy, { disabled: !editor.text })}
      {menuItem(mt('download'), openDownload, { disabled: !editor.text })}
    </>
    if (id === 'edit') return <>
      {menuItem(mt('undo'), undo, { disabled: past.length === 0 })}
      {menuItem(mt('redo'), redo, { disabled: future.length === 0 })}
      {menuItem(mt('clear'), () => { setOpenMenu(null); setClearConfirmOpen(true) }, { disabled: !editor.text })}
    </>
    if (id === 'view') return <>
      {menuItem(mt('lineNumbers'), () => setShowLineNumbers((value) => !value), { checked: showLineNumbers })}
      {menuItem(mt('wrapText'), () => setWrapText((value) => !value), { checked: wrapText })}
      {submenuItem(mt('area'), 'area')}
    </>
    if (id === 'characters') return <>
      {menuItem(mt('special'), () => { setPaletteFilter('all'); setPaletteMode('special'); setOpenMenu(null) })}
      {menuItem(mt('diacritics'), () => { setPaletteFilter('all'); setPaletteMode('diacritic'); setOpenMenu(null) })}
      {submenuItem(mt('shortcuts'), 'shortcuts')}
    </>
    return <>{submenuItem(mt('normalisation'), 'normalisation')}</>
  }

  const renderDiacriticGroups = (keys: KeyItem[], selectionMode = false, showFavoriteMark = true) => {
    const groups: Array<[TranslationKey, 'above' | 'below' | 'bridge']> = [['above', 'above'], ['below', 'below'], ['combining', 'bridge']]
    return <div className="diacritic-groups">{groups.map(([label, position]) => {
      const groupKeys = keys.filter((key) => (key.position ?? 'above') === position)
      if (!groupKeys.length) return null
      return <section className="palette-group" key={position}><div className="group-heading"><span>{t(label)}</span><span>{groupKeys.length}</span></div>{renderKeys(groupKeys, selectionMode, showFavoriteMark)}</section>
    })}</div>
  }

  const renderPaletteContent = () => {
    const selectionMode = favoriteMode
    const showFavoriteMark = paletteFilter !== 'favorites' && !selectionMode
    let content: ReactNode
    if (query.trim()) content = <div className="search-results"><div className="search-heading">{t('searchResults')} <span>{searchKeys.length}</span></div><div className="palette-group"><div className="group-heading"><span>{t('letters')}</span></div>{renderKeys(searchKeys.filter((key) => key.category === 'standard'), selectionMode, showFavoriteMark)}</div>{renderDiacriticGroups(searchKeys.filter((key) => key.category === 'diacritic'), selectionMode, showFavoriteMark)}</div>
    else if (paletteFilter === 'favorites') content = <div className="favorite-groups"><div className="palette-group"><div className="group-heading"><span>{t('letters')}</span><span>{favoriteKeys.filter((key) => key.category === 'standard').length}</span></div>{renderKeys(favoriteKeys.filter((key) => key.category === 'standard'), selectionMode, false)}</div>{renderDiacriticGroups(favoriteKeys.filter((key) => key.category === 'diacritic'), selectionMode, false)}</div>
    else if (paletteFilter === 'recent') content = <div className="favorite-groups"><div className="palette-group"><div className="group-heading"><span>{t('recentLetters')}</span></div>{renderKeys(recentKeys.filter((key) => key.category === 'standard'), selectionMode, showFavoriteMark)}</div>{renderDiacriticGroups(recentKeys.filter((key) => key.category === 'diacritic'), selectionMode, showFavoriteMark)}</div>
    else if (paletteMode === 'diacritic') content = renderDiacriticGroups(regularKeys, selectionMode, showFavoriteMark)
    else content = renderKeys(regularKeys, selectionMode, showFavoriteMark)
    if (!favoriteMode) return content
    return <div className="favorite-mode-content">{content}<div className="favorite-mode-actions"><span>{mt('selectToFavorite')}</span><button className="confirm-button" type="button" onClick={confirmFavoriteMode} disabled={favoriteDraft.length === favorites.length && favoriteDraft.every((id) => favorites.includes(id))}>{mt('confirm')}</button></div></div>
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-label="𐰲"><span>𐰲</span></span>
          <a className="wordmark" href="/">Çözgü</a>
        </div>
        <div className="topbar-right">
          <div className="topbar-menu" data-topbar-menu>
            <button className="topbar-menu-trigger" type="button" aria-haspopup="menu" aria-expanded={themeMenuOpen} onClick={() => { setThemeMenuOpen((value) => !value); setLanguageMenuOpen(false); setScriptMenuOpen(false) }}><Icon name={theme === 'dark' ? 'moon' : 'sun'} size={17} /><span>{t(themePreference)}</span><Icon name="chevron" size={13} /></button>
            {themeMenuOpen && <div className="topbar-popover" role="menu">{([themePreference, ...(['system', 'dark', 'light'] as ThemePreference[]).filter((item) => item !== themePreference)]).map((item) => <button className="topbar-menu-item" role="menuitem" type="button" key={item} onClick={() => { setThemePreference(item); setThemeMenuOpen(false) }}>{t(item)}{item === themePreference && <Icon name="check" size={14} />}</button>)}</div>}
          </div>
          <div className="topbar-menu language-menu" data-topbar-menu>
            <button className="topbar-menu-trigger" type="button" aria-haspopup="menu" aria-expanded={languageMenuOpen} onClick={() => { setLanguageMenuOpen((value) => !value); setThemeMenuOpen(false); setScriptMenuOpen(false) }}><span>{LANGUAGE_OPTIONS.find((item) => item.id === language)?.label ?? 'Türkçe'}</span><Icon name="chevron" size={13} /></button>
            {languageMenuOpen && <div className="topbar-popover topbar-popover-language" role="menu">{LANGUAGE_OPTIONS.map((item) => <button className="topbar-menu-item" role="menuitem" type="button" key={item.id} onClick={() => { setLanguage(item.id); setLanguageMenuOpen(false) }}>{item.label}{item.id === language && <Icon name="check" size={14} />}</button>)}</div>}
          </div>
          <div className="topbar-menu script-menu" data-topbar-menu>
            <button className="topbar-menu-trigger" type="button" aria-haspopup="menu" aria-expanded={scriptMenuOpen} aria-label={t('script')} onClick={() => { setScriptMenuOpen((value) => !value); setThemeMenuOpen(false); setLanguageMenuOpen(false) }}><span>{scriptLabel(menuScript)}</span><Icon name="chevron" size={13} /></button>
            {scriptMenuOpen && <div className="topbar-popover script-popover" role="menu"><p className="script-popover-note">{t('scriptInfo')}</p>{(['native', 'latin', 'cyrillic'] as MenuScript[]).map((item) => <button className="topbar-menu-item" role="menuitemradio" aria-checked={item === menuScript} type="button" key={item} onClick={() => { setMenuScript(item); setScriptMenuOpen(false) }}>{scriptLabel(item)}{item === menuScript && <Icon name="check" size={14} />}</button>)}</div>}
          </div>
        </div>
      </header>

      <main className={`workspace placement-${palettePlacement} palette-mode-${paletteMode}${favoriteMode ? ' is-favorite-mode' : ''}`}>
        <section className="editor-panel" aria-labelledby="editor-heading">
          <div className="editor-sheet" ref={sheetRef}>
            <div className="editor-toolbar" aria-label={t('textMenu')}>
              <div className="menu-bar" ref={menuBarRef} data-menu-root>
              <div className="menu-size-probe" aria-hidden="true">
                  {primaryMenuItems.map((item) => <span data-menu-size key={item.id}>{mt(item.id)}</span>)}
                  <span data-menu-overflow>…</span>
                </div>
                <div className="history-actions">
                  <button className="history-button" type="button" onMouseDown={keepEditorFocus} onClick={undo} disabled={past.length === 0} title={mt('undo')} aria-label={mt('undo')}><Icon name="undo" size={18} /></button>
                  <button className="history-button" type="button" onMouseDown={keepEditorFocus} onClick={redo} disabled={future.length === 0} title={mt('redo')} aria-label={mt('redo')}><Icon name="redo" size={18} /></button>
                </div>
                {primaryMenuItems.slice(0, visibleMenuCount).map((item) => <span className="menu-slot" key={item.id}>{menuButton(item.id, mt(item.id))}{openMenu === item.id && <div className="menu-popover" role="menu">{openMenuItems(item.id)}</div>}</span>)}
                {visibleMenuCount < primaryMenuItems.length && <span className="menu-slot menu-slot-overflow">{menuButton('more', '…', { compact: true })}{openMenu === 'more' && <div className="menu-popover menu-popover-right" role="menu">{openMenuItems('more')}</div>}</span>}
              </div>
            </div>
            <div className="document-heading"><input id="editor-heading" className="document-title-input" value={currentFile?.title ?? ''} onChange={renameCurrentFile} aria-label={t('fileName')} placeholder={t('fileNamePlaceholder')} /></div>
            <div className={`editor-writing-area ${showLineNumbers ? 'with-line-numbers' : ''}`}>
              {showLineNumbers && <div className="line-number-gutter" ref={lineNumbersRef} aria-hidden="true">{lineNumberCounts.flatMap((count, index) => Array.from({ length: count }, (_, wrappedIndex) => <span className={wrappedIndex === 0 ? 'line-number-logical' : 'line-number-continuation'} key={`${index}-${wrappedIndex}`}>{wrappedIndex === 0 ? String(index + 1).padStart(2, '0') : '·'}</span>))}</div>}
              <textarea ref={textareaRef} className={`editor-textarea ${wrapText ? 'is-wrapped' : 'is-nowrap'}`} value={editor.text} onChange={onTextChange} onKeyDown={shortcutTransform} onSelect={updateSelection} onKeyUp={onTextKeyUp} onMouseDown={onTextMouseDown} onMouseUp={updateSelection} onScroll={onTextScroll} onClick={onTextClick} aria-label={t('textAreaLabel')} placeholder={t('textPlaceholder')} spellCheck={false} />
            </div>
            {selectionToolbar.open && selectedText && <div className="selection-toolbar" style={{ top: selectionToolbar.top, left: selectionToolbar.left }} role="toolbar" aria-label={mt('selectedTextTools')}>
              {selectionHasMultipleCharacters ? <div className="selection-bulk-actions" role="group" aria-label={mt('bulkLetterActions')}>
                <button className="selection-tool" type="button" onMouseDown={keepEditorFocus} onClick={() => transformSelection('upper')} title={mt('uppercaseAction')}>{mt('uppercase')}</button>
                <button className="selection-tool" type="button" onMouseDown={keepEditorFocus} onClick={() => transformSelection('lower')} title={mt('lowercaseAction')}>{mt('lowercase')}</button>
                {selectionHasMultipleWords && <button className="selection-tool" type="button" onMouseDown={keepEditorFocus} onClick={() => transformSelection('title')} title={mt('titleCaseAction')}>{mt('titleCase')}</button>}
              </div> : <div className="selection-variants" role="group" aria-label={mt('letterForms')}>{selectionVariants.slice(0, 8).map((key) => <button className={`selection-glyph ${selectedVariantId === key.id ? 'is-selected' : ''}`} type="button" key={key.id} onMouseDown={keepEditorFocus} onClick={() => transformSelection('variant', key)} title={`${key.label} ${mt('changeTo')}`} aria-pressed={selectedVariantId === key.id}>{key.label}</button>)}</div>}
              <span className="selection-divider" />
              <button className={`selection-tool selection-tool-icon ${selectionToolbar.marksOpen ? 'is-active' : ''}`} type="button" onMouseDown={keepEditorFocus} onClick={toggleSelectionMarks} title={mt('addDiacritic')} aria-expanded={selectionToolbar.marksOpen}><Icon name="text" size={15} /><span>{mt('diacriticLabel')}</span></button>
              {selectionToolbar.marksOpen && <div className="selection-marks">{diacriticKeys.map(renderSelectionDiacritic)}</div>}
            </div>}
            <div className="sheet-rule" aria-hidden="true"><span /><b>·</b><span /></div>
            <div className="document-footer"><span>{countLines(editor.text)} {t('lineCount')}, {countWords(editor.text)} {t('wordCount')}, {countGraphemes(editor.text)} {t('characterCount')}</span></div>
          </div>
        </section>

        <aside className="palette-panel" aria-label={mt('transcriptionCharacters')}>
          <div className="palette-bar">
              <div className="palette-tabs" role="tablist" aria-label={mt('paletteView')}>
              <button className={paletteFilter === 'all' && paletteMode === 'uppercase' ? 'palette-tab is-active' : 'palette-tab'} type="button" role="tab" aria-selected={paletteFilter === 'all' && paletteMode === 'uppercase'} onMouseDown={keepEditorFocus} onClick={() => { setPaletteFilter('all'); setPaletteMode('uppercase') }}>{mt('uppercase')}</button>
              <button className={paletteFilter === 'all' && paletteMode === 'lowercase' ? 'palette-tab is-active' : 'palette-tab'} type="button" role="tab" aria-selected={paletteFilter === 'all' && paletteMode === 'lowercase'} onMouseDown={keepEditorFocus} onClick={() => { setPaletteFilter('all'); setPaletteMode('lowercase') }}>{mt('lowercase')}</button>
              <button className={paletteFilter === 'all' && paletteMode === 'special' ? 'palette-tab is-active' : 'palette-tab'} type="button" role="tab" aria-selected={paletteFilter === 'all' && paletteMode === 'special'} onMouseDown={keepEditorFocus} onClick={() => { setPaletteFilter('all'); setPaletteMode('special') }}>{mt('special')}</button>
              <button className={paletteFilter === 'all' && paletteMode === 'diacritic' ? 'palette-tab is-active' : 'palette-tab'} type="button" role="tab" aria-selected={paletteFilter === 'all' && paletteMode === 'diacritic'} onMouseDown={keepEditorFocus} onClick={() => { setPaletteFilter('all'); setPaletteMode('diacritic') }}><span className="diacritics-label-long">{t('diacritics')}</span><span className="diacritics-label-short">{t('diacriticShort')}</span></button>
            </div>
            <div className="palette-actions"><button className={`palette-action ${favoriteMode ? 'is-active' : ''}`} type="button" onMouseDown={keepEditorFocus} onClick={favoriteMode ? cancelFavoriteMode : beginFavoriteMode} title={favoriteMode ? mt('exitFavoriteMode') : mt('openFavoriteMode')} aria-pressed={favoriteMode}><Icon name="star" size={17} /><span>{favoriteMode ? mt('cancel') : mt('favorite')}</span></button><button className={`palette-action ${paletteFilter === 'favorites' ? 'is-active' : ''}`} type="button" onMouseDown={keepEditorFocus} onClick={() => { setPaletteFilter(paletteFilter === 'favorites' ? 'all' : 'favorites'); setFavoriteMode(false) }} title={mt('favorites')} aria-label={mt('favorites')} aria-pressed={paletteFilter === 'favorites'}><Icon name="star" size={17} /><span>{mt('favorites')}</span></button><button className={`palette-action ${paletteFilter === 'recent' ? 'is-active' : ''}`} type="button" onMouseDown={keepEditorFocus} onClick={() => { setPaletteFilter(paletteFilter === 'recent' ? 'all' : 'recent'); setFavoriteMode(false) }} title={mt('recent')} aria-label={mt('recent')} aria-pressed={paletteFilter === 'recent'} disabled={recent.length === 0}><Icon name="clock" size={17} /><span>{mt('recent')}</span></button><button className="palette-action" type="button" onMouseDown={keepEditorFocus} onClick={() => setSortDirection(sortDirection === 'az' ? 'za' : 'az')} title={sortDisabled ? mt('sortFixed') : sortDirection === 'az' ? mt('sortToZA') : mt('sortToAZ')} aria-label={sortDisabled ? mt('sortFixed') : sortDirection === 'az' ? mt('sortToZA') : mt('sortToAZ')} disabled={sortDisabled}><Icon name="sort" size={17} /><span>{sortDirection === 'az' ? mt('sortAZ') : mt('sortZA')}</span></button></div>
            <label className="palette-search"><Icon name="search" size={15} /><span className="sr-only">{mt('searchCharacters')}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={mt('search')} type="search" /></label>
          </div>
          <div className="palette-scroll">
            {renderPaletteContent()}
          </div>
        </aside>
      </main>

      {fileModalOpen && <div className="modal-backdrop file-modal-backdrop" role="presentation" onClick={() => setFileModalOpen(false)}><section className="file-modal" role="dialog" aria-modal="true" aria-labelledby="files-heading" onClick={(event) => event.stopPropagation()}><div className="drawer-heading"><div><span className="section-kicker">{t('localWorks')}</span><h2 id="files-heading">{t('files')}</h2></div><button className="icon-action" type="button" onClick={() => setFileModalOpen(false)} title={t('cancel')} aria-label={t('cancel')}><Icon name="close" size={17} /></button></div><div className="file-list">{files.length ? files.map((file) => <button className={`file-row ${file.id === selectedFileId ? 'is-active' : ''}`} type="button" key={file.id} onClick={() => setSelectedFileId(file.id)}><Icon name="file" size={16} /><span className="file-row-copy"><strong>{file.title}</strong><small>{formatFileDate(file.updatedAt)}</small></span>{file.id === selectedFileId && <Icon name="check" size={15} />}</button>) : <p className="empty-file-list">{t('noFiles')}</p>}</div><div className="file-modal-actions"><button className="secondary-button file-delete-button" type="button" onClick={requestDeleteFile} disabled={!selectedFileId} title={t('deleteFile')} aria-label={t('deleteFile')}><Icon name="trash" size={17} /></button><button className="secondary-button" type="button" onClick={() => setFileModalOpen(false)}>{t('cancel')}</button><button className="confirm-button" type="button" onClick={confirmOpenSelectedFile} disabled={!selectedFileId}>{t('openFile')}</button></div></section></div>}

      {deleteFileId && <div className="modal-backdrop" role="presentation" onClick={() => setDeleteFileId(null)}><section className="confirm-sheet" role="dialog" aria-modal="true" aria-labelledby="delete-heading" onClick={(event) => event.stopPropagation()}><div className="confirm-heading"><div><span className="section-kicker">{t('files')}</span><h2 id="delete-heading">{t('deleteFile')}</h2></div><button className="icon-action" type="button" onClick={() => setDeleteFileId(null)} title={t('cancel')} aria-label={t('cancel')}><Icon name="close" size={17} /></button></div><p className="clear-copy">{t('deleteWarning')}</p><div className="confirm-actions"><button className="secondary-button" type="button" onClick={() => setDeleteFileId(null)}>{t('cancel')}</button><button className="confirm-button danger-button" type="button" onClick={confirmDeleteFile}>{t('delete')}</button></div></section></div>}

      {favoriteConfirmOpen && <div className="modal-backdrop" role="presentation" onClick={() => setFavoriteConfirmOpen(false)}><section className="confirm-sheet" role="dialog" aria-modal="true" aria-labelledby="favorite-heading" onClick={(event) => event.stopPropagation()}><div className="confirm-heading"><div><span className="section-kicker">{t('favoriteHeading')}</span><h2 id="favorite-heading">{t('saveSelection')}</h2></div><button className="icon-action" type="button" onClick={() => setFavoriteConfirmOpen(false)} title={t('cancel')} aria-label={t('cancel')}><Icon name="close" size={17} /></button></div><div className="change-list">{favoriteAdditions.length > 0 && <div><span className="change-label">{t('additions')}</span><p>{favoriteAdditions.map((key) => key.label).join(' · ')}</p></div>}{favoriteRemovals.length > 0 && <div><span className="change-label">{t('removals')}</span><p>{favoriteRemovals.map((key) => key.label).join(' · ')}</p></div>}</div><div className="confirm-actions"><button className="secondary-button" type="button" onClick={() => setFavoriteConfirmOpen(false)}>{t('cancel')}</button><button className="confirm-button" type="button" onClick={saveFavoriteMode}>{t('save')}</button></div></section></div>}

      {clearConfirmOpen && <div className="modal-backdrop" role="presentation" onClick={() => setClearConfirmOpen(false)}><section className="confirm-sheet" role="dialog" aria-modal="true" aria-labelledby="clear-heading" onClick={(event) => event.stopPropagation()}><div className="confirm-heading"><div><span className="section-kicker">{t('file')}</span><h2 id="clear-heading">{t('clear')}?</h2></div><button className="icon-action" type="button" onClick={() => setClearConfirmOpen(false)} title={t('cancel')} aria-label={t('cancel')}><Icon name="close" size={17} /></button></div><p className="clear-copy">{t('clear')}. {t('clearWarning')}</p><div className="confirm-actions"><button className="secondary-button" type="button" onClick={() => setClearConfirmOpen(false)}>{t('cancel')}</button><button className="confirm-button" type="button" onClick={confirmClearText}>{t('clear')}</button></div></section></div>}

      {downloadModalOpen && <div className="modal-backdrop" role="presentation" onClick={() => setDownloadModalOpen(false)}><section className="confirm-sheet download-sheet" role="dialog" aria-modal="true" aria-labelledby="download-heading" onClick={(event) => event.stopPropagation()}><div className="confirm-heading"><div><span className="section-kicker">{t('file')}</span><h2 id="download-heading">{t('downloadText')}</h2></div><button className="icon-action" type="button" onClick={() => setDownloadModalOpen(false)} title={t('cancel')} aria-label={t('cancel')}><Icon name="close" size={17} /></button></div><label className="download-field"><span>{t('downloadFileName')}</span><input value={downloadName} onChange={(event) => setDownloadName(event.target.value)} autoFocus /></label><label className="download-field"><span>{t('format')}</span><select value={downloadFormat} onChange={(event) => setDownloadFormat(event.target.value as DownloadFormat)}><option value="txt">{t('plainText')}</option><option value="md">{t('markdown')}</option></select></label><div className="confirm-actions"><button className="secondary-button" type="button" onClick={() => setDownloadModalOpen(false)}>{t('cancel')}</button><button className="confirm-button" type="button" onClick={download}>{t('download')}</button></div></section></div>}
    </div>
  )
}

export default App
