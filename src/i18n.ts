export type LanguageId = 'tr' | 'az' | 'uz' | 'ug' | 'kk' | 'tk' | 'tt' | 'ky' | 'ba' | 'cv' | 'en' | 'de' | 'fr' | 'ru' | 'zh'

export type TranslationKey =
  | 'theme' | 'language' | 'script' | 'nativeScript' | 'latinScript' | 'cyrillicScript' | 'scriptInfo' | 'system' | 'dark' | 'light'
  | 'file' | 'edit' | 'view' | 'characters' | 'misc'
  | 'undo' | 'redo' | 'open' | 'new' | 'copy' | 'download' | 'clear'
  | 'lineNumbers' | 'wrapText' | 'special' | 'diacritics' | 'shortcuts' | 'shortcutsInfo' | 'shiftShortcut' | 'capsLockShortcut' | 'qqShortcut' | 'shiftShortcutInfo' | 'capsLockShortcutInfo' | 'qqShortcutInfo' | 'titleCase' | 'qqShortcuts' | 'capsLockBehavior' | 'shiftBehavior'
  | 'normalisation' | 'unchanged' | 'nfc' | 'nfd' | 'area' | 'bottom' | 'top' | 'left' | 'right'
  | 'cancel' | 'save' | 'confirm' | 'files' | 'localWorks' | 'newFile' | 'openFile'
  | 'delete' | 'deleteFile' | 'deleteWarning' | 'noFiles' | 'fileName' | 'fileNamePlaceholder'
  | 'favorite' | 'favorites' | 'recent' | 'sortAZ' | 'sortZA' | 'search'
  | 'uppercase' | 'lowercase' | 'diacriticShort' | 'additions' | 'removals' | 'none'
  | 'selectToFavorite' | 'saveSelection' | 'favoriteHeading' | 'selectedFile'
  | 'plainText' | 'markdown' | 'format' | 'downloadText' | 'downloadFileName'
  | 'transcriptionCharacters' | 'textMenu' | 'textAreaLabel' | 'textPlaceholder'
  | 'lineCount' | 'wordCount' | 'characterCount' | 'above' | 'below' | 'combining'
  | 'letters' | 'recentLetters' | 'searchResults' | 'noMatches'
  | 'standardLetter' | 'diacriticLabel' | 'shortcutLabel' | 'selected' | 'notSelected' | 'favoriteMark'
  | 'paletteView' | 'searchCharacters' | 'selectedTextTools' | 'bulkLetterActions' | 'letterForms'
  | 'uppercaseAction' | 'lowercaseAction' | 'titleCaseAction' | 'addDiacritic' | 'increaseCount' | 'decreaseCount'
  | 'openFavoriteMode' | 'exitFavoriteMode' | 'sortFixed' | 'sortToAZ' | 'sortToZA' | 'clearWarning' | 'changeTo' | 'times'

export type TranslationTable = Partial<Record<TranslationKey, string>>

export const LANGUAGE_OPTIONS: Array<{ id: LanguageId; label: string }> = [
  { id: 'tr', label: 'Türkçe' },
  { id: 'az', label: 'Azərbaycanca' },
  { id: 'uz', label: 'O‘zbekcha' },
  { id: 'ug', label: 'ئۇيغۇرچە' },
  { id: 'kk', label: 'Қазақша' },
  { id: 'tk', label: 'Türkmençe' },
  { id: 'tt', label: 'Татарча' },
  { id: 'ky', label: 'Кыргызча' },
  { id: 'ba', label: 'Башҡортса' },
  { id: 'cv', label: 'Чӑвашла' },
  { id: 'en', label: 'English' },
  { id: 'de', label: 'Deutsch' },
  { id: 'fr', label: 'Français' },
  { id: 'ru', label: 'Русский' },
  { id: 'zh', label: '简体中文' },
]

export const TURKIC_LANGUAGES = new Set<LanguageId>(['tr', 'az', 'uz', 'ug', 'kk', 'tk', 'tt', 'ky', 'ba', 'cv'])

