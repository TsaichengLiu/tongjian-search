# 通檢

簡繁異體通用的本地文件檢索與管理工具（macOS）。

*A local file search and management tool for macOS in which Simplified, Traditional and variant Chinese characters match each other (e.g. 万历 finds 萬曆, 萬歷, 万暦), for file names and full text.*

## 安裝

需要 macOS 12 以上和 Xcode 命令行工具（提供 `python3` 與 `swiftc`；沒有的話在終端運行 `xcode-select --install`）。不依賴任何第三方庫。

```bash
git clone https://github.com/TsaichengLiu/tongjian-search.git
cd tongjian-search
./build_app.sh --install      # 構建並安裝到「應用程序」；不加 --install 則只生成 build/通檢.app
```

## 使用

打開「應用程序」裡的通檢。點左上「資料庫 ＋」加入存放資料的文件夾，通檢會為文件名和全文建立索引。之後用 macOS 的 FSEvents 實時監聽：文件新增、修改、改名、刪除後幾秒內更新索引（在訪達裡改名、移動，收藏標籤備註都保留）；每次啟動時再快速核對一遍（約 3 萬個文件 3 秒左右）。實時監聽和定時重掃都只在 App 打開時進行，退出後沒有任何後台活動。默認只檢索文件名（含文件夾名），需要時在工具欄切到「名稱與全文」或「僅全文」。

- **匹配方式**：精確／簡繁／異體（⌘1/2/3）。「異體」模式下查「万历」可得 萬曆、萬歷、万暦、萬厤；跨行斷開的詞也能找到。
- **語法**：空格＝且，`|`＝或，`-詞`＝排除，`"…"`＝西文短語。
- **模糊檢索**（工具欄「≈ 模糊」，⌘4）：容許脫字、衍字、訛字，查「李自成攻陷京師」也可得「李自成陷京師」「李自成攻入京師」。按相似度（1 − 差異字數 ÷ 檢索詞字數，可選 50%–90%）篩選，空白、標點不計，3 字以上的詞才模糊匹配，排除詞仍按原方式；與三種匹配方式疊加使用。也可以貼一整句話，找它在資料庫裡被引用、轉錄的各處（容許異文）。算法為 Myers 位向量近似匹配；候選用 q-gram 原理預篩：檢索詞分成 n 段，每處差異至多破壞一段，近似出現處至少有 n − 差異數 段原樣保留，且這些段的相對位置相差不超過 2 × 差異數 —— 只是必要條件的篩選，不會漏掉符合相似度的出現處（字與字之間隔著七個以上符號的極端情況除外）。2 億字的資料庫上，短語一般 0.2–2 秒，一兩句話 1–2 秒；相似度設得很低時最多算 6 秒，先列出已找到的（按含檢索詞片段多少的順序覆核，最像的通常在前）；輸入新詞時舊的檢索立即停止。
- **限定範圍**：點側欄的文件夾只在該文件夾內檢索，⌘ 點擊可同時選幾個；在結果上右鍵「只在選中項中檢索」／「加入檢索範圍」可自選若干文件和文件夾（結果上方的「範圍」標籤可查看、移除）；預覽全文時 ⌘F 只在當前文件內查找，與上方檢索框互不干擾。
- **高亮**：黃底為原字命中，朱色下劃線為異體命中（原文字形與檢索詞不同），藍色下劃線為模糊命中裡與檢索詞不同的字。PDF 的命中片段標出頁碼，可一鍵跳到原件該頁。
- **文件夾**：文件夾名也參與檢索（例如存放古籍書影照片、文件名都是 IMG_xxxx 的文件夾）。點開後有兩種視圖：「結構」像訪達的列表視圖，子文件夾可逐層展開，每層附文件數、大小、日期，展開的上級文件夾在滾動時吸頂；當前檢索詞命中的名稱高亮，所在分支自動展開並滾到第一處，點「名稱命中 N 處」依次跳轉。「縮略圖」列出本層文件，照片文件夾默認用它。雙擊子文件夾進入，點文件看預覽、可返回原位置。縮略圖由 QuickLook 生成，按數據庫緩存在 `~/Library/Caches/TongJian/thumbs-…`。
- **排序**：文件夾和文件名按系統的排序設置（默認拼音；設置裡可改筆畫、部首、Unicode），數字按數值，卷、第、冊、年等編號裡的中文數字也按數值（卷二 < 卷十 < 卷一百，萬曆四年 < 萬曆十五年），書名裡的數字不動（三國志、二十四史仍按拼音）。
- **管理**：收藏、標籤、備註、重命名、移動、移到廢紙簍（可在訪達「放回原處」）、快速查看（空格）、在訪達中顯示（⌘R）。
- **自定義異體**：設置 → 每行一組互通的字（如「峯峰」），保存後自動重建索引。
- **恢復默認設置**：設置窗口左下角；自定義異體字和排除列表需另行勾選才會清除，資料庫、收藏、標籤、備註不受影響。

