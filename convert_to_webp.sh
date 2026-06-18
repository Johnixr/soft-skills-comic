#!/bin/bash
# 漫画 PNG -> 部署用 WebP。MAXDIM=0 表示保持原分辨率（最高清晰度）。
# 用法：bash convert_to_webp.sh
cd "$(dirname "$0")"
export MAXDIM=0      # 0=不缩放，保持原始分辨率
export Q=78
export TMPD=$(mktemp -d); trap 'rm -rf "$TMPD"' EXIT
convert_one() {
  local png="$1"; local webp="${png%.png}.webp"
  if [ "$MAXDIM" -gt 0 ]; then
    local tmp="$TMPD/$(echo "$png" | tr '/' '_')"
    cp "$png" "$tmp"; sips -Z "$MAXDIM" "$tmp" >/dev/null 2>&1
    cwebp -quiet -q "$Q" -m 6 -sharp_yuv "$tmp" -o "$webp"; rm -f "$tmp"
  else
    cwebp -quiet -q "$Q" -m 6 -sharp_yuv "$png" -o "$webp"   # 原分辨率
  fi
}
export -f convert_one
find chapter_* -name 'page_*.png' | sort | xargs -P 8 -I {} bash -c 'convert_one "$@"' _ {}
echo "DONE: maxdim=$MAXDIM q=$Q"