const turkish: Record<TranslationKey, string> = {
  theme: 'Tema', language: 'Dil', script: 'Yazı sistemi', nativeScript: 'Yerel', latinScript: 'Latin', cyrillicScript: 'Kiril', scriptInfo: 'Yalnızca menü yazılarını değiştirir; metninize, karakter paletine ve dışa aktarılan dosyalara dokunmaz.', system: 'Sistem', dark: 'Koyu', light: 'Açık',
  file: 'Dosya', edit: 'Düzenle', view: 'Görünüm', characters: 'Karakterler', misc: 'Diğer',
  undo: 'Geri al', redo: 'İleri al', open: 'Aç', new: 'Yeni', copy: 'Kopyala', download: 'İndir', clear: 'Temizle',
  lineNumbers: 'Satır numaraları', wrapText: 'Satır kaydırma', special: 'Özel', diacritics: 'Diyakritikler', shortcuts: 'Kısayollar', shortcutsInfo: 'Kısayolları açın ve karakter paletini klavyenizle daha hızlı kullanın.', shiftShortcut: 'Shift', capsLockShortcut: 'Caps Lock', qqShortcut: 'QQ', shiftShortcutInfo: 'Basılı tuttuğunuz sürece karakter paletini Büyük görünümüne geçirir.', capsLockShortcutInfo: 'Caps Lock açıldığında karakter paletini Büyük görünümüne geçirir; paleti elle değiştirirseniz otomatik geçiş durur.', qqShortcutInfo: 'Bir harften sonra Q, W veya X tuşlarına iki kez basarak özel biçime geçin. Diyakritikler için 1, 2 veya 3 ile satırı seçin; ardından kısayola basın (Üstte: 11, 12, 13, 1q, 1w, 1e, 1z, 1x, 1c; Altta: 2q, 2w, 2e, 2a, 2s; Bağlayıcı: 31, 32).', titleCase: 'Başlık', qqShortcuts: 'QQ kısayolları', capsLockBehavior: 'Caps Lock davranışı', shiftBehavior: 'Shift davranışı',
  normalisation: 'Normalleştirme', unchanged: 'Değiştirme', nfc: 'NFC', nfd: 'NFD', area: 'Alan', bottom: 'Alt', top: 'Üst', left: 'Sol', right: 'Sağ',
  cancel: 'İptal', save: 'Kaydet', confirm: 'Onayla', files: 'Dosyalar', localWorks: 'YEREL ÇALIŞMALAR', newFile: 'Yeni dosya', openFile: 'Dosyayı aç',
  delete: 'Sil', deleteFile: 'Dosyayı sil', deleteWarning: 'Bu işlem geri alınamaz. Dosya ve içindeki metin kalıcı olarak silinecek.', noFiles: 'Dosya yok', fileName: 'Dosya adı', fileNamePlaceholder: 'Metin adı',
  favorite: 'Yıldızla', favorites: 'Sık', recent: 'Son', sortAZ: 'A→Z', sortZA: 'Z→A', search: 'Ara',
  uppercase: 'Büyük', lowercase: 'Küçük', diacriticShort: 'Diyak.', additions: 'Eklenecekler', removals: 'Çıkarılacaklar', none: 'Yok',
  selectToFavorite: 'Yıldızlamak için seçin', saveSelection: 'Seçimi kaydet', favoriteHeading: 'Yıldızlı karakterler', selectedFile: 'Seçili dosya',
  plainText: 'Düz metin (.txt)', markdown: 'Markdown (.md)', format: 'Biçim', downloadText: 'Metni indir', downloadFileName: 'Dosya adı',
  transcriptionCharacters: 'Transkripsiyon karakterleri', textMenu: 'Metin menüsü', textAreaLabel: 'Transkripsiyon metni', textPlaceholder: 'Metninizi buraya yazın',
  lineCount: 'satır', wordCount: 'kelime', characterCount: 'karakter', above: 'Üstte', below: 'Altta', combining: 'Bağlayıcı', letters: 'Harfler', recentLetters: 'Son kullanılan harfler', searchResults: 'Arama sonuçları', noMatches: 'Bu ölçütle eşleşen karakter yok.',
  standardLetter: 'Standart harf', diacriticLabel: 'Diyakritik', shortcutLabel: 'Kısayol', selected: 'seçildi', notSelected: 'seçilmedi', favoriteMark: 'Sık kullanılan', paletteView: 'Karakter görünümü', searchCharacters: 'Karakter ara', selectedTextTools: 'Seçili metin araçları', bulkLetterActions: 'Toplu harf işlemleri', letterForms: 'Harf biçimleri', uppercaseAction: 'Büyük harfe çevir', lowercaseAction: 'Küçük harfe çevir', titleCaseAction: 'Başlık biçimine çevir', addDiacritic: 'Diyakritik ekle', increaseCount: 'sayısını artır', decreaseCount: 'sayısını azalt', openFavoriteMode: 'Yıldızlama modunu aç', exitFavoriteMode: 'Yıldız modundan çık', sortFixed: 'Diyakritik sırası sabit', sortToAZ: 'A’dan Z’ye sırala', sortToZA: 'Z’den A’ya sırala', clearWarning: 'Bu işlem geri alınabilir.', changeTo: 'olarak değiştir', times: 'kez',
}

