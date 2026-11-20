#!/bin/bash
# 構建 通檢.app 到 build/ 目錄；加 --install 則同時安裝到 /Applications
set -euo pipefail
cd "$(dirname "$0")"
INSTALL=0
if [ "${1:-}" = "--install" ]; then INSTALL=1; fi
APP="build/通檢.app"
mkdir -p build
if [ ! -f build/AppIcon.icns ] || [ macos/make_icon.swift -nt build/AppIcon.icns ]; then
  swiftc -O -o build/make_icon macos/make_icon.swift
  build/make_icon build/icon_1024.png
  rm -rf build/AppIcon.iconset && mkdir build/AppIcon.iconset
  for s in 16 32 128 256 512; do
    sips -z $s $s build/icon_1024.png --out build/AppIcon.iconset/icon_${s}x${s}.png >/dev/null
    sips -z $((s*2)) $((s*2)) build/icon_1024.png --out build/AppIcon.iconset/icon_${s}x${s}@2x.png >/dev/null
  done
  iconutil -c icns build/AppIcon.iconset -o build/AppIcon.icns
  rm -rf build/AppIcon.iconset build/icon_1024.png build/make_icon
fi
# 先在臨時目錄構建，再同步進現有的 App 包（App 運行中也可以更新；Python 部分重啟後生效）
STAGE="build/.stage.app"
rm -rf "$STAGE"
mkdir -p "$STAGE/Contents/MacOS" "$STAGE/Contents/Resources/bin"
swiftc -O -o "$STAGE/Contents/MacOS/TongJian" macos/main.swift macos/webmenu.swift
swiftc -O -o "$STAGE/Contents/Resources/bin/tjhelper" macos/tjhelper.swift
rsync -a --exclude __pycache__ --exclude '*.pyc' app/ "$STAGE/Contents/Resources/app/"
cp macos/Info.plist "$STAGE/Contents/Info.plist"
cp build/AppIcon.icns "$STAGE/Contents/Resources/AppIcon.icns"
mkdir -p "$APP"
rsync -a --delete --checksum "$STAGE/" "$APP/"
rm -rf "$STAGE"
codesign --force --deep -s - "$APP" 2>/dev/null
echo "已生成 $APP"
if [ "$INSTALL" = 1 ]; then
  DEST="/Applications/通檢.app"
  mkdir -p "$DEST"
  rsync -a --delete --checksum "$APP/" "$DEST/"
  codesign --force --deep -s - "$DEST" 2>/dev/null
  echo "已安裝到 $DEST"
fi
