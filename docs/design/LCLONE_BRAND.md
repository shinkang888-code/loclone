# Lclone 브랜드 가이드

고객 제공 브랜드 아이덴티티를 기반으로 UI·이미지 에셋을 중앙 관리합니다.

## 브랜드 요소

| 항목 | 값 |
|------|-----|
| 워드마크 | **L**clone (L 대문자 + clone 소문자) |
| 슬로건 EN | Innovating Digital Replication |
| 슬로건 KO | 디지털 복제 · 클론 · 납품 플랫폼 |

## 컬러

| 토큰 | HEX | 용도 |
|------|-----|------|
| brand-blue | `#4A7DB8` | Primary, CTA, 활성 메뉴 |
| brand-blue-light | `#6B9FD4` | 그라데이션, 링크 |
| brand-blue-dark | `#2D5A87` | 그라데이션 끝 |
| brand-glow | `#4DA3FF` | 포커스, 글로우 |
| brand-charcoal | `#141B26` | 카드, 패널 |
| brand-slate | `#1E2836` | 보조 배경 |
| background | `#0B1018` | 앱 배경 |

## 이미지 에셋 (`public/images/brand/`)

| 파일 | 용도 |
|------|------|
| `logo-mark.svg` | 파비콘, 사이드바, UI 아이콘 |
| `lclone-logo-mark.png` | 고해상도 로고 |
| `hero-replication.png` | 랜딩·히어로·사이드바 배경 |
| `hero-dashboard.png` | 대시보드 히어로, 기능 카드 |
| `lclone-brand-guide.png` | 원본 브랜드 가이드 (사용자 제공) |

## 코드에서 사용

```ts
import { LCLONE_BRAND } from "@/lib/brand/tokens";
import { BrandLogo } from "@/components/brand/brand-logo";
```

## 이미지 재생성

브랜드 톤: 메탈릭 블루, 차콜 다크, 프리미엄 B2B, 디지털 복제/파티클.

Cursor 이미지 생성 시 위 팔레트와 `lclone-brand-guide.png`를 레퍼런스로 사용하세요.