const english: Record<TranslationKey, string> = {
  theme: 'Theme', language: 'Language', script: 'Script', nativeScript: 'Native', latinScript: 'Latin', cyrillicScript: 'Kiril', scriptInfo: 'Changes menu labels only. Your text, character palette, and exported files stay unchanged.', system: 'System', dark: 'Dark', light: 'Light',
  file: 'File', edit: 'Edit', view: 'View', characters: 'Characters', misc: 'Misc.',
  undo: 'Undo', redo: 'Redo', open: 'Open', new: 'New', copy: 'Copy', download: 'Download', clear: 'Clear',
  lineNumbers: 'Line numbers', wrapText: 'Wrap lines', special: 'Special', diacritics: 'Diacritics', shortcuts: 'Shortcuts', shortcutsInfo: 'Enable these shortcuts to use the character palette faster from the keyboard.', shiftShortcut: 'Shift', capsLockShortcut: 'Caps Lock', qqShortcut: 'QQ', shiftShortcutInfo: 'Temporarily shows the Uppercase palette while you hold Shift.', capsLockShortcutInfo: 'Shows the Uppercase palette when Caps Lock turns on; manual palette changes stop the automatic switch.', qqShortcutInfo: 'Press Q, W, or X twice after a letter for its next special form. For diacritics, start with 1, 2, or 3 to choose a row, then use its key (Above: 11, 12, 13, 1q, 1w, 1e, 1z, 1x, 1c; Below: 2q, 2w, 2e, 2a, 2s; Combining: 31, 32).', titleCase: 'Title case', qqShortcuts: 'QQ shortcuts', capsLockBehavior: 'Caps Lock behaviour', shiftBehavior: 'Shift behaviour',
  normalisation: 'Normalisation', unchanged: 'Unchanged', nfc: 'NFC', nfd: 'NFD', area: 'Palette placement', bottom: 'Bottom', top: 'Top', left: 'Left', right: 'Right',
  cancel: 'Cancel', save: 'Save', confirm: 'Confirm', files: 'Files', localWorks: 'LOCAL WORK', newFile: 'New file', openFile: 'Open file',
  delete: 'Delete', deleteFile: 'Delete file', deleteWarning: 'This action cannot be undone. The file and its text will be deleted permanently.', noFiles: 'No files', fileName: 'File name', fileNamePlaceholder: 'Text name',
  favorite: 'Star', favorites: 'Favourites', recent: 'Recent', sortAZ: 'A→Z', sortZA: 'Z→A', search: 'Search',
  uppercase: 'Uppercase', lowercase: 'Lowercase', diacriticShort: 'Diac.', additions: 'Additions', removals: 'Removals', none: 'None',
  selectToFavorite: 'Select items to star', saveSelection: 'Save selection', favoriteHeading: 'Starred characters', selectedFile: 'Selected file',
  plainText: 'Plain text (.txt)', markdown: 'Markdown (.md)', format: 'Format', downloadText: 'Download text', downloadFileName: 'File name',
  transcriptionCharacters: 'Transcription characters', textMenu: 'Text menu', textAreaLabel: 'Transcription text', textPlaceholder: 'Write or paste your text here',
  lineCount: 'lines', wordCount: 'words', characterCount: 'characters', above: 'Above', below: 'Below', combining: 'Combining', letters: 'Letters', recentLetters: 'Recently used letters', searchResults: 'Search results', noMatches: 'No characters match this search.',
  standardLetter: 'Standard letter', diacriticLabel: 'Diacritic', shortcutLabel: 'Shortcut', selected: 'selected', notSelected: 'not selected', favoriteMark: 'Favourite', paletteView: 'Character view', searchCharacters: 'Search characters', selectedTextTools: 'Selected text tools', bulkLetterActions: 'Bulk letter actions', letterForms: 'Letter forms', uppercaseAction: 'Make uppercase', lowercaseAction: 'Make lowercase', titleCaseAction: 'Make title case', addDiacritic: 'Add diacritic', increaseCount: 'increase count', decreaseCount: 'decrease count', openFavoriteMode: 'Open star mode', exitFavoriteMode: 'Exit star mode', sortFixed: 'Diacritic order is fixed', sortToAZ: 'Sort A to Z', sortToZA: 'Sort Z to A', clearWarning: 'This action can be undone.', changeTo: 'change to', times: 'times',
}

