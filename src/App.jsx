import { useState, useEffect, useCallback } from "react";
import { supabase, ALLOWED_DOMAIN } from "./supabaseClient";
import { Paw, CatFace, Icon, catColor } from "./icons.jsx";

const LOGO_URL = "/felis-logo.svg";

/* ============ 공통 유틸 ============ */
function timeAgo(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "방금";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

function Toast({ msg, err }) {
  if (!msg) return null;
  return <div className={`toast ${err ? "err" : ""}`}>{msg}</div>;
}

function CatAvatar({ seq, sm }) {
  const c = catColor(seq);
  return (
    <div className={`cat-avatar ${sm ? "sm" : ""}`} style={{ background: c.bg, color: c.fg }}>
      <CatFace />
    </div>
  );
}

/* ============ 로그인 화면 ============ */
function Login({ onError, error }) {
  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: { hd: ALLOWED_DOMAIN, prompt: "select_account" },
      },
    });
    if (error) onError(error.message);
  };
  return (
    <div className="login-screen">
      <div className="login-logo" dangerouslySetInnerHTML={{ __html: "" }}>
        <img src={LOGO_URL} alt="닥터펠리스" style={{ width: "100%", height: "100%" }} />
      </div>
      <h1 className="login-title">펠리스 철학관</h1>
      <p className="login-flags">🐾 팀 닥터펠리스가 쌓아온 이야기들 🐾</p>
      <p className="login-quote">
        매달 하나의 물음 앞에서<br />우리는 잠시 고양이가 됩니다.<br />이름을 지우고, 마음만 남겨요.
      </p>
      <button className="btn-google" onClick={signIn}>
        <svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.8-6.8C35.6 2.4 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.2 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-17z" /><path fill="#FBBC05" d="M10.5 28.3c-.5-1.4-.7-2.9-.7-4.3s.3-3 .7-4.3l-7.9-6.1C1 16.7 0 20.2 0 24s1 7.3 2.6 10.4l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.5l-7.1-5.5c-2 1.3-4.6 2.1-7.9 2.1-6.3 0-11.6-3.7-13.5-9.3l-7.9 6.1C6.5 42.6 14.6 48 24 48z" /></svg>
        drfelis.com 계정으로 들어가기
      </button>
      <p className="login-note">@{ALLOWED_DOMAIN} 워크스페이스 계정만 입장할 수 있어요</p>
      {error && <div className="login-err">{error}</div>}
    </div>
  );
}

/* ============ 발자국(공감) 버튼 ============ */
function PawButton({ targetType, targetId, count, reacted, onToggle }) {
  const [pop, setPop] = useState(false);
  const click = () => {
    if (!reacted) { setPop(true); setTimeout(() => setPop(false), 350); }
    onToggle(targetType, targetId, reacted);
  };
  return (
    <button className={`act ${reacted ? "reacted" : ""}`} onClick={click} aria-label="발자국 공감">
      <Paw className={`paw ${pop ? "paw-pop" : ""}`} />
      {count > 0 ? count : "공감"}
    </button>
  );
}