**去噪**：json、yaml、py、js、css、sql 等代碼與配置文件默認只收文件名；含 package.json、pyproject.toml、requirements.txt 等的代碼項目文件夾整個跳過；任何文件夾都可以右鍵「排除此文件夾」。這些都能在設置裡改。

支持全文的格式：txt/md/csv/html/json 等文本（自動識別 UTF-8、GB18030、Big5）、doc/docx/rtf/odt、epub、xlsx、pptx、帶文字層的 PDF。掃描版 PDF 只檢索文件名（側欄「無文字層」可列出）。日誌（.log）不收全文；json/csv/代碼等數據類文本超過 20 MB 只收文件名。

## 資源佔用（約 3 萬個文件、3 億多字的資料庫實測）

- 後台服務實際內存（physical footprint）約 30–50 MB，界面（WebKit）60–100 MB；長時間使用不會累積（3000 次混合請求後線程、文件句柄、內存都持平）。
  關鍵是以 `MallocSpaceEfficient=1` 啟動 Python：否則 macOS 分配器會囤積釋放的大塊內存，預覽長文本後可達 300 MB 以上。
- 全文緩存上限 2000 萬字，空閒 5 分鐘清空（模糊檢索用的字表、去標點的名稱表同時釋放，下次用時幾毫秒重建）；空閒時每分鐘請分配器歸還內存。
- 界面的 WebKit 只用內存數據存儲，不在磁盤上留網頁緩存、LocalStorage 等（舊版在 `~/Library/Caches/local.tongjian.app`、`~/Library/WebKit/local.tongjian.app` 留下的目錄在啟動時刪除）；設置（含閱讀字號）存在資料庫裡。
- 建索引時大 PDF（>80 MB）逐個抽取，抽取進程以「實用工具」級優先級運行，單個進程實際內存最大約 120 MB。
- 磁盤：WAL 限制在 32 MB；每天空閒時整理一次（合併全文索引、空閒頁超過兩成且大於 32 MB 時壓縮數據庫、清理已刪文件和舊版本的縮略圖，縮略圖總量上限 300 MB）；日誌超過 2 MB 時輪換。
- 文件名檢索用常駐內存的歸一化名稱表（2.8 萬個文件約 1 MB）預篩候選，再用正則覆核：2.8 萬個文件 1–12 毫秒；30 萬個文件建表 0.6 秒，檢索幾毫秒到 0.25 秒。

## 結構

```
app/server.py        本地 HTTP 服務（僅 127.0.0.1，帶令牌）
app/tj_core.py       SQLite 索引（FTS5，每個漢字一個詞元）、掃描線程、檢索、文件操作
app/tj_norm.py       字形歸一：精確 / 簡繁 / 異體 三級，一字對一字，長度不變
app/tj_fuzzy.py      模糊檢索：編輯距離近似匹配（Myers 位向量 + 鴿巢原理預篩）
app/tj_extract.py    各格式全文抽取
app/static/          界面（原生 JS/CSS，無構建步驟）
app/data/variants.json  歸一字表（由 tools/build_variants.py 生成）
macos/main.swift     App 外殼（WKWebView）
macos/tjhelper.swift PDFKit 抽取文字、移到廢紙簍
tools/build_variants.py  從 Unihan 18.0 + OpenCC 生成字表
```

- 測試模糊檢索：`python3 tests/test_fuzzy.py`（與暴力動態規劃逐處核對，確認不漏）
- 構建 App：`./build_app.sh`（生成 `build/通檢.app`）；`./build_app.sh --install` 同時安裝到 `/Applications`（App 運行中也可以執行；Python 改動在重啟後生效）
- 不用 App、在瀏覽器裡用：`python3 app/server.py`
- 重新生成字表：`python3 tools/build_variants.py`
- 索引數據庫：`~/Library/Application Support/TongJian/library.db`；日誌：`~/Library/Logs/TongJian.log`

## 字表

把 Unihan 的簡繁對應（kSimplified/kTraditionalVariant）、異體（kSemantic/kZ/kJapaneseNew/Old/kCompatibilityVariant）、OpenCC 的簡繁與日本、台灣、香港異體表，以及康熙部首、兼容漢字的 NFKC 映射合併，用並查集歸成等價類（約 1.78 萬字、8 千組）。

`kSemanticVariant` 常由罕用字居中，把不相干的規範字串成一類（如 敦—𠊋—龍、匝—𠂝—眾）。所以這條規則是：一條語義異體邊兩端所在的類若都已含規範字（GB2312 或 Big5），就不合併。`tools/sources/supplement.txt` 補了 Unihan 未收的舊字形（靑青、淸清、尙尚等）。

字表數據的來源與許可見 [tools/sources/README.md](tools/sources/README.md)。