const az: TranslationTable = { file: 'Fayl', edit: 'Redaktə', view: 'Görünüş', characters: 'Hərflər', misc: 'Digər', undo: 'Geri al', redo: 'İrəli al', open: 'Aç', new: 'Yeni', copy: 'Kopyala', download: 'Yüklə', clear: 'Təmizlə', lineNumbers: 'Sətir nömrələri', wrapText: 'Sətir sarılması', special: 'Xüsusi', diacritics: 'Diakritiklər', normalisation: 'Normallaşdırma', area: 'Sahə', bottom: 'Aşağıda', top: 'Yuxarıda', left: 'Solda', right: 'Sağda', cancel: 'Ləğv et', save: 'Saxla', confirm: 'Təsdiqlə', files: 'Fayllar', newFile: 'Yeni fayl', openFile: 'Faylı aç', delete: 'Sil', deleteFile: 'Faylı sil', favorite: 'Ulduzla', favorites: 'Seçilmişlər', recent: 'Son', search: 'Axtar', uppercase: 'Böyük', lowercase: 'Kiçik' }
const uz: TranslationTable = { file: 'Fayl', edit: 'Tahrirlash', view: 'Ko‘rinish', characters: 'Belgilar', misc: 'Boshqa', undo: 'Ortga qaytarish', redo: 'Qayta tiklash', open: 'Ochish', new: 'Yangi', copy: 'Nusxalash', download: 'Yuklab olish', clear: 'Tozalash', lineNumbers: 'Qator raqamlari', wrapText: 'Qatorni o‘rash', special: 'Maxsus', diacritics: 'Diakritikalar', normalisation: 'Me’yorlash', area: 'Maydon', bottom: 'Pastda', top: 'Yuqorida', left: 'Chapda', right: 'O‘ngda', cancel: 'Bekor qilish', save: 'Saqlash', confirm: 'Tasdiqlash', files: 'Fayllar', newFile: 'Yangi fayl', openFile: 'Faylni ochish', delete: 'O‘chirish', deleteFile: 'Faylni o‘chirish', favorite: 'Yulduzcha', favorites: 'Sevimlilar', recent: 'So‘nggi', search: 'Qidirish', uppercase: 'Katta', lowercase: 'Kichik' }
const kk: TranslationTable = { file: 'Файл', edit: 'Өңдеу', view: 'Көрініс', characters: 'Таңбалар', misc: 'Басқа', undo: 'Болдырмау', redo: 'Қайталау', open: 'Ашу', new: 'Жаңа', copy: 'Көшіру', download: 'Жүктеп алу', clear: 'Тазалау', lineNumbers: 'Жол нөмірлері', wrapText: 'Жолды тасымалдау', special: 'Арнайы', diacritics: 'Диакритикалар', normalisation: 'Нормализация', area: 'Орналасу', bottom: 'Төменде', top: 'Жоғарыда', left: 'Солда', right: 'Оңда', cancel: 'Болдырмау', save: 'Сақтау', confirm: 'Растау', files: 'Файлдар', newFile: 'Жаңа файл', openFile: 'Файлды ашу', delete: 'Жою', deleteFile: 'Файлды жою', favorite: 'Жұлдызша', favorites: 'Таңдаулылар', recent: 'Соңғы', search: 'Іздеу', uppercase: 'Бас әріп', lowercase: 'Кіші әріп' }
const tk: TranslationTable = { file: 'Faýl', edit: 'Düzet', view: 'Görnüş', characters: 'Nyşanlar', misc: 'Beýleki', undo: 'Yza al', redo: 'Öňe al', open: 'Aç', new: 'Täze', copy: 'Göçür', download: 'Ýükle', clear: 'Arassala', lineNumbers: 'Setir belgileri', wrapText: 'Setiri geçirmek', special: 'Ýörite', diacritics: 'Diakritikler', normalisation: 'Normallaşdyrma', area: 'Ýerleşim', bottom: 'Aşakda', top: 'Ýokarda', left: 'Çepde', right: 'Sagda', cancel: 'Ýatyr', save: 'Sakla', confirm: 'Tassykla', files: 'Faýllar', newFile: 'Täze faýl', openFile: 'Faýly aç', delete: 'Poz', deleteFile: 'Faýly poz', favorite: 'Ýyldyzla', favorites: 'Halanlar', recent: 'Soňky', search: 'Gözle', uppercase: 'Baş harp', lowercase: 'Kiçi harp' }
const tt: TranslationTable = { file: 'Файл', edit: 'Үзгәртү', view: 'Күренеш', characters: 'Символлар', misc: 'Башка', undo: 'Кире алу', redo: 'Кабатлау', open: 'Ачу', new: 'Яңа', copy: 'Күчерү', download: 'Йөкләү', clear: 'Чистарту', lineNumbers: 'Юл номерлары', wrapText: 'Юлны күчерү', special: 'Махсус', diacritics: 'Диакритикалар', normalisation: 'Нормалаштыру', area: 'Урнашу', bottom: 'Аста', top: 'Өстә', left: 'Сулда', right: 'Уңда', cancel: 'Баш тарту', save: 'Саклау', confirm: 'Раслау', files: 'Файллар', newFile: 'Яңа файл', openFile: 'Файлны ачу', delete: 'Бетерү', deleteFile: 'Файлны бетерү', favorite: 'Йолдызлау', favorites: 'Сайланганнар', recent: 'Соңгы', search: 'Эзләү', uppercase: 'Баш хәреф', lowercase: 'Кече хәреф' }
const ky: TranslationTable = { file: 'Файл', edit: 'Оңдоо', view: 'Көрүнүш', characters: 'Белгилер', misc: 'Башка', undo: 'Артка кайтаруу', redo: 'Кайталоо', open: 'Ачуу', new: 'Жаңы', copy: 'Көчүрүү', download: 'Жүктөө', clear: 'Тазалоо', lineNumbers: 'Сап номерлери', wrapText: 'Сапты жылдыруу', special: 'Атайын', diacritics: 'Диакритикалар', normalisation: 'Нормалдаштыруу', area: 'Жайгашуу', bottom: 'Төмөндө', top: 'Жогоруда', left: 'Солдо', right: 'Оңдо', cancel: 'Жокко чыгаруу', save: 'Сактоо', confirm: 'Ырастоо', files: 'Файлдар', newFile: 'Жаңы файл', openFile: 'Файлды ачуу', delete: 'Өчүрүү', deleteFile: 'Файлды өчүрүү', favorite: 'Жылдызча', favorites: 'Тандалгандар', recent: 'Акыркы', search: 'Издөө', uppercase: 'Баш тамга', lowercase: 'Кичине тамга' }
const de: TranslationTable = { file: 'Datei', edit: 'Bearbeiten', view: 'Ansicht', characters: 'Zeichen', misc: 'Mehr', undo: 'Rückgängig', redo: 'Wiederholen', open: 'Öffnen', new: 'Neu', copy: 'Kopieren', download: 'Herunterladen', clear: 'Leeren', lineNumbers: 'Zeilennummern', wrapText: 'Zeilenumbruch', special: 'Sonderzeichen', diacritics: 'Diakritika', normalisation: 'Normalisierung', area: 'Position', bottom: 'Unten', top: 'Oben', left: 'Links', right: 'Rechts', cancel: 'Abbrechen', save: 'Speichern', confirm: 'Bestätigen', files: 'Dateien', newFile: 'Neue Datei', openFile: 'Datei öffnen', delete: 'Löschen', deleteFile: 'Datei löschen', favorite: 'Markieren', favorites: 'Favoriten', recent: 'Zuletzt', search: 'Suchen', uppercase: 'Groß', lowercase: 'Klein' }
const fr: TranslationTable = { file: 'Fichier', edit: 'Modifier', view: 'Affichage', characters: 'Caractères', misc: 'Autres', undo: 'Annuler', redo: 'Rétablir', open: 'Ouvrir', new: 'Nouveau', copy: 'Copier', download: 'Télécharger', clear: 'Effacer', lineNumbers: 'Numéros de ligne', wrapText: 'Retour à la ligne', special: 'Spéciaux', diacritics: 'Diacritiques', normalisation: 'Normalisation', area: 'Position', bottom: 'Bas', top: 'Haut', left: 'Gauche', right: 'Droite', cancel: 'Annuler', save: 'Enregistrer', confirm: 'Confirmer', files: 'Fichiers', newFile: 'Nouveau fichier', openFile: 'Ouvrir le fichier', delete: 'Supprimer', deleteFile: 'Supprimer le fichier', favorite: 'Marquer', favorites: 'Favoris', recent: 'Récents', search: 'Rechercher', uppercase: 'Majuscules', lowercase: 'Minuscules' }
const ru: TranslationTable = { file: 'Файл', edit: 'Правка', view: 'Вид', characters: 'Символы', misc: 'Другое', undo: 'Отменить', redo: 'Повторить', open: 'Открыть', new: 'Новый', copy: 'Копировать', download: 'Скачать', clear: 'Очистить', lineNumbers: 'Номера строк', wrapText: 'Перенос строк', special: 'Специальные', diacritics: 'Диакритика', normalisation: 'Нормализация', area: 'Расположение', bottom: 'Снизу', top: 'Сверху', left: 'Слева', right: 'Справа', cancel: 'Отмена', save: 'Сохранить', confirm: 'Подтвердить', files: 'Файлы', newFile: 'Новый файл', openFile: 'Открыть файл', delete: 'Удалить', deleteFile: 'Удалить файл', favorite: 'Отметить', favorites: 'Избранное', recent: 'Недавние', search: 'Поиск', uppercase: 'Верхний регистр', lowercase: 'Нижний регистр' }
const zh: TranslationTable = { file: '文件', edit: '编辑', view: '视图', characters: '字符', misc: '其他', undo: '撤销', redo: '重做', open: '打开', new: '新建', copy: '复制', download: '下载', clear: '清除', lineNumbers: '行号', wrapText: '自动换行', special: '特殊字符', diacritics: '变音符号', normalisation: '规范化', area: '位置', bottom: '下方', top: '上方', left: '左侧', right: '右侧', cancel: '取消', save: '保存', confirm: '确认', files: '文件', newFile: '新建文件', openFile: '打开文件', delete: '删除', deleteFile: '删除文件', favorite: '收藏', favorites: '收藏夹', recent: '最近使用', search: '搜索', uppercase: '大写', lowercase: '小写' }

const tables: Record<LanguageId, TranslationTable> = { tr: turkish, en: english, az, uz, ug: {}, kk, tk, tt, ky, ba: {}, cv: {}, de, fr, ru, zh }

export function translate(language: LanguageId, key: TranslationKey) {
  const selected = tables[language]?.[key]
  if (selected) return selected
  const fallback = TURKIC_LANGUAGES.has(language) ? turkish[key] : english[key]
  return fallback ?? turkish[key]
}