/* ============ 댓글 ============ */
function Comment({ c, reaction, onToggleReaction, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(c.body);
  const save = () => { if (draft.trim()) { onEdit(c.id, draft.trim()); setEditing(false); } };
  return (
    <div>
      <div className="comment-head">
        <CatAvatar seq={c.anon_seq} sm />
        <span className="comment-author">익명의 고양이 #{c.anon_seq}</span>
        {c.is_mine && <span className="post-mine-tag">나</span>}
        {c.admin_email && <span className="comment-author" style={{ color: "#ffb38a" }}>· {c.admin_email}</span>}
        <span className="comment-time">{timeAgo(c.created_at)}</span>
      </div>
      {editing ? (
        <>
          <textarea className="post-edit-area" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <div className="comment-actions">
            <button className="act-mini" onClick={save}>저장</button>
            <button className="act-mini" onClick={() => { setDraft(c.body); setEditing(false); }}>취소</button>
          </div>
        </>
      ) : (
        <>
          <div className="comment-body">{c.body}</div>
          <div className="comment-actions">
            <PawButton targetType="comment" targetId={c.id} count={reaction.cnt} reacted={reaction.mine} onToggle={onToggleReaction} />
            {c.is_mine && (
              <>
                <button className="act-mini" onClick={() => setEditing(true)}>수정</button>
                <button className="act-mini del" onClick={() => onDelete(c.id)}>삭제</button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ============ 의견(글) ============ */
function Post({ post, comments, reactions, isAdmin, onToggleReaction, onEditPost, onDeletePost, onAddComment, onEditComment, onDeleteComment }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.body);
  const [reply, setReply] = useState("");
  const [showReply, setShowReply] = useState(false);
  const r = reactions[`post:${post.id}`] || { cnt: 0, mine: false };

  const saveEdit = () => { if (draft.trim()) { onEditPost(post.id, draft.trim()); setEditing(false); } };
  const sendReply = () => { if (reply.trim()) { onAddComment(post.id, reply.trim()); setReply(""); setShowReply(false); } };

  return (
    <div className="post">
      <div className="post-head">
        <CatAvatar seq={post.anon_seq} />
        <span className="post-author">익명의 고양이 #{post.anon_seq}</span>
        {post.is_mine && <span className="post-mine-tag">나</span>}
        {isAdmin && post.admin_email ? (
          <span className="post-admin-name">{post.admin_email}</span>
        ) : (
          <span className="post-time">{timeAgo(post.created_at)}</span>
        )}
      </div>

      {editing ? (
        <>
          <textarea className="post-edit-area" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <div className="post-actions">
            <button className="act-mini" onClick={saveEdit}>저장</button>
            <button className="act-mini" onClick={() => { setDraft(post.body); setEditing(false); }}>취소</button>
          </div>
        </>
      ) : (
        <>
          <div className="post-body">{post.body}</div>
          <div className="post-actions">
            <PawButton targetType="post" targetId={post.id} count={r.cnt} reacted={r.mine} onToggle={onToggleReaction} />
            <button className="act" onClick={() => setShowReply((v) => !v)}>
              <Icon name="message" size={15} />
              답글 {comments.length > 0 ? comments.length : ""}
            </button>
            {post.is_mine && (
              <div className="act-right">
                <button className="act-mini" onClick={() => setEditing(true)}><Icon name="edit" size={13} /></button>
                <button className="act-mini del" onClick={() => onDeletePost(post.id)}><Icon name="trash" size={13} /></button>
              </div>
            )}
          </div>
        </>
      )}

      {(comments.length > 0 || showReply) && (
        <div className="thread">
          {comments.map((c) => (
            <Comment
              key={c.id} c={c}
              reaction={reactions[`comment:${c.id}`] || { cnt: 0, mine: false }}
              onToggleReaction={onToggleReaction}
              onEdit={onEditComment} onDelete={onDeleteComment}
            />
          ))}
          {showReply && (
            <div className="reply-box">
              <textarea placeholder="익명으로 답글 남기기..." value={reply} onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendReply(); }} />
              <button className="btn-reply" onClick={sendReply}>남기기</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============ 주제 상세 ============ */
function TopicDetail({ topic, profile, onBack, showToast }) {
  const [posts, setPosts] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [reactions, setReactions] = useState({});
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [adminReveal, setAdminReveal] = useState(false);
  const [identityMap, setIdentityMap] = useState({});
  const isAdmin = profile?.is_admin;

  const load = useCallback(async () => {
    setLoading(true);
    const { data: ps } = await supabase
      .from("posts_public").select("*").eq("topic_id", topic.id).order("created_at", { ascending: true });
    const { data: cs } = await supabase
      .from("comments_public").select("*").eq("topic_id", topic.id).order("created_at", { ascending: true });
    const { data: rc } = await supabase.from("reaction_counts").select("*");

    const rmap = {};
    (rc || []).forEach((x) => { rmap[`${x.target_type}:${x.target_id}`] = { cnt: x.cnt, mine: x.reacted_by_me }; });
    const cmap = {};
    (cs || []).forEach((c) => { (cmap[c.post_id] = cmap[c.post_id] || []).push(c); });

    setPosts(ps || []);
    setCommentsByPost(cmap);
    setReactions(rmap);
    setLoading(false);
  }, [topic.id]);

  useEffect(() => { load(); }, [load]);

  const submitPost = async () => {
    const body = newPost.trim();
    if (!body) return;
    setNewPost("");
    const { error } = await supabase.rpc("create_post", { p_topic: topic.id, p_body: body });
    if (error) { showToast("저장에 실패했어요. 다시 시도해 주세요", true); setNewPost(body); }
    else { showToast("🐾 발자국을 남겼어요"); load(); }
  };

  const addComment = async (postId, body) => {
    const { error } = await supabase.rpc("create_comment", { p_post: postId, p_body: body });
    if (error) showToast("답글 저장 실패", true); else load();
  };

  const editPost = async (id, body) => {
    const { error } = await supabase.from("posts").update({ body, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) showToast("수정 실패", true); else load();
  };
  const deletePost = async (id) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) showToast("삭제 실패", true); else { showToast("지웠어요"); load(); }
  };
  const editComment = async (id, body) => {
    const { error } = await supabase.from("comments").update({ body, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) showToast("수정 실패", true); else load();
  };
  const deleteComment = async (id) => {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) showToast("삭제 실패", true); else load();
  };

  const toggleReaction = async (targetType, targetId, reacted) => {
    const key = `${targetType}:${targetId}`;
    // 낙관적 업데이트
    setReactions((prev) => {
      const cur = prev[key] || { cnt: 0, mine: false };
      return { ...prev, [key]: { cnt: reacted ? cur.cnt - 1 : cur.cnt + 1, mine: !reacted } };
    });
    if (reacted) {
      await supabase.from("reactions").delete().match({ target_type: targetType, target_id: targetId, author_id: profile.id });
    } else {
      await supabase.from("reactions").insert({ target_type: targetType, target_id: targetId, author_id: profile.id });
    }
  };

  const toggleReveal = async () => {
    if (adminReveal) { setAdminReveal(false); return; }
    const { data, error } = await supabase.rpc("admin_post_identity", { p_topic: topic.id });
    if (error) { showToast("관리자 권한이 없어요", true); return; }
    const m = {};
    (data || []).forEach((x) => { m[x.post_id] = x.email; });
    setIdentityMap(m);
    setAdminReveal(true);
  };

  const decoratedPosts = posts.map((p) => ({ ...p, admin_email: adminReveal ? identityMap[p.id] : null }));

  return (
    <div className="wrap">
      <button className="back-link" onClick={onBack}><Icon name="back" size={15} /> 모든 주제</button>

      <div className="detail-topic">
        <span className="detail-fairy"><Icon name="sparkle" size={13} /> 회의요정</span>
        <div className="detail-q">{topic.title}</div>
        <div className="detail-host">
          {topic.month_label}{topic.host_label ? ` · 진행자 ${topic.host_label}` : ""}
        </div>
      </div>

      {isAdmin && (
        <div className="admin-bar" style={{ marginTop: 12 }}>
          <span className="admin-bar-label"><Icon name="eye" size={14} /> 관리자 — 작성자 실명은 나에게만 보여요</span>
          <button className="reveal-toggle" onClick={toggleReveal}>
            <Icon name={adminReveal ? "eyeoff" : "eye"} size={12} /> {adminReveal ? "실명 숨기기" : "실명 보기"}
          </button>
        </div>
      )}

      <div className="section-label">내 생각 남기기</div>
      <div className="composer">
        <textarea placeholder="이 물음 앞에서 떠오른 생각을 적어보세요. 아무도 누가 썼는지 몰라요."
          value={newPost} onChange={(e) => setNewPost(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitPost(); }} />
        <div className="composer-row">
          <span className="composer-hint"><Paw className="paw" /> 익명으로 게시됩니다 · ⌘+Enter</span>
          <button className="btn-primary" onClick={submitPost} disabled={!newPost.trim()}>남기기</button>
        </div>
      </div>

      <div className="section-label">고양이들의 이야기 {posts.length > 0 ? `(${posts.length})` : ""}</div>

      {loading ? (
        <div className="loading"><div className="spinner" />이야기를 불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div className="empty"><Icon name="moon" size={44} /><p>아직 아무도 발자국을 남기지 않았어요.<br />첫 번째 고양이가 되어보세요.</p></div>
      ) : (
        decoratedPosts.map((p) => (
          <Post
            key={p.id} post={p} comments={commentsByPost[p.id] || []} reactions={reactions} isAdmin={isAdmin}
            onToggleReaction={toggleReaction} onEditPost={editPost} onDeletePost={deletePost}
            onAddComment={addComment} onEditComment={editComment} onDeleteComment={deleteComment}
          />
        ))
      )}
    </div>
  );
}

/* ============ 관리자: 새 주제 만들기 ============ */
function NewTopicForm({ onCreated, showToast }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState("");
  const [title, setTitle] = useState("");
  const [host, setHost] = useState("");

  const create = async () => {
    if (!month.trim() || !title.trim()) { showToast("월과 주제를 입력해 주세요", true); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("topics").insert({
      month_label: month.trim(), title: title.trim(), host_label: host.trim() || null, created_by: user.id,
    });
    if (error) showToast("주제 생성 실패", true);
    else { showToast("새 주제를 열었어요"); setMonth(""); setTitle(""); setHost(""); setOpen(false); onCreated(); }
  };

  if (!open) {
    return (
      <div className="admin-bar">
        <span className="admin-bar-label"><Icon name="sparkle" size={14} /> 회의요정 — 이번 달 주제를 배정하세요</span>
        <button className="reveal-toggle" onClick={() => setOpen(true)}>+ 새 주제 열기</button>
      </div>
    );
  }
  return (
    <div className="new-topic-form">
      <h3>🐾 이번 달 철학관 주제</h3>
      <div className="field"><label>월 표시</label><input placeholder="예: 26년 6월" value={month} onChange={(e) => setMonth(e.target.value)} /></div>
      <div className="field"><label>주제 (질문)</label><textarea rows={2} placeholder="예: 올해 가장 잘한 결정 하나와, 미뤄둔 일 하나는?" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div className="field"><label>진행자 (선택)</label><input placeholder="예: 로지" value={host} onChange={(e) => setHost(e.target.value)} /></div>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button className="btn-primary" onClick={create}>주제 열기</button>
        <button className="btn-ghost" onClick={() => setOpen(false)}>취소</button>
      </div>
    </div>
  );
}

/* ============ 게시판(주제 목록) ============ */
function Board({ profile, onOpen, showToast }) {
  const [topics, setTopics] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: ts } = await supabase.from("topics").select("*").order("created_at", { ascending: false });
    const { data: ps } = await supabase.from("posts_public").select("topic_id");
    const cmap = {};
    (ps || []).forEach((p) => { cmap[p.topic_id] = (cmap[p.topic_id] || 0) + 1; });
    setTopics(ts || []);
    setCounts(cmap);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="wrap">
      <div className="board-head">
        <div className="board-eyebrow">monthly reflection</div>
        <h1 className="board-h1">펠리스 철학관</h1>
        <p className="board-desc">매달 하나의 물음을, 익명의 고양이가 되어 함께 마주해요.</p>
      </div>

      {profile?.is_admin && <NewTopicForm onCreated={load} showToast={showToast} />}

      {loading ? (
        <div className="loading"><div className="spinner" />주제를 불러오는 중...</div>
      ) : topics.length === 0 ? (
        <div className="empty"><Icon name="book" size={44} /><p>아직 열린 주제가 없어요.</p></div>
      ) : (
        topics.map((t) => (
          <div key={t.id} className="topic-card" onClick={() => onOpen(t)}>
            <div className="topic-month">{t.month_label}</div>
            <div className="topic-body">
              <div className="topic-q">{t.title}</div>
              <div className="topic-meta">
                {t.host_label && <span><Icon name="user" size={12} /> {t.host_label}</span>}
                <span><Paw className="paw" /> {counts[t.id] || 0}개의 이야기</span>
              </div>
            </div>
            <span className="topic-arrow"><Icon name="arrow" size={18} /></span>
          </div>
        ))
      )}
    </div>
  );
}

/* ============ 루트 앱 ============ */
export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [activeTopic, setActiveTopic] = useState(null);
  const [toast, setToast] = useState({ msg: "", err: false });

  const showToast = (msg, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast({ msg: "", err: false }), 2400);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); return; }
    const email = session.user.email || "";
    // 2차 도메인 안전장치: 내부앱(GCP)이 1차로 막지만 한번 더 검증
    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      setLoginError(`@${ALLOWED_DOMAIN} 계정만 입장할 수 있어요.`);
      supabase.auth.signOut();
      return;
    }
    supabase.from("profiles").select("*").eq("id", session.user.id).single()
      .then(({ data }) => setProfile(data || { id: session.user.id, email, is_admin: false }));
  }, [session]);

  const signOut = async () => { await supabase.auth.signOut(); setActiveTopic(null); };

  if (authLoading) return <div className="loading" style={{ paddingTop: "30vh" }}><div className="spinner" />문을 여는 중...</div>;
  if (!session) return <Login onError={setLoginError} error={loginError} />;
  if (!profile) return <div className="loading" style={{ paddingTop: "30vh" }}><div className="spinner" />입장하는 중...</div>;

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <span className="brand-logo" onClick={() => setActiveTopic(null)} style={{ cursor: "pointer" }}>
            <img src={LOGO_URL} alt="" style={{ width: "100%", height: "100%" }} />
          </span>
          <div className="brand-text">
            <span className="brand-title">펠리스 철학관</span>
            <span className="brand-sub">팀 닥터펠리스</span>
          </div>
          <div className="topbar-right">
            <span className="me-chip">
              {profile.is_admin && <span className="admin-dot" />}
              {profile.email}
            </span>
            <button className="btn-ghost" onClick={signOut}><Icon name="logout" size={13} /></button>
          </div>
        </div>
      </div>

      {activeTopic ? (
        <TopicDetail topic={activeTopic} profile={profile} onBack={() => setActiveTopic(null)} showToast={showToast} />
      ) : (
        <Board profile={profile} onOpen={setActiveTopic} showToast={showToast} />
      )}

      <Toast msg={toast.msg} err={toast.err} />
    </>
  );
}
