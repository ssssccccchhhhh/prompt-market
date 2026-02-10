# 10. 소셜 기능 — 스타, 리뷰, 다운로드 카운트

> Phase 2.5 | 예상: 2일 | 선행: 07-market-ui, 08-cli

## 목표

패키지에 스타, 리뷰, 다운로드 카운트 기능 추가. 리더보드 정렬의 근거.

---

## 데이터 모델

### Phase 2: JSON 파일 기반

```
jetsong-toy/
└── data/
    ├── stats.json          ← { "jira": { installs: 38, stars: ["songdh", "kimoo"] } }
    └── reviews.json        ← { "quick-review": [{ author: "kimoo", rating: 5, ... }] }
```

```typescript
// data/stats.json
{
  "jira": {
    "installs": 38,
    "stars": ["ssssccccchhhhh", "kimoo", "leeoo"]
  },
  "quick-review": {
    "installs": 47,
    "stars": ["ssssccccchhhhh", "kimoo"]
  }
}

// data/reviews.json
{
  "quick-review": [
    {
      "author": "kimoo",
      "rating": 5,
      "comment": "N+1 잡아줘서 신세계",
      "createdAt": "2026-02-10T10:00:00Z"
    }
  ]
}
```

### Phase 3: DB 전환 시

```sql
-- Supabase/Turso
CREATE TABLE installs (
  package_id TEXT,
  user_id TEXT,
  installed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stars (
  package_id TEXT,
  user_id TEXT,
  PRIMARY KEY (package_id, user_id)
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  package_id TEXT,
  author TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Routes

### 다운로드 카운트

```typescript
// src/app/api/stats/install/route.ts
export async function POST(req: Request) {
  const { packageId } = await req.json();
  // stats.json 읽기 → installs++ → 쓰기
  return Response.json({ ok: true });
}
```

호출 시점: CLI의 `npx jetsong install` 완료 시

### 스타 토글

```typescript
// src/app/api/stats/star/route.ts
export async function POST(req: Request) {
  const { packageId, userId } = await req.json();
  // stars 배열에서 userId toggle (add/remove)
  return Response.json({ starred: true/false });
}
```

호출 시점: 웹 UI 스타 버튼 클릭 or CLI `npx jetsong star`

### 리뷰 작성

```typescript
// src/app/api/reviews/route.ts
export async function POST(req: Request) {
  const { packageId, author, rating, comment } = await req.json();
  // reviews.json에 추가
  return Response.json({ ok: true });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const packageId = searchParams.get('packageId');
  // reviews.json에서 해당 패키지 리뷰 반환
  return Response.json({ reviews: [...] });
}
```

---

## 사용자 식별 (Phase 2: 심플)

Phase 2에서는 DB 없으니 사용자 인증도 심플하게:

```typescript
// 사내 환경: 이름 기반 (중복 없다는 전제)
// CLI: git config user.name 자동 추출
const author = execSync('git config user.name').toString().trim();

// 웹: 최초 방문 시 이름 입력 → localStorage 저장
// (토큰이 아닌 이름만이므로 보안 이슈 없음)
```

Phase 3 (오픈소스): GitHub OAuth로 전환.

---

## UI 컴포넌트

### 스타 버튼

```tsx
// components/StarButton.tsx
'use client';

export function StarButton({ packageId, initialStars, isStarred }) {
  const [starred, setStarred] = useState(isStarred);
  const [count, setCount] = useState(initialStars);
  
  async function toggle() {
    const res = await fetch('/api/stats/star', {
      method: 'POST',
      body: JSON.stringify({ packageId, userId: getUser() }),
    });
    const { starred: newState } = await res.json();
    setStarred(newState);
    setCount(c => newState ? c + 1 : c - 1);
  }
  
  return (
    <button onClick={toggle}>
      {starred ? '⭐' : '☆'} {count}
    </button>
  );
}
```

### 리뷰 섹션

```tsx
// components/ReviewSection.tsx
// 별점 (1-5) + 코멘트 + 제출
// 한 패키지에 한 사람 1개만 (upsert)
```

### 리더보드 정렬

```tsx
// 정렬 옵션
type SortKey = 'installs' | 'stars' | 'rating' | 'recent';

// 기본: installs 내림차순 (skills.sh와 동일)
// Trending: 최근 7일 installs
// Hot: installs × stars 가중치
```

---

## 완료 조건

- [ ] CLI install 시 다운로드 카운트 증가
- [ ] 웹 UI 스타 버튼 토글 동작
- [ ] 리뷰 작성 + 목록 표시
- [ ] 리더보드에서 정렬 변경 동작 (All Time / Trending)
- [ ] 패키지 상세 페이지에 stats 표시 (⬇ N │ ⭐ N │ ★ 4.5)

---

## 다음

→ `11-versioning.md` (버전 관리 + Changelog)
