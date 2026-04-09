// ============================================================
// 니치 커뮤니티 플랫폼 - 커뮤니티허브
// Vanilla JS SPA with localStorage
// ============================================================

// ---- Utility ----
const $ = id => document.getElementById(id);
const uid = () => 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
const timeAgo = (ts) => {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}일 전`;
  return new Date(ts).toLocaleDateString('ko-KR');
};

// ---- Storage ----
const STORAGE_KEY = 'niche_community_v1';

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  return initDemoData();
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---- State ----
let state = {};
let currentPage = 'feed';
let sortMode = 'latest';
let activeChannel = 'all';

// ---- Avatar Colors ----
const avatarColors = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #3b82f6, #2563eb)',
  'linear-gradient(135deg, #8b5cf6, #a855f7)',
  'linear-gradient(135deg, #ef4444, #dc2626)',
  'linear-gradient(135deg, #14b8a6, #0d9488)',
];

function getAvatarColor(userId) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = ((hash << 5) - hash) + userId.charCodeAt(i);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

// ---- Demo Data Init ----
function initDemoData() {
  const now = Date.now();
  const DAY = 86400000;

  const users = [
    {
      id: 'user_admin', nickname: '김관리', email: 'admin@hub.kr',
      bio: '커뮤니티허브 운영자입니다 🚀', membership: 'premium',
      badges: ['badge_admin', 'badge_premium', 'badge_founder', 'badge_writer'],
      joinedAt: now - 180 * DAY, role: 'admin'
    },
    {
      id: 'user_2', nickname: '박창업', email: 'park@startup.kr',
      bio: 'AI 스타트업 대표 | 시리즈A 준비 중', membership: 'premium',
      badges: ['badge_premium', 'badge_writer', 'badge_popular'],
      joinedAt: now - 90 * DAY, role: 'member'
    },
    {
      id: 'user_3', nickname: '이개발', email: 'lee@dev.kr',
      bio: '풀스택 개발자 | 사이드 프로젝트 러버', membership: 'free',
      badges: ['badge_writer'],
      joinedAt: now - 60 * DAY, role: 'member'
    },
    {
      id: 'user_4', nickname: '최마케팅', email: 'choi@mkt.kr',
      bio: '그로스 마케터 | 퍼포먼스 마케팅 전문', membership: 'premium',
      badges: ['badge_premium', 'badge_popular'],
      joinedAt: now - 45 * DAY, role: 'member'
    },
    {
      id: 'user_5', nickname: '정디자인', email: 'jung@design.kr',
      bio: 'UX/UI 디자이너 | 피그마 마스터', membership: 'free',
      badges: ['badge_first_post'],
      joinedAt: now - 30 * DAY, role: 'member'
    },
    {
      id: 'user_6', nickname: '한투자', email: 'han@vc.kr',
      bio: '엔젤투자자 | 초기 스타트업 투자', membership: 'premium',
      badges: ['badge_premium', 'badge_founder'],
      joinedAt: now - 120 * DAY, role: 'member'
    },
    {
      id: 'user_7', nickname: '윤기획', email: 'yoon@plan.kr',
      bio: 'PM | 프로덕트 매니저', membership: 'free',
      badges: ['badge_first_post', 'badge_writer'],
      joinedAt: now - 20 * DAY, role: 'member'
    },
  ];

  const channels = [
    { id: 'ch_general', name: '자유게시판', description: '자유롭게 이야기해요', icon: '💬', accessLevel: 'all', postCount: 0 },
    { id: 'ch_startup', name: '창업 이야기', description: '창업 경험과 노하우 공유', icon: '🚀', accessLevel: 'all', postCount: 0 },
    { id: 'ch_tech', name: '기술 토론', description: '개발, AI, 기술 트렌드', icon: '💻', accessLevel: 'all', postCount: 0 },
    { id: 'ch_marketing', name: '마케팅 전략', description: '그로스 해킹, 퍼포먼스 마케팅', icon: '📢', accessLevel: 'all', postCount: 0 },
    { id: 'ch_invest', name: '투자/펀딩', description: '투자 유치, VC 미팅 팁', icon: '💰', accessLevel: 'premium', postCount: 0 },
    { id: 'ch_mentoring', name: '멘토링', description: '선배 창업가의 1:1 조언', icon: '🎓', accessLevel: 'premium', postCount: 0 },
  ];

  const posts = [
    {
      id: uid(), channelId: 'ch_startup', authorId: 'user_2', title: '시리즈A 투자 유치 후기 (feat. 100억 밸류에이션)',
      content: '안녕하세요, AI 스타트업을 운영 중인 박창업입니다.\n\n드디어 시리즈A 투자 유치에 성공했습니다! 🎉\n\n밸류에이션 100억원에 30억 투자를 받았는데요, 과정에서 느꼈던 점들을 공유하려 합니다.\n\n1. IR 자료는 10장 이내로 핵심만\n2. 숫자로 증명하는 PMF\n3. 팀 역량이 50% 이상 차지\n4. VC마다 관심 포인트가 다름\n\n궁금한 점 있으시면 댓글로 남겨주세요!',
      likes: 47, likedBy: ['user_3', 'user_4', 'user_5', 'user_6', 'user_7'],
      comments: [
        { id: uid(), authorId: 'user_6', content: '축하합니다! 팀 구성이 정말 탄탄하시더라구요. 앞으로도 응원합니다 🙌', createdAt: now - 4 * DAY + 3600000 },
        { id: uid(), authorId: 'user_3', content: 'IR 자료 10장 이내 팁 정말 공감합니다. 저도 줄이고 나니 반응이 달라졌어요', createdAt: now - 4 * DAY + 7200000 },
        { id: uid(), authorId: 'user_admin', content: '소중한 경험 공유 감사합니다! 📌 공지로 고정할게요', createdAt: now - 3 * DAY },
      ],
      createdAt: now - 5 * DAY, isPremium: false
    },
    {
      id: uid(), channelId: 'ch_tech', authorId: 'user_3', title: 'Next.js vs Remix - 2024년 프레임워크 선택 가이드',
      content: '사이드 프로젝트 시작하면서 프레임워크 고민을 많이 했는데요.\n\n결론부터 말하면, 프로젝트 성격에 따라 다릅니다.\n\n📌 Next.js가 나은 경우:\n- SEO가 중요한 서비스\n- Vercel 배포 예정\n- 큰 커뮤니티/생태계 필요\n\n📌 Remix가 나은 경우:\n- 폼 처리가 많은 앱\n- 웹 표준에 가까운 개발\n- 데이터 로딩 패턴이 복잡한 경우\n\n여러분은 어떤 프레임워크를 선호하시나요?',
      likes: 32, likedBy: ['user_2', 'user_4', 'user_7'],
      comments: [
        { id: uid(), authorId: 'user_7', content: 'Next.js 쓰고 있는데 App Router 전환이 아직 좀 불안정한 것 같아요', createdAt: now - 2 * DAY },
        { id: uid(), authorId: 'user_2', content: '우리 팀은 Remix로 갈아탔는데 만족 중입니다', createdAt: now - 1 * DAY },
      ],
      createdAt: now - 3 * DAY, isPremium: false
    },
    {
      id: uid(), channelId: 'ch_marketing', authorId: 'user_4', title: '퍼포먼스 마케팅 실전: CAC를 50% 줄인 방법',
      content: '지난 3개월간 CAC(고객획득비용)를 50% 줄인 실전 노하우를 공유합니다.\n\n핵심은 "오디언스 세분화"였습니다.\n\n1️⃣ 기존: 넓은 타겟 → 높은 CPC\n2️⃣ 개선: 마이크로 세그먼트 → 낮은 CPC + 높은 CVR\n\n특히 카카오 모먼트에서 관심사 타겟팅 + 리타겟팅 조합이 효과적이었어요.\n\n자세한 수치는 프리미엄 채널에서 공유할게요!',
      likes: 28, likedBy: ['user_2', 'user_admin', 'user_5'],
      comments: [
        { id: uid(), authorId: 'user_5', content: '마케팅 데이터 분석 시각화도 공유해주실 수 있나요?', createdAt: now - 1 * DAY },
      ],
      createdAt: now - 2 * DAY, isPremium: false
    },
    {
      id: uid(), channelId: 'ch_general', authorId: 'user_5', title: '디자이너가 보는 좋은 B2B SaaS UI/UX 사례',
      content: '최근 분석한 B2B SaaS 제품 중 UX가 뛰어난 사례들입니다.\n\n✨ Notion - 블록 에디터의 정석\n✨ Linear - 미니멀한 프로젝트 관리\n✨ Figma - 협업 중심 디자인 도구\n✨ Vercel - 개발자 경험(DX) 최고\n\n공통점: 복잡한 기능도 심플하게, 온보딩이 직관적',
      likes: 19, likedBy: ['user_3', 'user_7'],
      comments: [],
      createdAt: now - 1 * DAY, isPremium: false
    },
    {
      id: uid(), channelId: 'ch_invest', authorId: 'user_6', title: '[프리미엄] 2024 VC 투자 트렌드 리포트',
      content: '올해 국내 VC 투자 트렌드를 정리했습니다.\n\n📊 주요 투자 분야:\n1. AI/ML 솔루션 (40%)\n2. 헬스케어/바이오 (20%)\n3. 핀테크 (15%)\n4. SaaS (15%)\n5. 기타 (10%)\n\n💡 투자자가 보는 핵심 지표:\n- MRR 성장률\n- Net Revenue Retention\n- CAC/LTV 비율\n\n상세 데이터는 첨부 자료 참고해주세요.',
      likes: 35, likedBy: ['user_2', 'user_4', 'user_admin'],
      comments: [
        { id: uid(), authorId: 'user_2', content: 'AI 분야 투자 비중이 정말 높네요. 좋은 타이밍인 것 같습니다', createdAt: now - 12 * 3600000 },
      ],
      createdAt: now - 12 * 3600000, isPremium: true
    },
    {
      id: uid(), channelId: 'ch_startup', authorId: 'user_7', title: 'PM이 창업할 때 겪는 5가지 함정',
      content: '프로덕트 매니저 출신으로 창업을 준비하면서 느낀 점들입니다.\n\n1. 기능 추가에 중독됨 → MVP에 집중하자\n2. 완벽한 PRD에 시간 낭비 → 빠르게 만들고 검증\n3. 모든 피드백을 반영 → 코어 유저에 집중\n4. 데이터만 보고 결정 → 직접 유저를 만나자\n5. 혼자 다 하려고 함 → 초기 팀빌딩이 핵심\n\n특히 3번이 저한테 가장 어려운 부분이었어요.',
      likes: 22, likedBy: ['user_admin', 'user_3', 'user_5'],
      comments: [
        { id: uid(), authorId: 'user_admin', content: '공감 100%! 특히 MVP 집중이 정말 중요하죠', createdAt: now - 6 * 3600000 },
      ],
      createdAt: now - 8 * 3600000, isPremium: false
    },
  ];

  // Update channel post counts
  channels.forEach(ch => {
    ch.postCount = posts.filter(p => p.channelId === ch.id).length;
  });

  const badges = [
    { id: 'badge_admin', name: '관리자', icon: '🛡️', description: '커뮤니티 관리자' },
    { id: 'badge_premium', name: '프리미엄', icon: '👑', description: '프리미엄 멤버' },
    { id: 'badge_founder', name: '파운더', icon: '🏆', description: '초기 멤버' },
    { id: 'badge_writer', name: '작가', icon: '✍️', description: '게시글 10개 이상 작성' },
    { id: 'badge_popular', name: '인기인', icon: '🌟', description: '좋아요 50개 이상 획득' },
    { id: 'badge_first_post', name: '첫 발자국', icon: '👣', description: '첫 게시글 작성' },
    { id: 'badge_commenter', name: '소통왕', icon: '💬', description: '댓글 30개 이상 작성' },
  ];

  const data = {
    currentUserId: 'user_admin',
    users,
    channels,
    posts,
    badges,
    dashboardData: {
      totalMembers: 1247,
      dau: 389,
      mau: 892,
      totalPosts: 3456,
      totalComments: 12890,
      monthlyRevenue: [
        { month: '7월', revenue: 320 },
        { month: '8월', revenue: 580 },
        { month: '9월', revenue: 890 },
        { month: '10월', revenue: 1240 },
        { month: '11월', revenue: 1680 },
        { month: '12월', revenue: 1980 },
      ],
      dailyActivity: [
        { day: '월', posts: 45, comments: 120 },
        { day: '화', posts: 62, comments: 180 },
        { day: '수', posts: 58, comments: 165 },
        { day: '목', posts: 71, comments: 210 },
        { day: '금', posts: 80, comments: 245 },
        { day: '토', posts: 35, comments: 95 },
        { day: '일', posts: 28, comments: 75 },
      ],
      premiumMembers: 312,
      freeMembers: 935,
    }
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

// ---- Initialize ----
function init() {
  state = loadData();
  renderAll();
}

function renderAll() {
  renderFeed();
  renderChannelFilter();
  renderChannelList();
  renderProfile();
  renderPricing();
  renderDashboard();
  updateCurrentUserAvatar();
}

function updateCurrentUserAvatar() {
  const user = getUser(state.currentUserId);
  if (user) {
    $('currentUserAvatar').textContent = user.nickname.charAt(0);
    $('currentUserAvatar').style.background = getAvatarColor(user.id);
  }
}

// ---- Navigation ----
function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  $(`page-${page}`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-page="${page}"]`).classList.add('active');
  window.scrollTo(0, 0);

  // Refresh data on page visit
  if (page === 'feed') renderFeed();
  if (page === 'profile') renderProfile();
  if (page === 'dashboard') renderDashboard();
  if (page === 'pricing') renderPricing();
  if (page === 'channels') renderChannelList();
}

