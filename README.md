# 🐾 펠리스 철학관

팀 닥터펠리스의 월간 익명 회고 게시판. 매달 회의요정이 주제를 던지면, 구성원들이 "익명의 고양이"가 되어 생각을 남깁니다.

## 핵심 특징
- **완전 익명**: 작성자 식별 정보(`author_id`)는 DB 뷰에서 아예 제외 → 브라우저로도 추적 불가
- **관리자만 실명 조회**: `admin_post_identity` RPC는 `is_admin` 계정에서만 동작
- **도메인 제한**: `@drfelis.com` 워크스페이스 계정만 로그인 (GCP 내부앱 + 앱 단 2중 검증)
- **누적 게시판**: 월별 주제가 카드로 쌓임
- **스레드 답글 + 발자국 공감**: 글/댓글 모두 익명 답글·🐾 반응 가능
- **수정/삭제**: 본인 글만 (관리자는 전체 삭제 가능)

## 기술 스택
- React 18 + Vite
- Supabase (Postgres + Auth + RLS)
- Google OAuth (Workspace 내부앱)

## 로컬 실행
```bash
npm install
cp .env.example .env   # 값 채우기
npm run dev
```

## 환경변수
| 키 | 설명 |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Publishable(anon) key |

## 관리자 지정
Supabase SQL Editor에서 (최초 1회, 로그인 후):
```sql
update public.profiles set is_admin = true where email = '본인@drfelis.com';
```

## 버전
- v1.0 — 초기 구축 (스키마/RLS/React 전체)
