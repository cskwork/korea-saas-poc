// ============================================================
// 에듀마켓 - 온라인 교육 콘텐츠 판매 플랫폼 POC
// ============================================================

// --- Utility Functions ---
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const uid = () => 'id_' + Math.random().toString(36).substr(2, 9);
const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n);
const fmtW = (n) => '₩' + fmt(n);

function showToast(msg) {
    const t = $('#toast');
    $('#toast-message').textContent = msg;
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 2500);
}

function openModal(html) {
    $('#modal-content').innerHTML = html;
    $('#modal-overlay').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal(e) {
    if (e && e.target !== $('#modal-overlay')) return;
    $('#modal-overlay').classList.add('hidden');
    document.body.style.overflow = '';
}

function closeModalDirect() {
    $('#modal-overlay').classList.add('hidden');
    document.body.style.overflow = '';
}

// --- Storage ---
function loadData(key, fallback) {
    try { return JSON.parse(localStorage.getItem('edumarket_' + key)) || fallback; }
    catch { return fallback; }
}
function saveData(key, data) {
    localStorage.setItem('edumarket_' + key, JSON.stringify(data));
}

// --- Demo Data ---
function initDemoData() {
    if (loadData('initialized', false)) return;

    const courses = [
        {
            id: uid(), title: '실전 React 완전 정복', description: '초보자부터 실무까지, React의 모든 것을 배웁니다. Hooks, Context, Redux, Next.js까지 체계적으로 학습하세요.',
            thumbnail: '', price: 89000, category: '프로그래밍', status: 'published', createdAt: '2025-01-15',
            sections: [
                { id: uid(), title: '1. React 기초', order: 1, lessons: [
                    { id: uid(), title: 'React란 무엇인가?', duration: '12:30', type: 'video', isFree: true, order: 1 },
                    { id: uid(), title: 'JSX 문법 이해하기', duration: '15:45', type: 'video', isFree: true, order: 2 },
                    { id: uid(), title: '컴포넌트와 Props', duration: '18:20', type: 'video', isFree: false, order: 3 },
                ]},
                { id: uid(), title: '2. State와 생명주기', order: 2, lessons: [
                    { id: uid(), title: 'useState 훅', duration: '20:15', type: 'video', isFree: false, order: 1 },
                    { id: uid(), title: 'useEffect 훅', duration: '22:40', type: 'video', isFree: false, order: 2 },
                    { id: uid(), title: '실습: 투두 앱 만들기', duration: '35:00', type: 'video', isFree: false, order: 3 },
                ]},
                { id: uid(), title: '3. 고급 패턴', order: 3, lessons: [
                    { id: uid(), title: 'Context API', duration: '25:10', type: 'video', isFree: false, order: 1 },
                    { id: uid(), title: 'Custom Hooks', duration: '18:55', type: 'video', isFree: false, order: 2 },
                    { id: uid(), title: '성능 최적화', duration: '30:20', type: 'video', isFree: false, order: 3 },
                    { id: uid(), title: '최종 퀴즈', duration: '10:00', type: 'quiz', isFree: false, order: 4 },
                ]},
            ]
        },
        {
            id: uid(), title: '피그마 UI/UX 디자인 마스터', description: '피그마를 활용한 실무 UI/UX 디자인 프로세스를 학습합니다. Auto Layout, 컴포넌트, 프로토타이핑까지.',
            thumbnail: '', price: 69000, category: '디자인', status: 'published', createdAt: '2025-02-20',
            sections: [
                { id: uid(), title: '1. 피그마 기초', order: 1, lessons: [
                    { id: uid(), title: '피그마 소개 및 설치', duration: '08:15', type: 'video', isFree: true, order: 1 },
                    { id: uid(), title: '기본 도구 사용법', duration: '14:30', type: 'video', isFree: true, order: 2 },
                ]},
                { id: uid(), title: '2. 실무 디자인', order: 2, lessons: [
                    { id: uid(), title: 'Auto Layout 마스터', duration: '25:00', type: 'video', isFree: false, order: 1 },
                    { id: uid(), title: '컴포넌트 시스템', duration: '30:45', type: 'video', isFree: false, order: 2 },
                    { id: uid(), title: '디자인 시스템 구축', duration: '45:20', type: 'text', isFree: false, order: 3 },
                ]},
            ]
        },
        {
            id: uid(), title: '파이썬 데이터 분석 입문', description: 'Python, Pandas, Matplotlib를 활용한 데이터 분석 기초를 다룹니다.',
            thumbnail: '', price: 55000, category: '데이터', status: 'draft', createdAt: '2025-03-10',
            sections: [
                { id: uid(), title: '1. 파이썬 기초', order: 1, lessons: [
                    { id: uid(), title: '파이썬 설치 및 환경설정', duration: '10:00', type: 'video', isFree: true, order: 1 },
                    { id: uid(), title: '변수와 자료형', duration: '16:30', type: 'video', isFree: false, order: 2 },
                ]},
            ]
        }
    ];

    const students = [
        { id: uid(), name: '이민수', email: 'minsu@example.com', enrolledCourses: [courses[0].id, courses[1].id], progress: {}, enrolledAt: '2025-02-01', totalPaid: 158000 },
        { id: uid(), name: '박지연', email: 'jiyeon@example.com', enrolledCourses: [courses[0].id], progress: {}, enrolledAt: '2025-02-15', totalPaid: 89000 },
        { id: uid(), name: '최동현', email: 'donghyun@example.com', enrolledCourses: [courses[0].id, courses[1].id], progress: {}, enrolledAt: '2025-03-01', totalPaid: 158000 },
        { id: uid(), name: '김하은', email: 'haeun@example.com', enrolledCourses: [courses[1].id], progress: {}, enrolledAt: '2025-03-10', totalPaid: 69000 },
        { id: uid(), name: '정우진', email: 'woojin@example.com', enrolledCourses: [courses[0].id], progress: {}, enrolledAt: '2025-03-20', totalPaid: 89000 },
        { id: uid(), name: '한서영', email: 'seoyoung@example.com', enrolledCourses: [courses[0].id, courses[1].id], progress: {}, enrolledAt: '2025-04-01', totalPaid: 158000 },
        { id: uid(), name: '오준석', email: 'junseok@example.com', enrolledCourses: [courses[0].id], progress: {}, enrolledAt: '2025-04-05', totalPaid: 89000 },
        { id: uid(), name: '윤채린', email: 'chaerin@example.com', enrolledCourses: [courses[1].id], progress: {}, enrolledAt: '2025-04-10', totalPaid: 69000 },
    ];
    // Assign random progress
    students.forEach(s => {
        s.enrolledCourses.forEach(cid => {
            s.progress[cid] = Math.floor(Math.random() * 100);
        });
    });

    const products = [
        { id: uid(), title: '개발자 이력서 노션 템플릿', type: 'notion-template', price: 15000, description: '실무에서 바로 사용 가능한 개발자 이력서 템플릿. ATS 최적화 포맷 포함.', salesCount: 234, createdAt: '2025-01-20' },
        { id: uid(), title: 'React 치트시트 PDF', type: 'pdf', price: 9900, description: 'React 핵심 개념을 한 장에 정리한 치트시트. A3 출력용 포함.', salesCount: 567, createdAt: '2025-02-10' },
        { id: uid(), title: '프로젝트 관리 노션 대시보드', type: 'notion-template', price: 25000, description: '스프린트, 백로그, 회고까지 한번에 관리하는 PM 대시보드.', salesCount: 189, createdAt: '2025-03-05' },
        { id: uid(), title: 'UX 리서치 체크리스트 PDF', type: 'pdf', price: 12000, description: '사용자 인터뷰, 유저빌리티 테스트 체크리스트 모음.', salesCount: 142, createdAt: '2025-03-15' },
    ];

    // Monthly revenue data
    const monthlyRevenue = [
        { month: '2025-01', courses: 890000, products: 350000 },
        { month: '2025-02', courses: 1580000, products: 480000 },
        { month: '2025-03', courses: 2370000, products: 720000 },
        { month: '2025-04', courses: 3150000, products: 950000 },
        { month: '2025-05', courses: 4200000, products: 1200000 },
        { month: '2025-06', courses: 5100000, products: 1580000 },
    ];

    saveData('courses', courses);
    saveData('students', students);
    saveData('products', products);
    saveData('revenue', monthlyRevenue);
    saveData('initialized', true);
}

// --- Navigation ---
let currentPage = 'dashboard';

function navigate(page) {
    currentPage = page;
    // Update nav state
    $$('.nav-btn, .sidebar-btn').forEach(b => b.classList.remove('active'));
    $$(`[data-nav="${page}"]`).forEach(b => b.classList.add('active'));

    const main = $('#main-content');
    main.style.animation = 'none';
    main.offsetHeight; // trigger reflow
    main.style.animation = 'fadeIn 0.2s ease-out';

    const renderers = {
        dashboard: renderDashboard,
        courses: renderCourses,
        students: renderStudents,
        revenue: renderRevenue,
        products: renderProducts,
        pricing: renderPricing,
        landing: renderLanding,
    };
    (renderers[page] || renderDashboard)();
}

// --- Dashboard Page ---
function renderDashboard() {
    const courses = loadData('courses', []);
    const students = loadData('students', []);
    const products = loadData('products', []);
    const revenue = loadData('revenue', []);

    const totalRevenue = revenue.reduce((s, r) => s + r.courses + r.products, 0);
    const latestMonth = revenue[revenue.length - 1] || { courses: 0, products: 0 };
    const totalStudents = students.length;
    const publishedCourses = courses.filter(c => c.status === 'published').length;
    const totalProducts = products.reduce((s, p) => s + p.salesCount, 0);

    $('#main-content').innerHTML = `
        <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-900">대시보드</h2>
            <p class="text-sm text-gray-500 mt-1">에듀마켓 현황을 한눈에 확인하세요</p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div class="stat-card bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                </div>
                <p class="text-xs text-gray-500">총 수익</p>
                <p class="text-lg font-bold text-gray-900">${fmtW(totalRevenue)}</p>
            </div>
            <div class="stat-card bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                    </div>
                </div>
                <p class="text-xs text-gray-500">이번 달 수익</p>
                <p class="text-lg font-bold text-gray-900">${fmtW(latestMonth.courses + latestMonth.products)}</p>
            </div>
            <div class="stat-card bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    </div>
                </div>
                <p class="text-xs text-gray-500">총 수강생</p>
                <p class="text-lg font-bold text-gray-900">${fmt(totalStudents)}명</p>
            </div>
            <div class="stat-card bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                    </div>
                </div>
                <p class="text-xs text-gray-500">게시 강의</p>
                <p class="text-lg font-bold text-gray-900">${publishedCourses}개</p>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">빠른 시작</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button onclick="openNewCourseModal()" class="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition text-sm text-blue-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                    새 강의 만들기
                </button>
                <button onclick="openNewProductModal()" class="flex flex-col items-center gap-2 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition text-sm text-green-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                    디지털 상품 등록
                </button>
                <button onclick="navigate('students')" class="flex flex-col items-center gap-2 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition text-sm text-purple-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    수강생 관리
                </button>
                <button onclick="navigate('revenue')" class="flex flex-col items-center gap-2 p-3 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition text-sm text-yellow-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                    수익 분석
                </button>
            </div>
        </div>

        <!-- Recent Courses -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-700">최근 강의</h3>
                <button onclick="navigate('courses')" class="text-xs text-primary-600 hover:underline">전체 보기 →</button>
            </div>
            <div class="space-y-3">
                ${courses.slice(0, 3).map(c => `
                    <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer" onclick="openCourseDetail('${c.id}')">
                        <div class="w-12 h-12 rounded-lg bg-gradient-to-br ${getCourseGradient(c.category)} flex items-center justify-center text-white text-lg shrink-0">
                            ${getCourseEmoji(c.category)}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 truncate">${c.title}</p>
                            <div class="flex items-center gap-2 mt-0.5">
                                <span class="badge ${c.status === 'published' ? 'badge-green' : 'badge-yellow'}">${c.status === 'published' ? '게시됨' : '초안'}</span>
                                <span class="text-xs text-gray-400">${fmtW(c.price)}</span>
                            </div>
                        </div>
                        <div class="text-right shrink-0">
                            <p class="text-xs text-gray-400">${students.filter(s => s.enrolledCourses.includes(c.id)).length}명</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Top Products -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-700">인기 디지털 상품</h3>
                <button onclick="navigate('products')" class="text-xs text-primary-600 hover:underline">전체 보기 →</button>
            </div>
            <div class="space-y-2">
                ${products.sort((a,b) => b.salesCount - a.salesCount).slice(0,3).map((p, i) => `
                    <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
                        <span class="text-lg w-6 text-center">${['🥇','🥈','🥉'][i]}</span>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 truncate">${p.title}</p>
                            <p class="text-xs text-gray-400">${p.salesCount}건 판매</p>
                        </div>
                        <span class="text-sm font-semibold text-gray-700">${fmtW(p.price)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function getCourseGradient(cat) {
    const map = { '프로그래밍': 'from-blue-500 to-blue-700', '디자인': 'from-pink-500 to-purple-600', '데이터': 'from-green-500 to-teal-600', '마케팅': 'from-orange-400 to-red-500' };
    return map[cat] || 'from-gray-500 to-gray-700';
}
function getCourseEmoji(cat) {
    const map = { '프로그래밍': '💻', '디자인': '🎨', '데이터': '📊', '마케팅': '📢' };
    return map[cat] || '📚';
}

// --- Courses Page ---
function renderCourses() {
    const courses = loadData('courses', []);
    const students = loadData('students', []);

    $('#main-content').innerHTML = `
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-xl font-bold text-gray-900">강의 관리</h2>
                <p class="text-sm text-gray-500 mt-1">총 ${courses.length}개의 강의</p>
            </div>
            <button onclick="openNewCourseModal()" class="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                새 강의
            </button>
        </div>

        <div class="space-y-4">
            ${courses.length === 0 ? `
                <div class="empty-state py-12">
                    <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                    <p class="text-gray-400 text-sm">아직 등록된 강의가 없습니다</p>
                    <button onclick="openNewCourseModal()" class="mt-3 text-primary-600 text-sm font-medium hover:underline">첫 강의를 만들어 보세요 →</button>
                </div>
            ` : courses.map(c => {
                const enrolled = students.filter(s => s.enrolledCourses.includes(c.id)).length;
                const totalLessons = c.sections.reduce((s, sec) => s + sec.lessons.length, 0);
                return `
                <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div class="p-4">
                        <div class="flex items-start gap-3">
                            <div class="w-14 h-14 rounded-xl bg-gradient-to-br ${getCourseGradient(c.category)} flex items-center justify-center text-white text-2xl shrink-0">
                                ${getCourseEmoji(c.category)}
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-2">
                                    <h3 class="text-base font-semibold text-gray-900">${c.title}</h3>
                                    <span class="badge ${c.status === 'published' ? 'badge-green' : 'badge-yellow'} shrink-0">${c.status === 'published' ? '게시됨' : '초안'}</span>
                                </div>
                                <p class="text-sm text-gray-500 mt-1 line-clamp-2">${c.description}</p>
                                <div class="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
                                    <span class="flex items-center gap-1">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                                        ${c.sections.length}섹션 · ${totalLessons}레슨
                                    </span>
                                    <span class="flex items-center gap-1">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                                        수강생 ${enrolled}명
                                    </span>
                                    <span class="font-semibold text-gray-700">${fmtW(c.price)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between bg-gray-50/50">
                        <div class="flex gap-1">
                            <button onclick="openCourseDetail('${c.id}')" class="text-xs text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition font-medium">커리큘럼 편집</button>
                            <button onclick="previewLanding('${c.id}')" class="text-xs text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition">미리보기</button>
                        </div>
                        <div class="flex gap-1">
                            <button onclick="toggleCourseStatus('${c.id}')" class="text-xs ${c.status === 'published' ? 'text-yellow-600' : 'text-green-600'} hover:bg-gray-100 px-3 py-1.5 rounded-lg transition">
                                ${c.status === 'published' ? '비공개' : '게시'}
                            </button>
                            <button onclick="deleteCourse('${c.id}')" class="text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition">삭제</button>
                        </div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
}

function openNewCourseModal() {
    openModal(`
        <div class="p-5">
            <h3 class="text-lg font-bold text-gray-900 mb-4">새 강의 만들기</h3>
            <form onsubmit="createCourse(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">강의 제목</label>
                    <input type="text" id="course-title" required class="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="예: 실전 JavaScript 완전 정복">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">강의 설명</label>
                    <textarea id="course-desc" required rows="3" class="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none" placeholder="강의에 대한 간단한 설명을 입력하세요"></textarea>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                        <select id="course-category" class="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                            <option value="프로그래밍">프로그래밍</option>
                            <option value="디자인">디자인</option>
                            <option value="데이터">데이터</option>
                            <option value="마케팅">마케팅</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">가격 (원)</label>
                        <input type="number" id="course-price" required min="0" step="1000" class="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="89000">
                    </div>
                </div>
                <div class="flex justify-end gap-2 pt-2">
                    <button type="button" onclick="closeModalDirect()" class="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition">취소</button>
                    <button type="submit" class="px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition">생성</button>
                </div>
            </form>
        </div>
    `);
}

function createCourse(e) {
    e.preventDefault();
    const courses = loadData('courses', []);
    const newCourse = {
        id: uid(),
        title: $('#course-title').value,
        description: $('#course-desc').value,
        thumbnail: '',
        price: parseInt($('#course-price').value) || 0,
        category: $('#course-category').value,
        status: 'draft',
        sections: [],
        createdAt: new Date().toISOString().split('T')[0],
    };
    courses.push(newCourse);
    saveData('courses', courses);
    closeModalDirect();
    showToast('강의가 생성되었습니다');
    renderCourses();
}

function toggleCourseStatus(id) {
    const courses = loadData('courses', []);
    const c = courses.find(x => x.id === id);
    if (c) {
        c.status = c.status === 'published' ? 'draft' : 'published';
        saveData('courses', courses);
        showToast(c.status === 'published' ? '강의가 게시되었습니다' : '강의가 비공개되었습니다');
        renderCourses();
    }
}

function deleteCourse(id) {
    if (!confirm('이 강의를 삭제하시겠습니까?')) return;
    let courses = loadData('courses', []);
    courses = courses.filter(c => c.id !== id);
    saveData('courses', courses);
    showToast('강의가 삭제되었습니다');
    renderCourses();
}

// --- Course Detail / Curriculum Builder ---
function openCourseDetail(id) {
    const courses = loadData('courses', []);
    const course = courses.find(c => c.id === id);
    if (!course) return;

    $('#main-content').innerHTML = `
        <div class="mb-6">
            <button onclick="navigate('courses')" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                강의 목록
            </button>
            <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-gray-900">${course.title}</h2>
                <div class="flex gap-2">
                    <button onclick="previewLanding('${id}')" class="text-sm text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-lg transition flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        미리보기
                    </button>
                    <button onclick="addSection('${id}')" class="bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                        섹션 추가
                    </button>
                </div>
            </div>
            <p class="text-sm text-gray-500 mt-1">${course.description}</p>
        </div>

        <!-- Curriculum Builder -->
        <div class="space-y-4" id="curriculum-builder">
            ${course.sections.length === 0 ? `
                <div class="empty-state py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                    <p class="text-gray-400 text-sm">섹션을 추가하여 커리큘럼을 구성하세요</p>
                </div>
            ` : course.sections.sort((a,b) => a.order - b.order).map(sec => `
                <div class="curriculum-section bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden pl-1">
                    <div class="px-4 py-3 bg-gray-50 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="drag-handle">⠿</span>
                            <h4 class="text-sm font-semibold text-gray-800">${sec.title}</h4>
                            <span class="text-xs text-gray-400">${sec.lessons.length}개 레슨</span>
                        </div>
                        <div class="flex gap-1">
                            <button onclick="addLesson('${id}','${sec.id}')" class="text-xs text-primary-600 hover:bg-primary-50 px-2 py-1 rounded-lg transition">+ 레슨</button>
                            <button onclick="deleteSection('${id}','${sec.id}')" class="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition">삭제</button>
                        </div>
                    </div>
                    <div class="divide-y divide-gray-50">
                        ${sec.lessons.sort((a,b) => a.order - b.order).map(les => `
                            <div class="lesson-item px-4 py-2.5 flex items-center gap-3">
                                <span class="drag-handle text-sm">⠿</span>
                                <div class="w-7 h-7 rounded-lg ${les.type === 'video' ? 'bg-blue-100' : les.type === 'quiz' ? 'bg-yellow-100' : 'bg-green-100'} flex items-center justify-center shrink-0">
                                    ${les.type === 'video' ? '<svg class="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>' :
                                      les.type === 'quiz' ? '<svg class="w-3.5 h-3.5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' :
                                      '<svg class="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>'}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm text-gray-800">${les.title}</p>
                                    <div class="flex items-center gap-2 mt-0.5">
                                        <span class="text-xs text-gray-400">${les.duration}</span>
                                        ${les.isFree ? '<span class="badge badge-blue">무료 공개</span>' : ''}
                                    </div>
                                </div>
                                <button onclick="deleteLesson('${id}','${sec.id}','${les.id}')" class="text-gray-300 hover:text-red-500 transition">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function addSection(courseId) {
    const courses = loadData('courses', []);
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    const sectionNum = course.sections.length + 1;
    const title = prompt('섹션 제목을 입력하세요:', `${sectionNum}. 새 섹션`);
    if (!title) return;
    course.sections.push({ id: uid(), title, order: sectionNum, lessons: [] });
    saveData('courses', courses);
    showToast('섹션이 추가되었습니다');
    openCourseDetail(courseId);
}

function deleteSection(courseId, sectionId) {
    if (!confirm('이 섹션을 삭제하시겠습니까?')) return;
    const courses = loadData('courses', []);
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    course.sections = course.sections.filter(s => s.id !== sectionId);
    saveData('courses', courses);
    showToast('섹션이 삭제되었습니다');
    openCourseDetail(courseId);
}

function addLesson(courseId, sectionId) {
    openModal(`
        <div class="p-5">
            <h3 class="text-lg font-bold text-gray-900 mb-4">레슨 추가</h3>
            <form onsubmit="createLesson(event, '${courseId}', '${sectionId}')" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">레슨 제목</label>
                    <input type="text" id="lesson-title" required class="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="예: React Hooks 이해하기">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">유형</label>
                        <select id="lesson-type" class="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                            <option value="video">영상</option>
                            <option value="text">텍스트</option>
                            <option value="quiz">퀴즈</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">소요 시간</label>
                        <input type="text" id="lesson-duration" required class="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="15:30">
                    </div>
                </div>
                <label class="flex items-center gap-2">
                    <input type="checkbox" id="lesson-free" class="w-4 h-4 text-primary-600 rounded border-gray-300">
                    <span class="text-sm text-gray-700">무료 공개 레슨</span>
                </label>
                <div class="flex justify-end gap-2 pt-2">
                    <button type="button" onclick="closeModalDirect()" class="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition">취소</button>
                    <button type="submit" class="px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition">추가</button>
                </div>
            </form>
        </div>
    `);
}

function createLesson(e, courseId, sectionId) {
    e.preventDefault();
    const courses = loadData('courses', []);
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    const section = course.sections.find(s => s.id === sectionId);
    if (!section) return;
    section.lessons.push({
        id: uid(),
        title: $('#lesson-title').value,
        duration: $('#lesson-duration').value,
        type: $('#lesson-type').value,
        isFree: $('#lesson-free').checked,
        order: section.lessons.length + 1,
    });
    saveData('courses', courses);
    closeModalDirect();
    showToast('레슨이 추가되었습니다');
    openCourseDetail(courseId);
}

function deleteLesson(courseId, sectionId, lessonId) {
    const courses = loadData('courses', []);
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    const section = course.sections.find(s => s.id === sectionId);
    if (!section) return;
    section.lessons = section.lessons.filter(l => l.id !== lessonId);
    saveData('courses', courses);
    showToast('레슨이 삭제되었습니다');
    openCourseDetail(courseId);
}

// --- Landing Page Preview ---
function previewLanding(courseId) {
    const courses = loadData('courses', []);
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    const students = loadData('students', []);
    const enrolled = students.filter(s => s.enrolledCourses.includes(courseId)).length;
    const totalLessons = course.sections.reduce((s, sec) => s + sec.lessons.length, 0);
    const totalDuration = course.sections.reduce((s, sec) => {
        return s + sec.lessons.reduce((ls, l) => {
            const parts = l.duration.split(':');
            return ls + parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
        }, 0);
    }, 0);
    const hours = Math.floor(totalDuration / 3600);
    const mins = Math.floor((totalDuration % 3600) / 60);
    const durationStr = hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;

    $('#main-content').innerHTML = `
        <div class="mb-4">
            <button onclick="openCourseDetail('${courseId}')" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                커리큘럼 편집
            </button>
        </div>

        <!-- Hero -->
        <div class="hero-gradient rounded-2xl p-6 md:p-10 text-white mb-6">
            <span class="badge bg-white/20 text-white mb-3">${course.category}</span>
            <h1 class="text-2xl md:text-3xl font-bold mb-3">${course.title}</h1>
            <p class="text-white/80 text-sm md:text-base mb-6 max-w-2xl">${course.description}</p>
            <div class="flex flex-wrap gap-4 text-sm text-white/70 mb-6">
                <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    총 ${durationStr}
                </span>
                <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    ${totalLessons}개 레슨
                </span>
                <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    ${enrolled}명 수강중
                </span>
            </div>
            <div class="flex items-center gap-4">
                <button onclick="showToast('데모 모드: 결제 기능은 실제로 동작하지 않습니다')" class="bg-white text-primary-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition">
                    ${fmtW(course.price)} 수강 신청
                </button>
                <button onclick="showToast('찜 목록에 추가되었습니다')" class="text-white border border-white/30 px-4 py-3 rounded-xl text-sm hover:bg-white/10 transition">
                    ♡ 찜하기
                </button>
            </div>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
            <div class="md:col-span-2">
                <!-- What you'll learn -->
                <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
                    <h3 class="text-base font-bold text-gray-900 mb-4">이런 걸 배워요</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        ${['실무에서 바로 활용 가능한 핵심 개념', '프로젝트 기반 실습으로 포트폴리오 완성', '최신 트렌드와 베스트 프랙티스', '초보자도 따라할 수 있는 단계별 학습'].map(item => `
                            <div class="flex items-start gap-2">
                                <svg class="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                                <span class="text-sm text-gray-700">${item}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Curriculum -->
                <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 class="text-base font-bold text-gray-900 mb-4">커리큘럼</h3>
                    <div class="space-y-3">
                        ${course.sections.map(sec => `
                            <div class="border border-gray-100 rounded-xl overflow-hidden">
                                <div class="px-4 py-3 bg-gray-50 flex items-center justify-between">
                                    <span class="text-sm font-semibold text-gray-800">${sec.title}</span>
                                    <span class="text-xs text-gray-400">${sec.lessons.length}개 레슨</span>
                                </div>
                                <div class="divide-y divide-gray-50">
                                    ${sec.lessons.map(les => `
                                        <div class="px-4 py-2.5 flex items-center justify-between">
                                            <div class="flex items-center gap-2">
                                                ${les.type === 'video' ? '<svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>' : '<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>'}
                                                <span class="text-sm text-gray-700">${les.title}</span>
                                                ${les.isFree ? '<span class="badge badge-blue">무료</span>' : ''}
                                            </div>
                                            <span class="text-xs text-gray-400">${les.duration}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-4">
                <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-20">
                    <div class="text-center mb-4">
                        <p class="text-3xl font-bold text-gray-900">${fmtW(course.price)}</p>
                        <p class="text-xs text-gray-400 mt-1 line-through">${fmtW(course.price * 1.5)}</p>
                        <span class="badge badge-red mt-1">33% 할인</span>
                    </div>
                    <button onclick="showToast('데모 모드: 결제 기능은 실제로 동작하지 않습니다')" class="w-full bg-primary-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-700 transition mb-2">수강 신청하기</button>
                    <button onclick="showToast('장바구니에 추가되었습니다')" class="w-full border border-gray-300 text-gray-700 py-3 rounded-xl text-sm hover:bg-gray-50 transition">장바구니 담기</button>
                    <div class="mt-4 space-y-2 text-sm text-gray-500">
                        <div class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> 총 ${durationStr} 분량</div>
                        <div class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg> 평생 무제한 시청</div>
                        <div class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg> 모바일 수강 지원</div>
                        <div class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> 수료증 발급</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- Students Page ---
function renderStudents() {
    const students = loadData('students', []);
    const courses = loadData('courses', []);

    const avgProgress = students.length > 0
        ? Math.round(students.reduce((s, st) => s + Object.values(st.progress).reduce((a, b) => a + b, 0) / Math.max(Object.keys(st.progress).length, 1), 0) / students.length)
        : 0;
    const totalRevenue = students.reduce((s, st) => s + st.totalPaid, 0);

    $('#main-content').innerHTML = `
        <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-900">수강생 관리</h2>
            <p class="text-sm text-gray-500 mt-1">총 ${students.length}명의 수강생</p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3 mb-6">
            <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                <p class="text-2xl font-bold text-primary-600">${students.length}</p>
                <p class="text-xs text-gray-500">총 수강생</p>
            </div>
            <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                <p class="text-2xl font-bold text-green-600">${avgProgress}%</p>
                <p class="text-xs text-gray-500">평균 진도율</p>
            </div>
            <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                <p class="text-2xl font-bold text-purple-600">${fmtW(totalRevenue)}</p>
                <p class="text-xs text-gray-500">총 결제액</p>
            </div>
        </div>

        <!-- Student List -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="table-responsive">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-100 bg-gray-50">
                            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">수강생</th>
                            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">수강 강의</th>
                            <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">진도율</th>
                            <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">결제액</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        ${students.map(st => {
                            const avgP = Object.values(st.progress).length > 0
                                ? Math.round(Object.values(st.progress).reduce((a, b) => a + b, 0) / Object.values(st.progress).length)
                                : 0;
                            const enrolledNames = st.enrolledCourses.map(cid => {
                                const c = courses.find(x => x.id === cid);
                                return c ? c.title : '삭제된 강의';
                            });
                            return `
                            <tr class="hover:bg-gray-50 transition">
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                                            <span class="text-primary-700 text-xs font-bold">${st.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-gray-900">${st.name}</p>
                                            <p class="text-xs text-gray-400">${st.enrolledAt} 등록</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-4 py-3 hidden sm:table-cell">
                                    <div class="flex flex-wrap gap-1">
                                        ${enrolledNames.map(n => `<span class="badge badge-blue truncate max-w-[120px]">${n}</span>`).join('')}
                                    </div>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex flex-col items-center">
                                        <span class="text-sm font-medium ${avgP >= 80 ? 'text-green-600' : avgP >= 40 ? 'text-yellow-600' : 'text-red-500'}">${avgP}%</span>
                                        <div class="w-16 h-1.5 bg-gray-200 rounded-full mt-1">
                                            <div class="h-full rounded-full progress-bar ${avgP >= 80 ? 'bg-green-500' : avgP >= 40 ? 'bg-yellow-500' : 'bg-red-400'}" style="width:${avgP}%"></div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <span class="text-sm font-semibold text-gray-700">${fmtW(st.totalPaid)}</span>
                                </td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// --- Revenue Page ---
function renderRevenue() {
    const revenue = loadData('revenue', []);
    const courses = loadData('courses', []);
    const products = loadData('products', []);

    const totalCourseRev = revenue.reduce((s, r) => s + r.courses, 0);
    const totalProductRev = revenue.reduce((s, r) => s + r.products, 0);
    const totalRev = totalCourseRev + totalProductRev;
    const latestMonth = revenue[revenue.length - 1] || { courses: 0, products: 0, month: '' };
    const prevMonth = revenue[revenue.length - 2] || { courses: 0, products: 0 };
    const growth = prevMonth.courses + prevMonth.products > 0
        ? Math.round(((latestMonth.courses + latestMonth.products) / (prevMonth.courses + prevMonth.products) - 1) * 100)
        : 0;

    $('#main-content').innerHTML = `
        <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-900">수익 분석</h2>
            <p class="text-sm text-gray-500 mt-1">매출 현황과 트렌드를 확인하세요</p>
        </div>

        <!-- Revenue Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div class="stat-card bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p class="text-xs text-gray-500 mb-1">총 수익</p>
                <p class="text-lg font-bold text-gray-900">${fmtW(totalRev)}</p>
            </div>
            <div class="stat-card bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p class="text-xs text-gray-500 mb-1">이번 달</p>
                <p class="text-lg font-bold text-green-600">${fmtW(latestMonth.courses + latestMonth.products)}</p>
                <span class="text-xs ${growth >= 0 ? 'text-green-500' : 'text-red-500'}">${growth >= 0 ? '↑' : '↓'} ${Math.abs(growth)}%</span>
            </div>
            <div class="stat-card bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p class="text-xs text-gray-500 mb-1">강의 수익</p>
                <p class="text-lg font-bold text-blue-600">${fmtW(totalCourseRev)}</p>
            </div>
            <div class="stat-card bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p class="text-xs text-gray-500 mb-1">상품 수익</p>
                <p class="text-lg font-bold text-purple-600">${fmtW(totalProductRev)}</p>
            </div>
        </div>

        <!-- Chart -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">월별 수익 추이</h3>
            <div class="chart-container">
                <canvas id="revenue-chart"></canvas>
            </div>
        </div>

        <!-- Revenue Breakdown -->
        <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 class="text-sm font-semibold text-gray-700 mb-4">수익 구성</h3>
                <div class="flex items-center justify-center mb-4">
                    <canvas id="pie-chart" width="160" height="160"></canvas>
                </div>
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span class="text-sm text-gray-700">강의 판매</span>
                        </div>
                        <span class="text-sm font-semibold">${Math.round(totalCourseRev / totalRev * 100)}%</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                            <span class="text-sm text-gray-700">디지털 상품</span>
                        </div>
                        <span class="text-sm font-semibold">${Math.round(totalProductRev / totalRev * 100)}%</span>
                    </div>
                </div>
            </div>

            <!-- Monthly Revenue Table -->
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 class="text-sm font-semibold text-gray-700 mb-4">월별 상세</h3>
                <div class="table-responsive">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-gray-100">
                                <th class="text-left py-2 text-xs text-gray-500">월</th>
                                <th class="text-right py-2 text-xs text-gray-500">강의</th>
                                <th class="text-right py-2 text-xs text-gray-500">상품</th>
                                <th class="text-right py-2 text-xs text-gray-500">합계</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            ${revenue.map(r => `
                                <tr>
                                    <td class="py-2 text-sm text-gray-700">${r.month}</td>
                                    <td class="py-2 text-sm text-right text-gray-600">${fmtW(r.courses)}</td>
                                    <td class="py-2 text-sm text-right text-gray-600">${fmtW(r.products)}</td>
                                    <td class="py-2 text-sm text-right font-semibold text-gray-900">${fmtW(r.courses + r.products)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Draw charts
    setTimeout(() => {
        drawRevenueChart(revenue);
        drawPieChart(totalCourseRev, totalProductRev);
    }, 50);
}

function drawRevenueChart(data) {
    const canvas = document.getElementById('revenue-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(2, 2);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const totals = data.map(d => d.courses + d.products);
    const maxVal = Math.max(...totals) * 1.1;

    // Grid lines
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();
        // Label
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        const val = maxVal - (maxVal / 4) * i;
        ctx.fillText(fmt(Math.round(val / 10000)) + '만', padding.left - 8, y + 3);
    }

    // Bars
    const barWidth = chartW / data.length * 0.6;
    const gap = chartW / data.length;

    data.forEach((d, i) => {
        const x = padding.left + gap * i + (gap - barWidth) / 2;
        const courseH = (d.courses / maxVal) * chartH;
        const productH = (d.products / maxVal) * chartH;

        // Course bar
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        const courseY = padding.top + chartH - courseH - productH;
        roundRect(ctx, x, courseY, barWidth / 2 - 1, courseH + productH, 3);
        ctx.fill();

        // Product bar
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        roundRect(ctx, x + barWidth / 2 + 1, padding.top + chartH - productH, barWidth / 2 - 1, productH, 3);
        ctx.fill();

        // Month label
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.month.split('-')[1] + '월', x + barWidth / 2, h - padding.bottom + 16);
    });

    // Legend
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(w - 150, 5, 10, 10);
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('강의', w - 136, 14);

    ctx.fillStyle = '#a855f7';
    ctx.fillRect(w - 90, 5, 10, 10);
    ctx.fillStyle = '#6b7280';
    ctx.fillText('상품', w - 76, 14);
}

function drawPieChart(courseRev, productRev) {
    const canvas = document.getElementById('pie-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 160;
    canvas.width = size * 2;
    canvas.height = size * 2;
    ctx.scale(2, 2);

    const total = courseRev + productRev;
    const cx = size / 2, cy = size / 2, r = 60;

    // Course slice
    const courseAngle = (courseRev / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + courseAngle);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();

    // Product slice
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, -Math.PI / 2 + courseAngle, -Math.PI / 2 + Math.PI * 2);
    ctx.fillStyle = '#a855f7';
    ctx.fill();

    // Inner circle (donut)
    ctx.beginPath();
    ctx.arc(cx, cy, 35, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Center text
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(fmtW(total), cx, cy + 5);
}

function roundRect(ctx, x, y, w, h, r) {
    if (h <= 0) return;
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
}

// --- Digital Products Page ---
function renderProducts() {
    const products = loadData('products', []);
    const totalSales = products.reduce((s, p) => s + p.salesCount, 0);
    const totalProductRev = products.reduce((s, p) => s + p.price * p.salesCount, 0);

    const typeEmoji = { 'notion-template': '📋', 'pdf': '📄', 'spreadsheet': '📊' };
    const typeLabel = { 'notion-template': '노션 템플릿', 'pdf': 'PDF', 'spreadsheet': '스프레드시트' };

    $('#main-content').innerHTML = `
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-xl font-bold text-gray-900">디지털 상품</h2>
                <p class="text-sm text-gray-500 mt-1">노션 템플릿, PDF 등 디지털 상품 관리</p>
            </div>
            <button onclick="openNewProductModal()" class="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                상품 등록
            </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3 mb-6">
            <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                <p class="text-2xl font-bold text-green-600">${products.length}</p>
                <p class="text-xs text-gray-500">등록 상품</p>
            </div>
            <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                <p class="text-2xl font-bold text-blue-600">${fmt(totalSales)}</p>
                <p class="text-xs text-gray-500">총 판매량</p>
            </div>
            <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                <p class="text-2xl font-bold text-purple-600">${fmtW(totalProductRev)}</p>
                <p class="text-xs text-gray-500">총 매출</p>
            </div>
        </div>

        <!-- Product Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${products.map(p => `
                <div class="product-card bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div class="bg-gradient-to-br ${p.type === 'notion-template' ? 'from-gray-800 to-gray-900' : 'from-red-500 to-red-700'} p-6 text-center">
                        <span class="text-4xl">${typeEmoji[p.type] || '📦'}</span>
                    </div>
                    <div class="p-4">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="badge ${p.type === 'notion-template' ? 'badge-purple' : 'badge-red'}">${typeLabel[p.type] || p.type}</span>
                        </div>
                        <h3 class="text-base font-semibold text-gray-900 mb-1">${p.title}</h3>
                        <p class="text-sm text-gray-500 mb-3 line-clamp-2">${p.description}</p>
                        <div class="flex items-center justify-between">
                            <span class="text-lg font-bold text-gray-900">${fmtW(p.price)}</span>
                            <span class="text-sm text-gray-400">${fmt(p.salesCount)}건 판매</span>
                        </div>
                        <div class="flex gap-2 mt-3">
                            <button onclick="showToast('상품 페이지 링크가 복사되었습니다')" class="flex-1 text-center text-sm bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition">링크 복사</button>
                            <button onclick="deleteProduct('${p.id}')" class="text-sm text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition">삭제</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function openNewProductModal() {
    openModal(`
        <div class="p-5">
            <h3 class="text-lg font-bold text-gray-900 mb-4">디지털 상품 등록</h3>
            <form onsubmit="createProduct(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">상품명</label>
                    <input type="text" id="product-title" required class="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="예: 개발자 이력서 노션 템플릿">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">상품 설명</label>
                    <textarea id="product-desc" required rows="3" class="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none" placeholder="상품에 대한 설명을 입력하세요"></textarea>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">유형</label>
                        <select id="product-type" class="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
                            <option value="notion-template">노션 템플릿</option>
                            <option value="pdf">PDF</option>
                            <option value="spreadsheet">스프레드시트</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">가격 (원)</label>
                        <input type="number" id="product-price" required min="0" step="100" class="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="15000">
                    </div>
                </div>
                <div class="flex justify-end gap-2 pt-2">
                    <button type="button" onclick="closeModalDirect()" class="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition">취소</button>
                    <button type="submit" class="px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition">등록</button>
                </div>
            </form>
        </div>
    `);
}

function createProduct(e) {
    e.preventDefault();
    const products = loadData('products', []);
    products.push({
        id: uid(),
        title: $('#product-title').value,
        type: $('#product-type').value,
        price: parseInt($('#product-price').value) || 0,
        description: $('#product-desc').value,
        salesCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
    });
    saveData('products', products);
    closeModalDirect();
    showToast('상품이 등록되었습니다');
    renderProducts();
}

function deleteProduct(id) {
    if (!confirm('이 상품을 삭제하시겠습니까?')) return;
    let products = loadData('products', []);
    products = products.filter(p => p.id !== id);
    saveData('products', products);
    showToast('상품이 삭제되었습니다');
    renderProducts();
}

// --- Pricing Page ---
function renderPricing() {
    $('#main-content').innerHTML = `
        <div class="mb-6 text-center">
            <h2 class="text-xl font-bold text-gray-900">가격 정책</h2>
            <p class="text-sm text-gray-500 mt-1">목적에 맞는 요금제를 선택하세요</p>
        </div>

        <div class="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <!-- Free -->
            <div class="pricing-card bg-white rounded-2xl border border-gray-200 p-6">
                <div class="text-center mb-6">
                    <h3 class="text-lg font-bold text-gray-900">무료</h3>
                    <div class="mt-3">
                        <span class="text-3xl font-bold text-gray-900">₩0</span>
                        <span class="text-sm text-gray-500">/월</span>
                    </div>
                    <p class="text-xs text-gray-400 mt-2">시작하기 완벽한 플랜</p>
                </div>
                <ul class="space-y-3 mb-6">
                    ${['강의 1개 등록', '기본 커리큘럼 빌더', '수강생 10명까지', '기본 수익 리포트', '이메일 지원'].map(f => `
                        <li class="flex items-center gap-2 text-sm text-gray-600">
                            <svg class="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                            ${f}
                        </li>
                    `).join('')}
                    ${['디지털 상품 판매', '고급 분석', '우선 지원'].map(f => `
                        <li class="flex items-center gap-2 text-sm text-gray-300">
                            <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                            ${f}
                        </li>
                    `).join('')}
                </ul>
                <button onclick="showToast('무료 플랜으로 시작합니다')" class="w-full py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition">무료로 시작</button>
            </div>

            <!-- Basic -->
            <div class="pricing-card featured bg-white rounded-2xl border-2 border-primary-500 p-6">
                <div class="text-center mb-6">
                    <h3 class="text-lg font-bold text-primary-700">베이직</h3>
                    <div class="mt-3">
                        <span class="text-3xl font-bold text-gray-900">₩29,000</span>
                        <span class="text-sm text-gray-500">/월</span>
                    </div>
                    <p class="text-xs text-gray-400 mt-2">성장하는 강사를 위한 플랜</p>
                </div>
                <ul class="space-y-3 mb-6">
                    ${['강의 10개 등록', '고급 커리큘럼 빌더', '수강생 500명까지', '상세 수익 분석', '디지털 상품 판매 (5개)', '쿠폰/할인 코드', '우선 이메일 지원'].map(f => `
                        <li class="flex items-center gap-2 text-sm text-gray-600">
                            <svg class="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                            ${f}
                        </li>
                    `).join('')}
                    ${['화이트라벨', 'API 접근'].map(f => `
                        <li class="flex items-center gap-2 text-sm text-gray-300">
                            <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                            ${f}
                        </li>
                    `).join('')}
                </ul>
                <button onclick="showToast('베이직 플랜 선택 (데모)')" class="w-full py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition">베이직 시작</button>
            </div>

            <!-- Pro -->
            <div class="pricing-card bg-white rounded-2xl border border-gray-200 p-6">
                <div class="text-center mb-6">
                    <h3 class="text-lg font-bold text-gray-900">프로</h3>
                    <div class="mt-3">
                        <span class="text-3xl font-bold text-gray-900">₩79,000</span>
                        <span class="text-sm text-gray-500">/월</span>
                    </div>
                    <p class="text-xs text-gray-400 mt-2">전문 강사를 위한 올인원</p>
                </div>
                <ul class="space-y-3 mb-6">
                    ${['강의 무제한 등록', '고급 커리큘럼 빌더', '수강생 무제한', '고급 수익 분석 + 내보내기', '디지털 상품 무제한', '쿠폰/할인 코드', '화이트라벨 브랜딩', 'API 접근', '전담 매니저 지원'].map(f => `
                        <li class="flex items-center gap-2 text-sm text-gray-600">
                            <svg class="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                            ${f}
                        </li>
                    `).join('')}
                </ul>
                <button onclick="showToast('프로 플랜 선택 (데모)')" class="w-full py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition">프로 시작</button>
            </div>
        </div>

        <!-- FAQ -->
        <div class="max-w-2xl mx-auto mt-8">
            <h3 class="text-base font-bold text-gray-900 text-center mb-4">자주 묻는 질문</h3>
            <div class="space-y-3">
                ${[
                    { q: '무료 플랜에서 유료로 업그레이드할 수 있나요?', a: '네, 언제든지 업그레이드할 수 있습니다. 기존 데이터는 모두 유지됩니다.' },
                    { q: '환불 정책은 어떻게 되나요?', a: '결제 후 7일 이내 환불 가능하며, 사용한 기능에 따라 부분 환불될 수 있습니다.' },
                    { q: '수수료가 있나요?', a: '강의 판매 시 결제 수수료 3.5%가 부과됩니다. 디지털 상품도 동일합니다.' },
                    { q: '계약 기간이 있나요?', a: '월 단위 구독이며, 언제든지 해지할 수 있습니다. 연간 결제 시 20% 할인됩니다.' },
                ].map(faq => `
                    <details class="bg-white rounded-xl border border-gray-100 shadow-sm group">
                        <summary class="px-4 py-3 text-sm font-medium text-gray-800 cursor-pointer list-none flex items-center justify-between">
                            ${faq.q}
                            <svg class="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                        </summary>
                        <div class="px-4 pb-3 text-sm text-gray-600">${faq.a}</div>
                    </details>
                `).join('')}
            </div>
        </div>
    `;
}

// --- Initialize ---
initDemoData();
navigate('dashboard');