// ---- User Helpers ----
function getUser(userId) {
  return state.users.find(u => u.id === userId);
}

function getCurrentUser() {
  return getUser(state.currentUserId);
}

// ---- Toast ----
function showToast(message, type = 'success') {
  const toast = $('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ---- Modal ----
function openModal(id) {
  $(id).classList.add('active');
}

function closeModal(id) {
  $(id).classList.remove('active');
}

function closeModalOutside(event, id) {
  if (event.target === $(id)) closeModal(id);
}

// ---- Feed ----
function renderFeed() {
  let posts = [...state.posts];

  // Filter by channel
  if (activeChannel !== 'all') {
    posts = posts.filter(p => p.channelId === activeChannel);
  }

  // Sort
  if (sortMode === 'latest') {
    posts.sort((a, b) => b.createdAt - a.createdAt);
  } else {
    posts.sort((a, b) => b.likes - a.likes);
  }

  const container = $('feedPosts');
  if (posts.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-slate-400">
        <div class="text-4xl mb-3">📭</div>
        <p>아직 게시글이 없습니다</p>
        <button onclick="openWriteModal()" class="btn btn-primary mt-4">첫 글 작성하기</button>
      </div>`;
    return;
  }

  container.innerHTML = posts.map(post => {
    const author = getUser(post.authorId);
    const channel = state.channels.find(c => c.id === post.channelId);
    const isLiked = post.likedBy.includes(state.currentUserId);
    const isPremiumLocked = post.isPremium && getCurrentUser().membership !== 'premium';

    return `
      <div class="card post-card fade-in" onclick="openPostDetail('${post.id}')">
        ${post.isPremium ? '<div class="flex justify-end mb-1"><span class="badge badge-premium">👑 프리미엄</span></div>' : ''}
        <div class="post-header">
          <div class="avatar" style="background: ${getAvatarColor(author.id)}; color: white;">${author.nickname.charAt(0)}</div>
          <div class="post-meta">
            <div class="post-author">
              ${author.nickname}
              ${author.membership === 'premium' ? '<span class="badge badge-premium text-[10px]">👑</span>' : ''}
              ${author.role === 'admin' ? '<span class="badge badge-admin text-[10px]">🛡️</span>' : ''}
            </div>
            <div class="post-time">${channel ? channel.icon + ' ' + channel.name + ' · ' : ''}${timeAgo(post.createdAt)}</div>
          </div>
        </div>
        ${isPremiumLocked ?
          `<div class="post-title">${post.title}</div>
           <div class="text-center py-4 text-slate-400">
             <div class="text-2xl mb-2">🔒</div>
             <p class="text-sm">프리미엄 멤버 전용 콘텐츠입니다</p>
             <button onclick="event.stopPropagation(); navigateTo('pricing')" class="btn btn-accent btn-sm mt-2">프리미엄 가입하기</button>
           </div>` :
          `<div class="post-title">${post.title}</div>
           <div class="post-content">${post.content.replace(/\n/g, '<br>')}</div>`
        }
        <div class="post-actions" onclick="event.stopPropagation()">
          <button class="post-action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
            ${isLiked ? '❤️' : '🤍'} <span>${post.likes}</span>
          </button>
          <button class="post-action-btn" onclick="openPostDetail('${post.id}')">
            💬 <span>${post.comments.length}</span>
          </button>
          <button class="post-action-btn" onclick="sharePost('${post.id}')">
            🔗 공유
          </button>
        </div>
      </div>`;
  }).join('');
}

function renderChannelFilter() {
  const container = $('channelFilter');
  const allActive = activeChannel === 'all' ? 'active' : '';
  let html = `<div class="channel-chip ${allActive}" onclick="filterChannel('all')">📋 전체</div>`;

  state.channels.forEach(ch => {
    const isActive = activeChannel === ch.id ? 'active' : '';
    const lock = ch.accessLevel === 'premium' ? '<span class="premium-lock">🔒</span>' : '';
    html += `<div class="channel-chip ${isActive}" onclick="filterChannel('${ch.id}')">${ch.icon} ${ch.name} ${lock}</div>`;
  });

  container.innerHTML = html;
}

function filterChannel(channelId) {
  activeChannel = channelId;
  renderChannelFilter();
  renderFeed();
}

function setSortMode(mode, btn) {
  sortMode = mode;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderFeed();
}

function toggleLike(postId) {
  const post = state.posts.find(p => p.id === postId);
  if (!post) return;

  const idx = post.likedBy.indexOf(state.currentUserId);
  if (idx >= 0) {
    post.likedBy.splice(idx, 1);
    post.likes--;
  } else {
    post.likedBy.push(state.currentUserId);
    post.likes++;
  }

  saveData();
  renderFeed();
}

function sharePost(postId) {
  showToast('🔗 링크가 복사되었습니다!');
}

// ---- Post Detail ----
function openPostDetail(postId) {
  const post = state.posts.find(p => p.id === postId);
  if (!post) return;

  const author = getUser(post.authorId);
  const channel = state.channels.find(c => c.id === post.channelId);
  const isLiked = post.likedBy.includes(state.currentUserId);
  const isPremiumLocked = post.isPremium && getCurrentUser().membership !== 'premium';

  let commentsHtml = '';
  if (!isPremiumLocked) {
    commentsHtml = post.comments.map(c => {
      const cAuthor = getUser(c.authorId);
      return `
        <div class="comment-item">
          <div class="avatar avatar-sm" style="background: ${getAvatarColor(cAuthor.id)}; color: white;">${cAuthor.nickname.charAt(0)}</div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm font-semibold">${cAuthor.nickname}</span>
              ${cAuthor.membership === 'premium' ? '<span class="badge badge-premium text-[9px]">👑</span>' : ''}
              <span class="text-xs text-slate-400">${timeAgo(c.createdAt)}</span>
            </div>
            <p class="text-sm text-slate-300">${c.content}</p>
          </div>
        </div>`;
    }).join('');
  }

  $('postDetailContent').innerHTML = `
    <div class="post-header">
      <div class="avatar" style="background: ${getAvatarColor(author.id)}; color: white;">${author.nickname.charAt(0)}</div>
      <div class="post-meta">
        <div class="post-author">
          ${author.nickname}
          ${author.membership === 'premium' ? '<span class="badge badge-premium text-[10px]">👑</span>' : ''}
        </div>
        <div class="post-time">${channel ? channel.icon + ' ' + channel.name + ' · ' : ''}${timeAgo(post.createdAt)}</div>
      </div>
    </div>
    <h2 class="text-lg font-bold mb-3">${post.title}</h2>
    ${isPremiumLocked ?
      `<div class="text-center py-6 text-slate-400">
        <div class="text-3xl mb-2">🔒</div>
        <p>프리미엄 멤버 전용 콘텐츠입니다</p>
        <button onclick="closeModal('postDetailModal'); navigateTo('pricing')" class="btn btn-accent mt-3">프리미엄 가입하기</button>
      </div>` :
      `<div class="post-content full text-sm leading-relaxed mb-4">${post.content.replace(/\n/g, '<br>')}</div>
       <div class="post-actions mb-4">
         <button class="post-action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLikeDetail('${post.id}')">
           ${isLiked ? '❤️' : '🤍'} <span>${post.likes}</span>
         </button>
         <button class="post-action-btn">💬 ${post.comments.length}</button>
       </div>
       <div class="border-t border-slate-700 pt-3">
         <h3 class="font-bold text-sm mb-3">💬 댓글 ${post.comments.length}개</h3>
         ${commentsHtml}
         <div class="flex gap-2 mt-3">
           <input type="text" id="commentInput" class="form-input flex-1" placeholder="댓글을 입력하세요...">
           <button onclick="addComment('${post.id}')" class="btn btn-primary btn-sm">등록</button>
         </div>
       </div>`
    }`;

  openModal('postDetailModal');
}

function toggleLikeDetail(postId) {
  toggleLike(postId);
  openPostDetail(postId);
}

function addComment(postId) {
  const input = $('commentInput');
  const content = input.value.trim();
  if (!content) return;

  const post = state.posts.find(p => p.id === postId);
  if (!post) return;

  post.comments.push({
    id: uid(),
    authorId: state.currentUserId,
    content,
    createdAt: Date.now()
  });

  saveData();
  showToast('💬 댓글이 등록되었습니다');
  openPostDetail(postId);
  renderFeed();
}

// ---- Write Post ----
function openWriteModal() {
  const select = $('writeChannel');
  select.innerHTML = '<option value="">채널 선택</option>';
  state.channels.forEach(ch => {
    const locked = ch.accessLevel === 'premium' && getCurrentUser().membership !== 'premium';
    select.innerHTML += `<option value="${ch.id}" ${locked ? 'disabled' : ''}>${ch.icon} ${ch.name} ${locked ? '🔒' : ''}</option>`;
  });
  $('writeTitle').value = '';
  $('writeContent').value = '';
  openModal('writeModal');
}

function submitPost() {
  const channelId = $('writeChannel').value;
  const title = $('writeTitle').value.trim();
  const content = $('writeContent').value.trim();

  if (!channelId) { showToast('채널을 선택해주세요', 'error'); return; }
  if (!title) { showToast('제목을 입력해주세요', 'error'); return; }
  if (!content) { showToast('내용을 입력해주세요', 'error'); return; }

  const channel = state.channels.find(c => c.id === channelId);
  const isPremiumChannel = channel && channel.accessLevel === 'premium';

  const post = {
    id: uid(),
    channelId,
    authorId: state.currentUserId,
    title,
    content,
    likes: 0,
    likedBy: [],
    comments: [],
    createdAt: Date.now(),
    isPremium: isPremiumChannel
  };

  state.posts.unshift(post);

  // Update channel post count
  if (channel) channel.postCount++;

  // Check badge: first post
  const user = getCurrentUser();
  const userPostCount = state.posts.filter(p => p.authorId === user.id).length;
  if (userPostCount === 1 && !user.badges.includes('badge_first_post')) {
    user.badges.push('badge_first_post');
    showToast('🏅 "첫 발자국" 뱃지를 획득했습니다!');
  }
  if (userPostCount >= 10 && !user.badges.includes('badge_writer')) {
    user.badges.push('badge_writer');
    showToast('🏅 "작가" 뱃지를 획득했습니다!');
  }

  saveData();
  closeModal('writeModal');
  showToast('✅ 게시글이 등록되었습니다!');
  renderFeed();
}

// ---- Channels ----
function renderChannelList() {
  const container = $('channelList');
  container.innerHTML = state.channels.map(ch => `
    <div class="card flex items-center gap-3">
      <div class="text-2xl">${ch.icon}</div>
      <div class="flex-1">
        <div class="font-bold text-sm flex items-center gap-2">
          ${ch.name}
          ${ch.accessLevel === 'premium' ? '<span class="badge badge-premium text-[10px]">👑 프리미엄</span>' : ''}
        </div>
        <p class="text-xs text-slate-400 mt-1">${ch.description}</p>
        <p class="text-xs text-slate-500 mt-1">게시글 ${ch.postCount}개</p>
      </div>
      <button onclick="deleteChannel('${ch.id}')" class="text-slate-500 hover:text-red-400 text-lg" title="삭제">🗑️</button>
    </div>
  `).join('');
}

function openChannelModal() {
  $('channelIcon').value = '💬';
  $('channelName').value = '';
  $('channelDesc').value = '';
  $('channelAccess').value = 'all';
  openModal('channelModal');
}

function createChannel() {
  const icon = $('channelIcon').value.trim() || '💬';
  const name = $('channelName').value.trim();
  const desc = $('channelDesc').value.trim();
  const access = $('channelAccess').value;

  if (!name) { showToast('채널 이름을 입력해주세요', 'error'); return; }

  state.channels.push({
    id: 'ch_' + uid(),
    name,
    description: desc,
    icon,
    accessLevel: access,
    postCount: 0
  });

  saveData();
  closeModal('channelModal');
  showToast('📂 채널이 생성되었습니다!');
  renderChannelList();
  renderChannelFilter();
}

function deleteChannel(channelId) {
  if (!confirm('이 채널을 삭제하시겠습니까?')) return;
  state.channels = state.channels.filter(c => c.id !== channelId);
  state.posts = state.posts.filter(p => p.channelId !== channelId);
  saveData();
  showToast('🗑️ 채널이 삭제되었습니다');
  renderChannelList();
  renderChannelFilter();
  renderFeed();
}

// ---- Profile ----
function renderProfile() {
  const user = getCurrentUser();
  if (!user) return;

  const postCount = state.posts.filter(p => p.authorId === user.id).length;
  const commentCount = state.posts.reduce((sum, p) => sum + p.comments.filter(c => c.authorId === user.id).length, 0);
  const totalLikes = state.posts.filter(p => p.authorId === user.id).reduce((sum, p) => sum + p.likes, 0);

  $('profileHeader').innerHTML = `
    <div class="avatar avatar-lg mx-auto mb-3" style="background: ${getAvatarColor(user.id)}; color: white;">${user.nickname.charAt(0)}</div>
    <h2 class="text-xl font-bold">${user.nickname}</h2>
    <p class="text-sm text-slate-400 mt-1">${user.bio || '소개가 없습니다'}</p>
    <div class="flex justify-center gap-2 mt-2">
      ${user.membership === 'premium' ? '<span class="badge badge-premium">👑 프리미엄</span>' : '<span class="badge badge-achievement">무료 멤버</span>'}
      ${user.role === 'admin' ? '<span class="badge badge-admin">🛡️ 관리자</span>' : ''}
    </div>
    <div class="profile-stats">
      <div class="profile-stat">
        <div class="profile-stat-value">${postCount}</div>
        <div class="profile-stat-label">게시글</div>
      </div>
      <div class="profile-stat">
        <div class="profile-stat-value">${commentCount}</div>
        <div class="profile-stat-label">댓글</div>
      </div>
      <div class="profile-stat">
        <div class="profile-stat-value">${totalLikes}</div>
        <div class="profile-stat-label">좋아요</div>
      </div>
    </div>
    <p class="text-xs text-slate-500 mt-3">가입일: ${new Date(user.joinedAt).toLocaleDateString('ko-KR')}</p>
  `;

  // Badges
  const badgeList = $('badgeList');
  badgeList.innerHTML = user.badges.map(bid => {
    const badge = state.badges.find(b => b.id === bid);
    if (!badge) return '';
    return `
      <div class="badge badge-achievement" title="${badge.description}">
        ${badge.icon} ${badge.name}
      </div>`;
  }).join('');

  // Membership status
  const membershipStatus = $('membershipStatus');
  if (user.membership === 'premium') {
    membershipStatus.className = 'badge badge-premium';
    membershipStatus.textContent = '👑 프리미엄';
  } else {
    membershipStatus.className = 'badge badge-achievement';
    membershipStatus.textContent = '무료';
  }
}

function openNicknameModal() {
  $('newNickname').value = getCurrentUser().nickname;
  openModal('nicknameModal');
}

function changeNickname() {
  const name = $('newNickname').value.trim();
  if (!name) { showToast('닉네임을 입력해주세요', 'error'); return; }
  if (name.length > 10) { showToast('닉네임은 10자 이내로 입력해주세요', 'error'); return; }

  getCurrentUser().nickname = name;
  saveData();
  closeModal('nicknameModal');
  showToast('✅ 닉네임이 변경되었습니다');
  renderProfile();
  updateCurrentUserAvatar();
}

// ---- Pricing ----
function renderPricing() {
  const user = getCurrentUser();

  const btnFree = $('btnFreePlan');
  const btnPremium = $('btnPremiumPlan');

  if (user.membership === 'free') {
    btnFree.textContent = '✅ 현재 플랜';
    btnFree.disabled = true;
    btnFree.className = 'btn btn-secondary btn-full';
    btnPremium.textContent = '👑 프리미엄 시작하기';
    btnPremium.disabled = false;
    btnPremium.className = 'btn btn-accent btn-full';
  } else {
    btnFree.textContent = '다운그레이드';
    btnFree.disabled = false;
    btnFree.className = 'btn btn-secondary btn-full';
    btnPremium.textContent = '✅ 현재 플랜';
    btnPremium.disabled = true;
    btnPremium.className = 'btn btn-accent btn-full';
  }

  // Comparison table
  const features = [
    ['일반 채널 접근', true, true],
    ['게시글 작성', '일 3회', '무제한'],
    ['댓글 및 좋아요', true, true],
    ['프리미엄 채널', false, true],
    ['멘토링 매칭', false, true],
    ['투자자 네트워크', false, true],
    ['프리미엄 뱃지', false, true],
    ['광고 제거', false, true],
  ];

  $('comparisonTable').innerHTML = features.map(([name, free, premium]) => `
    <tr class="border-t border-slate-700">
      <td class="py-2 text-slate-300">${name}</td>
      <td class="text-center py-2">${free === true ? '✅' : free === false ? '❌' : free}</td>
      <td class="text-center py-2">${premium === true ? '✅' : premium === false ? '❌' : premium}</td>
    </tr>
  `).join('');
}

function selectPlan(plan) {
  const user = getCurrentUser();
  if (user.membership === plan) return;

  if (plan === 'premium') {
    if (confirm('프리미엄 멤버십(월 ₩9,900)에 가입하시겠습니까?\n\n(데모: 실제 결제 없이 진행됩니다)')) {
      user.membership = 'premium';
      if (!user.badges.includes('badge_premium')) {
        user.badges.push('badge_premium');
      }
      saveData();
      showToast('👑 프리미엄 멤버십에 가입되었습니다!');
      renderAll();
    }
  } else {
    if (confirm('무료 플랜으로 다운그레이드하시겠습니까?')) {
      user.membership = 'free';
      user.badges = user.badges.filter(b => b !== 'badge_premium');
      saveData();
      showToast('무료 플랜으로 변경되었습니다');
      renderAll();
    }
  }
}

// ---- Dashboard ----
function renderDashboard() {
  const d = state.dashboardData;
  const realPostCount = state.posts.length;
  const realCommentCount = state.posts.reduce((sum, p) => sum + p.comments.length, 0);

  // Stats
  $('dashboardStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">총 회원수</div>
      <div class="stat-value">${d.totalMembers.toLocaleString()}</div>
      <div class="stat-change up">▲ 12.5% vs 지난달</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">일일 활성 사용자</div>
      <div class="stat-value">${d.dau.toLocaleString()}</div>
      <div class="stat-change up">▲ 8.3% vs 어제</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">총 게시글</div>
      <div class="stat-value">${(d.totalPosts + realPostCount).toLocaleString()}</div>
      <div class="stat-change up">▲ ${realPostCount} 신규</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">월 수익</div>
      <div class="stat-value">₩${(d.monthlyRevenue[d.monthlyRevenue.length - 1].revenue).toLocaleString()}만</div>
      <div class="stat-change up">▲ 17.8% 성장</div>
    </div>
  `;

  // Revenue Chart
  const maxRev = Math.max(...d.monthlyRevenue.map(r => r.revenue));
  $('revenueChart').innerHTML = d.monthlyRevenue.map(r =>
    `<div class="chart-bar" style="height: ${(r.revenue / maxRev * 100)}%" title="₩${r.revenue}만"></div>`
  ).join('');
  $('revenueLabels').innerHTML = d.monthlyRevenue.map(r =>
    `<span class="chart-bar-label">${r.month}</span>`
  ).join('');

  // Activity Chart
  const maxAct = Math.max(...d.dailyActivity.map(a => a.posts + a.comments));
  $('activityChart').innerHTML = d.dailyActivity.map(a =>
    `<div class="chart-bar" style="height: ${((a.posts + a.comments) / maxAct * 100)}%" title="${a.posts}글 / ${a.comments}댓글"></div>`
  ).join('');
  $('activityLabels').innerHTML = d.dailyActivity.map(a =>
    `<span class="chart-bar-label">${a.day}</span>`
  ).join('');

  // Membership Donut
  const total = d.premiumMembers + d.freeMembers;
  const premPct = Math.round(d.premiumMembers / total * 100);
  const freePct = 100 - premPct;
  $('membershipDonut').style.background = `conic-gradient(var(--accent) 0% ${premPct}%, var(--primary) ${premPct}% 100%)`;
  $('membershipDonut').innerHTML = `<div class="donut-center"><span class="text-lg font-bold">${premPct}%</span><span class="text-xs text-slate-400">프리미엄</span></div>`;
  $('freeCount').textContent = `무료: ${d.freeMembers.toLocaleString()}명`;
  $('premiumCount').textContent = `프리미엄: ${d.premiumMembers.toLocaleString()}명`;

  // Recent Activity
  const activities = [];
  state.posts.slice(0, 5).forEach(p => {
    const author = getUser(p.authorId);
    activities.push({
      text: `${author.nickname}님이 "${p.title}" 게시글을 작성했습니다`,
      time: p.createdAt,
      icon: '📝'
    });
  });
  state.posts.forEach(p => {
    p.comments.slice(-2).forEach(c => {
      const author = getUser(c.authorId);
      activities.push({
        text: `${author.nickname}님이 댓글을 남겼습니다`,
        time: c.createdAt,
        icon: '💬'
      });
    });
  });
  activities.sort((a, b) => b.time - a.time);

  $('recentActivity').innerHTML = activities.slice(0, 8).map(a => `
    <div class="flex items-start gap-2 py-2 border-b border-slate-700 last:border-0">
      <span>${a.icon}</span>
      <div class="flex-1">
        <p class="text-sm">${a.text}</p>
        <p class="text-xs text-slate-400">${timeAgo(a.time)}</p>
      </div>
    </div>
  `).join('');
}

// ---- Reset ----
function resetAllData() {
  if (!confirm('모든 데이터를 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;
  localStorage.removeItem(STORAGE_KEY);
  state = initDemoData();
  state = loadData();
  showToast('🔄 데이터가 초기화되었습니다');
  activeChannel = 'all';
  sortMode = 'latest';
  renderAll();
  navigateTo('feed');
}

// ---- Init on load ----
document.addEventListener('DOMContentLoaded', init);
