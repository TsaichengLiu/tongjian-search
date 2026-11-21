#!/bin/bash
# 打包給別人下載的版本：build/dist/TongJian-<版本>.dmg
#   · 通用二進制（Apple 芯片＋Intel），macOS 12 及以上
#   · 自帶 Python（python-build-standalone，兩個架構合併成一份通用的，去掉 pip、Tk、IDLE 等用不到的部分），
#     別人的電腦上不必另裝任何東西
#   · 沒有 Apple 開發者簽名（只做了本地簽名），第一次打開要在「系統設置 › 隱私與安全性」裡點「仍要打開」
# 用法：tools/make_dist.sh [版本號]   （默認取 Info.plist 的 CFBundleShortVersionString）
set -euo pipefail
cd "$(dirname "$0")/.."
VER="${1:-$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' macos/Info.plist)}"
MINOS=12.0
PBS_TAG=20261110
PBS_PY=3.12.16
SHA_arm64=2f11b8aa3726bdbd87dd9eb76568412faddf4f47e26913fa45d6a2e424972acd
SHA_x86_64=b78a4c479f1964ec484880bee567568266f68da102269fb93a05fe8716b45f91

OUT=build/dist
CACHE=build/pycache-dl            # 下載的 Python 留在這裡，重複打包不必再下
WORK="$OUT/work"
rm -rf "$WORK" && mkdir -p "$WORK" "$CACHE"

# ---- 1. 自帶的 Python：下載、校驗、解包
for a in arm64 x86_64; do
  triple=$([ $a = arm64 ] && echo aarch64 || echo x86_64)
  tgz="$CACHE/cpython-$PBS_PY-$a.tar.gz"
  if [ ! -f "$tgz" ]; then
    curl -fsSL -o "$tgz.part" \
      "https://github.com/astral-sh/python-build-standalone/releases/download/$PBS_TAG/cpython-$PBS_PY%2B$PBS_TAG-$triple-apple-darwin-install_only_stripped.tar.gz"
    mv "$tgz.part" "$tgz"
  fi
  want=$([ $a = arm64 ] && echo $SHA_arm64 || echo $SHA_x86_64)
  got=$(shasum -a 256 "$tgz" | awk '{print $1}')
  [ "$want" = "$got" ] || { echo "Python 下載校驗失敗（$a）"; rm -f "$tgz"; exit 1; }
  mkdir -p "$WORK/py-$a" && tar -xzf "$tgz" -C "$WORK/py-$a"
done

# ---- 2. 精簡並合併成通用版（純 Python 部分兩邊相同，可執行文件用 lipo 合併）
PY="$WORK/python"
cp -R "$WORK/py-arm64/python" "$PY"
X86="$WORK/py-x86_64/python"
( cd "$PY"
  rm -rf include share lib/pkgconfig lib/tcl* lib/tk* lib/itcl* lib/thread* lib/libtcl* lib/libpython3.12.dylib
  find bin -mindepth 1 ! -name python3.12 ! -name python3 ! -name python -delete
  cd lib/python3.12
  rm -rf site-packages/pip* ensurepip idlelib tkinter turtledemo turtle.py lib2to3 pydoc_data \
         config-3.12-darwin lib-dynload/_tkinter*.so
)
find "$PY" -type f | while read -r f; do
  if file -b "$f" | grep -q "Mach-O"; then
    lipo -create "$f" "$X86/${f#$PY/}" -output "$f.u" && mv "$f.u" "$f"
  fi
done

# ---- 3. App 本體：通用二進制，最低 macOS 12
APP="$WORK/通檢.app"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources/bin"
for a in arm64 x86_64; do
  swiftc -O -target $a-apple-macos$MINOS -o "$WORK/TongJian-$a" macos/main.swift macos/webmenu.swift
  swiftc -O -target $a-apple-macos$MINOS -o "$WORK/tjhelper-$a" macos/tjhelper.swift
done
lipo -create "$WORK/TongJian-arm64" "$WORK/TongJian-x86_64" -output "$APP/Contents/MacOS/TongJian"
lipo -create "$WORK/tjhelper-arm64" "$WORK/tjhelper-x86_64" -output "$APP/Contents/Resources/bin/tjhelper"
[ -f build/AppIcon.icns ] || ./build_app.sh >/dev/null          # 圖標由 build_app.sh 生成
cp build/AppIcon.icns "$APP/Contents/Resources/AppIcon.icns"
rsync -a --exclude __pycache__ --exclude '*.pyc' app/ "$APP/Contents/Resources/app/"
mv "$PY" "$APP/Contents/Resources/python"
sed "s#<string>1.0</string>#<string>$VER</string>#" macos/Info.plist > "$APP/Contents/Info.plist"

# ---- 4. 本地簽名：先簽包內每個可執行文件，再簽整個 App
find "$APP/Contents/Resources" -type f | while read -r f; do
  if file -b "$f" | grep -q "Mach-O"; then codesign --force -s - "$f"; fi
done
codesign --force -s - "$APP"
codesign --verify --deep --strict "$APP"

# ---- 5. 磁盤映像：App ＋「應用程式」的替身 ＋ 說明
DMG="$OUT/TongJian-$VER.dmg"
SRC="$WORK/dmg"
mkdir -p "$SRC"
mv "$APP" "$SRC/"
ln -s /Applications "$SRC/應用程式"
cat > "$SRC/安裝說明.txt" <<'EOF'
通檢 —— 簡繁異體通用的本機文件檢索

安裝：把「通檢」拖到旁邊的「應用程式」文件夾裡。

第一次打開：
  這個 App 沒有 Apple 開發者簽名，第一次雙擊時 macOS 會提示無法驗證、不讓打開。
  請點「完成」關掉提示，打開「系統設置 › 隱私與安全性」，往下找到關於「通檢」的提示，
  點「仍要打開」，再確認一次（可能要輸入登錄密碼）。之後就和普通 App 一樣雙擊打開。
  （macOS 14 及更早：也可以按住 control 點按「通檢」，選「打開」。）

打開後點「添加文件夾」，選要檢索的文件夾即可。索引存在
  ~/Library/Application Support/TongJian/
刪除 App 和這個文件夾即完全卸載。

說明與源碼：https://github.com/TsaichengLiu/tongjian-search
EOF
rm -f "$DMG"
hdiutil create -quiet -volname "通檢 $VER" -srcfolder "$SRC" -fs HFS+ -format ULFO "$DMG"
rm -rf "$WORK"
echo "已生成 $DMG（$(du -h "$DMG" | cut -f1)）"
