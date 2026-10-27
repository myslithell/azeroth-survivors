<div align="center">

# Azeroth Survivors — скачать для Windows и macOS

**Бесплатный фанатский рогалик по World of Warcraft от [Aethus](https://wow.aethus.pl/).**
Выбираешь класс и зону, выживаешь в волнах врагов, качаешься и собираешь заклинания,
а каждые несколько минут приходит босс. Без сервера, без аккаунта, полностью офлайн.

[**⬇ Windows**](https://github.com/myslithell/azeroth-survivors/releases/latest/download/AzerothSurvivors-Windows.rar) ·
[**⬇ macOS (Apple Silicon)**](https://github.com/myslithell/azeroth-survivors/releases/latest/download/AzerothSurvivors-macOS-AppleSilicon.zip) ·
[Все версии](https://github.com/myslithell/azeroth-survivors/releases) ·
[English below](#english)

</div>

| Система | Файл | Размер |
| --- | --- | --- |
| Windows 64-bit | [AzerothSurvivors-Windows.rar](https://github.com/myslithell/azeroth-survivors/releases/latest/download/AzerothSurvivors-Windows.rar) | 755 МБ |
| macOS 13+, Apple Silicon (M1 и новее) | [AzerothSurvivors-macOS-AppleSilicon.zip](https://github.com/myslithell/azeroth-survivors/releases/latest/download/AzerothSurvivors-macOS-AppleSilicon.zip) | 1 ГБ |

Версия игры: **v0.120.5** (`e0e2410c`).

## Windows

1. Скачай `AzerothSurvivors-Windows.rar`.
2. Распакуй его через [7-Zip](https://www.7-zip.org/) или WinRAR.
3. Запусти `AzerothSurvivors.exe`. Если появится окно SmartScreen, нажми «Подробнее» → «Выполнить в любом случае».

Это официальная Windows-сборка с сайта автора, без изменений.

## macOS

1. Скачай `AzerothSurvivors-macOS-AppleSilicon.zip` и открой его: появится `Azeroth Survivors.app`.
2. Перетащи `Azeroth Survivors.app` в папку «Программы».
3. При первом запуске macOS скажет, что не может проверить приложение или что оно повреждено.
   Это из-за того, что приложение не заверено в Apple. Открой «Терминал» и выполни:

   ```bash
   xattr -cr "/Applications/Azeroth Survivors.app"
   ```

   Или зайди в «Системные настройки» → «Конфиденциальность и безопасность» и нажми «Всё равно открыть».
4. Запускай как обычное приложение.

Работает только на Mac с чипом Apple (M1, M2, M3, M4 и новее). На Mac с Intel не запустится.

Внутри официальная браузерная версия игры с сайта автора, упакованная в отдельное приложение на
[Electron](https://www.electronjs.org/). Игра работает офлайн: приложение отдаёт файлы игры с диска
через локальный адрес `127.0.0.1:47615` и не ходит в интернет. Исходник обёртки лежит в [`mac/`](mac/).

## Сохранения

Прогресс хранится на твоём компьютере и не связан с прогрессом на сайте. Чтобы перенести его,
экспортируй сохранение на сайте в «Настройки» → «Saves», а в приложении там же нажми «Import Save»
и выбери этот файл.

## Об игре

Azeroth Survivors сделал **Aethus**. Играть в браузере можно на **[wow.aethus.pl](https://wow.aethus.pl/)**,
сообщество собирается в [Discord](https://discord.gg/azerothsurvivors). Этот репозиторий — только зеркало
для удобного скачивания.

Azeroth Survivors — бесплатная фанатская игра. Она не связана с Blizzard Entertainment и не одобрена ею.
World of Warcraft и его ресурсы принадлежат Blizzard Entertainment, Inc.

---

<a id="english"></a>

## English

**A free fan-made World of Warcraft roguelike by [Aethus](https://wow.aethus.pl/).** Pick a class and a
zone, survive the waves, level up, collect spells, and face a boss every few minutes. No server, no account,
fully offline.

| System | File | Size |
| --- | --- | --- |
| Windows 64-bit | [AzerothSurvivors-Windows.rar](https://github.com/myslithell/azeroth-survivors/releases/latest/download/AzerothSurvivors-Windows.rar) | 755 MB |
| macOS 13+, Apple Silicon (M1 or newer) | [AzerothSurvivors-macOS-AppleSilicon.zip](https://github.com/myslithell/azeroth-survivors/releases/latest/download/AzerothSurvivors-macOS-AppleSilicon.zip) | 1 GB |

Game version: **v0.120.5** (`e0e2410c`).

### Windows

1. Download `AzerothSurvivors-Windows.rar`.
2. Extract it with [7-Zip](https://www.7-zip.org/) or WinRAR.
3. Run `AzerothSurvivors.exe`. If SmartScreen appears, click "More info" → "Run anyway".

This is the official Windows build from the author's site, unchanged.

### macOS

1. Download `AzerothSurvivors-macOS-AppleSilicon.zip` and open it to get `Azeroth Survivors.app`.
2. Drag `Azeroth Survivors.app` into Applications.
3. On first launch macOS says it cannot verify the app, or that the app is damaged: the app is not
   notarized by Apple. Open Terminal and run:

   ```bash
   xattr -cr "/Applications/Azeroth Survivors.app"
   ```

   Or open System Settings → Privacy & Security and click "Open Anyway".
4. Launch it like any other app.

Apple Silicon Macs only (M1, M2, M3, M4 and newer); it does not run on Intel Macs.

Inside is the official browser build of the game from the author's site, packaged as a standalone
[Electron](https://www.electronjs.org/) app. It runs offline: the app serves the game files from disk on
`127.0.0.1:47615` and makes no network requests. The wrapper's source is in [`mac/`](mac/).

### Saves

Progress is stored on your computer, separate from the website. To move it, export your save on the
website under Options → Saves, then in the app open Options → Saves → Import Save and pick that file.

### About

Azeroth Survivors is made by **Aethus**. Play it in the browser at **[wow.aethus.pl](https://wow.aethus.pl/)**
and join the [Discord](https://discord.gg/azerothsurvivors). This repository is only a download mirror.

Azeroth Survivors is a free fan game, not affiliated with or endorsed by Blizzard Entertainment.
World of Warcraft and its assets are the property of Blizzard Entertainment, Inc.
