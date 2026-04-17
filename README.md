# ETF 괴리율 트래커

TIGER미국배당다우존스(458730) 등 한국 상장 ETF의 실시간 괴리율을 계산하여 매수/매도 타이밍을 판단하는 모바일 웹앱.

## 파일 구조

```
├── index.html              # 메인 앱 (단일 HTML 파일)
├── functions/api/proxy.js  # Cloudflare Pages Function (CORS 프록시)
└── README.md
```

## 데이터 출처

| 항목 | 소스 | 엔드포인트 |
|-----|------|-----------|
| SCHD / QQQ / SPY 실시간 가격 | Yahoo Finance | `query1.finance.yahoo.com/v8/finance/chart/{SYMBOL}` |
| 458730 / 133690 / 360750 실시간 가격 | Yahoo Finance `.KS` | `.../chart/458730.KS` |
| USD/KRW 실제 환율 | Yahoo Finance | `.../chart/USDKRW=X` |
| Upbit USDT 가격 (24/7) | Upbit Public API | `api.upbit.com/v1/ticker?markets=KRW-USDT` |
| 김프 계산 | 자체 계산 | `(Upbit_USDT / Yahoo_USDKRW - 1) × 100` |

## 계산식

```
적정가격 = 어제_한국종가 × (US현재 / US어제) × (FX현재 / FX어제)
괴리율 (%) = (지금_한국가격 - 적정가격) / 적정가격 × 100
```

- **매수 시그널**: 괴리율 ≤ -0.5% (시장가가 적정가보다 쌈)
- **매도 시그널**: 괴리율 ≥ +0.5% (시장가가 적정가보다 비쌈)
- **관망**: 그 외

## Cloudflare Pages 배포

1. GitHub 저장소를 Cloudflare Pages에 연결
2. Build settings: **Framework: None**, **Build command: (비움)**, **Build output directory: `/`**
3. Deploy
4. `functions/api/proxy.js`는 자동으로 `/api/proxy` 엔드포인트로 배포됨

배포 후 앱은 `/api/proxy`를 1순위로 사용 (동일 도메인, 매우 빠름).
로컬에서 열 때는 자동으로 공용 CORS 프록시(corsproxy.io 등)로 폴백.

## 로컬 테스트

`index.html`을 브라우저로 직접 열면 됩니다. 공용 CORS 프록시를 거치므로 Cloudflare 배포 버전보다 느릴 수 있음.
