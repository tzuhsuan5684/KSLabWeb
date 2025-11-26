// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- 全站共用功能 ---
    handleMobileMenu();
    handleBackToTopButton();
    updateFooterYear();

    // --- 根據目前頁面執行特定功能 ---
    const page = window.location.pathname.split("/").pop() || 'index.html';
    console.log('Current page:', page);

    // 首頁（包括根路徑、空值、index.html）
    if (page === 'index.html' || page === '' || page.endsWith('/')) {
        if (document.getElementById('news-container')) {
            loadNewsData(4);
        }
        if (document.getElementById('activities-container')) {
            loadActivitiesData();
        }
    }
    // 公告頁面
    if (page === 'news.html') {
        loadNewsData();
    }
    if (page === 'projects.html') {
        loadProjectsData();
    }
    if (page === 'team.html') {
        loadTeamData();
    }
    if (page === 'publications.html') {
        loadPublicationsData();
    }
    if (page === 'systems.html') {
        setupSystemSearch();
    }
});

// --- 全站共用函式 ---

function handleMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

function handleBackToTopButton() {
    const backToTopButton = document.getElementById('back-to-top');
    if (!backToTopButton) return;

    window.addEventListener('scroll', () => {
        backToTopButton.classList.toggle('hidden', window.pageYOffset <= 300);
        backToTopButton.classList.toggle('flex', window.pageYOffset > 300);
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function updateFooterYear() {
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
}

// --- 首頁功能 (index.html) ---

async function loadNewsData(limit = null) {
    const container = document.getElementById('news-container');
    if (!container) {
        console.warn('news-container not found');
        return;
    }

    try {
        console.log('Loading news data...');
        const response = await fetch('data/news.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        let newsData = await response.json();
        console.log('News data loaded:', newsData);

        if (limit && typeof limit === 'number') {
            newsData = newsData.slice(0, limit);
        }

        renderNews(newsData);
    } catch (error) {
        console.error("無法載入公告資料:", error);
        const container = document.getElementById('news-container');
        if (container) container.innerHTML = `<p class="text-center text-red-500">無法載入公告資料：${error.message}</p>`;
    }
}

function renderNews(newsData) {
    const container = document.getElementById('news-container');
    if (!container) return;

    if (newsData.length === 0) {
        container.innerHTML = '<p class="text-center text-slate-500">目前沒有最新公告。</p>';
        return;
    }

    // 定義類別顏色
    const categoryColors = {
        '榮譽': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        '招生': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        '演講': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        '學術': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        '其他': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };

    container.innerHTML = newsData.map(item => {
        const colorClass = categoryColors[item.category] || categoryColors['其他'];
        return `
        <div class="news-item flex flex-col md:flex-row gap-4 items-start bg-slate-50 dark:bg-slate-800 p-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-l-4 border-transparent hover:border-blue-500">
            <div class="date-category shrink-0 flex flex-row md:flex-col items-center md:items-start gap-2 md:w-32">
                <span class="text-sm font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    <i class="far fa-calendar-alt mr-1"></i>${item.date}
                </span>
                <span class="text-xs font-medium px-2.5 py-0.5 rounded ${colorClass}">
                    ${item.category}
                </span>
            </div>
            <div class="content grow">
                <div class="block group">
                    <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-1">
                        ${item.link ? `<a href="${item.link}" target="_blank" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">${item.title}</a>` : item.title}
                    </h3>
                    <p class="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                        ${item.summary}
                    </p>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

async function loadActivitiesData() {
    const container = document.getElementById('activities-container');
    if (!container) return;

    try {
        const response = await fetch('data/activities.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const activitiesData = await response.json();
        renderActivities(activitiesData);
    } catch (error) {
        console.error("無法載入活動資料:", error);
        container.innerHTML = `<div class="pl-6"><p class="text-red-500">無法載入活動資料</p></div>`;
    }
}

function renderActivities(data) {
    const container = document.getElementById('activities-container');
    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = '<div class="pl-6"><p class="text-slate-500">目前沒有近期活動。</p></div>';
        return;
    }

    container.innerHTML = data.map((item, index) => `
        <div class="relative pl-6 group">
            <!-- Timeline Dot -->
            <div class="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 bg-slate-300 dark:bg-slate-600 group-hover:bg-green-500 transition-colors shadow-sm"></div>
            
            <!-- Content -->
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start">
                <div class="date shrink-0 w-24 pt-0.5">
                    <span class="text-sm font-mono text-slate-500 dark:text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        ${item.date}
                    </span>
                </div>
                <div class="activity-content pb-1">
                    <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        ${item.link ? `<a href="${item.link}" target="_blank" class="hover:underline">${item.title} <i class="fas fa-external-link-alt text-xs ml-1 opacity-70"></i></a>` : item.title}
                    </h3>
                    <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        ${item.description}
                    </p>
                </div>
            </div>
        </div>
    `).join('');
}

// --- 實驗室計畫頁面功能 (projects.html) ---

async function loadProjectsData() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    try {
        const response = await fetch('data/projects.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const projectsData = await response.json();
        renderProjects(projectsData);
    } catch (error) {
        console.error("無法載入計畫資料:", error);
        container.innerHTML = `<p class="text-center text-red-500">無法載入計畫資料：${error.message}</p>`;
    }
}

function renderProjects(projectsData) {
    const container = document.getElementById('projects-container');
    if (!container) return;

    if (projectsData.length === 0) {
        container.innerHTML = '<p class="text-center text-slate-500">目前沒有計畫資料。</p>';
        return;
    }

    const categoryColors = {
        '國科會計畫': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        '教育部計畫': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        '產學合作': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        '其他': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };

    container.innerHTML = projectsData.map(project => {
        const colorClass = categoryColors[project.category] || categoryColors['其他'];
        return `
        <div class="project-item bg-slate-50 dark:bg-slate-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2 md:mb-0">${project.title}</h3>
                <span class="${colorClass} text-sm font-medium px-2.5 py-0.5 rounded whitespace-nowrap">
                    ${project.category}
                </span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 dark:text-slate-400">
                <p><i class="fas fa-building mr-2 w-5 text-center"></i><strong>補助單位:</strong> ${project.agency}</p>
                <p><i class="far fa-calendar-alt mr-2 w-5 text-center"></i><strong>執行期間:</strong> ${project.duration}</p>
            </div>
        </div>
    `}).join('');
}

// --- 研究團隊頁面功能 (team.html) ---

async function loadTeamData() {
    try {
        const response = await fetch('data/team.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // 渲染所有成員
        renderProfessor(data.professor);
        renderTeamMembers('postdocs-grid', data.postdocs);
        renderTeamMembers('assistants-grid', data.assistants);
        renderTeamMembers('phd-students-grid', data.phd_students);

        if (data.master_students) {
            renderTeamMembers('master-second-year-grid', data.master_students.second_year);
            renderTeamMembers('master-first-year-grid', data.master_students.first_year);
            renderTeamMembers('master-zero-year-grid', data.master_students.zero_year);
        }

        renderAlumni('alumni-groups-container', data.alumni);

        // 設定篩選器
        setupTeamFilters();

    } catch (error) {
        console.error("無法載入團隊資料:", error);
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.innerHTML = `<p class="text-center text-red-500 col-span-full">無法載入團隊資料。請檢查檔案路徑是否正確，或嘗試在網頁伺服器上運行。</p>`;
        }
    }
}

function setupTeamFilters() {
    const filterButtons = document.querySelectorAll('#team-filter-buttons .filter-btn');
    const currentMembersContainer = document.getElementById('current-members-container');
    const alumniContainer = document.getElementById('alumni-container');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active-filter'));
            button.classList.add('active-filter');

            const filter = button.dataset.filter;

            if (filter === 'current') {
                currentMembersContainer.classList.remove('hidden');
                alumniContainer.classList.add('hidden');
            } else if (filter === 'alumni') {
                currentMembersContainer.classList.add('hidden');
                alumniContainer.classList.remove('hidden');
            }
        });
    });
}


function renderProfessor(professor) {
    const section = document.getElementById('professor-section');
    if (!section || !professor) return;

    const titlesHTML = professor.titles.map(t => `
        <li class="flex items-start">
            <span class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-3 mt-0.5">
                <i class="${t.icon} text-blue-600 dark:text-blue-400 text-sm"></i>
            </span>
            <span class="text-slate-700 dark:text-slate-300 leading-relaxed py-1">${t.text}</span>
        </li>
    `).join('');

    const honorsHTML = professor.honors.map(h => `
        <li class="flex items-start group">
            <span class="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center mr-3 mt-0.5 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900 transition-colors">
                <i class="${h.icon} text-yellow-600 dark:text-yellow-400 text-sm"></i>
            </span>
            <span class="text-slate-700 dark:text-slate-300 leading-relaxed py-1 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">${h.text}</span>
        </li>
    `).join('');

    const positionClass = professor.img_position ? `object-position-${professor.img_position}` : '';

    section.innerHTML = `
        <h2 class="text-3xl font-bold text-center mb-12 relative inline-block left-1/2 transform -translate-x-1/2">
            <span class="relative z-10">指導教授</span>
            <div class="absolute bottom-0 left-0 w-full h-3 bg-blue-200 dark:bg-blue-900/50 -z-0 opacity-60 transform -rotate-1"></div>
        </h2>
        
        <div class="relative bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden max-w-6xl mx-auto border border-slate-100 dark:border-slate-700">
            <!-- Decorative Background Elements -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            <div class="absolute bottom-0 left-0 w-64 h-64 bg-purple-50 dark:bg-purple-900/20 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

            <div class="relative z-10 flex flex-col lg:flex-row">
                <!-- Left Column: Image -->
                <div class="lg:w-1/3 p-8 lg:p-12 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/50 lg:border-r border-slate-100 dark:border-slate-700">
                    <div class="relative w-64 h-64 lg:w-72 lg:h-72 mb-8 group">
                        <div class="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                        <div class="relative w-full h-full rounded-full border-4 border-white dark:border-slate-700 shadow-2xl overflow-hidden">
                            <img src="${professor.image}" alt="${professor.name}" class="w-full h-full object-cover ${positionClass} transform group-hover:scale-105 transition-transform duration-700">
                        </div>
                    </div>
                    
                    <div class="text-center w-full space-y-4">
                        <h3 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                            ${professor.name}
                        </h3>
                        
                        <div class="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/50 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <a href="mailto:${professor.email}" class="flex items-center justify-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1">
                                <i class="fas fa-envelope mr-2.5 text-blue-500"></i>${professor.email}
                            </a>
                            ${professor.office ? `
                            <div class="flex items-center justify-center p-1 border-t border-slate-100 dark:border-slate-700 pt-2">
                                <i class="fas fa-map-marker-alt mr-2.5 text-red-500"></i>${professor.office}
                            </div>` : ''}
                            ${professor.ext ? `
                            <div class="flex items-center justify-center p-1 border-t border-slate-100 dark:border-slate-700 pt-2">
                                <i class="fas fa-phone mr-2.5 text-green-500"></i>分機: ${professor.ext}
                            </div>` : ''}
                            ${professor.website ? `
                            <div class="flex items-center justify-center p-1 border-t border-slate-100 dark:border-slate-700 pt-2">
                                <a href="${professor.website}" target="_blank" class="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    <i class="fas fa-globe mr-2.5 text-indigo-500"></i>個人網頁
                                </a>
                            </div>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Right Column: Info -->
                <div class="lg:w-2/3 p-8 lg:p-12">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <!-- Titles Section -->
                        <div class="space-y-6">
                            <div class="flex items-center space-x-3 mb-6">
                                <div class="w-1 h-8 bg-blue-500 rounded-full"></div>
                                <h4 class="text-xl font-bold text-slate-800 dark:text-slate-100">主要職務</h4>
                            </div>
                            <ul class="space-y-4">
                                ${titlesHTML}
                            </ul>
                        </div>

                        <!-- Honors Section -->
                        <div class="space-y-6">
                            <div class="flex items-center space-x-3 mb-6">
                                <div class="w-1 h-8 bg-yellow-500 rounded-full"></div>
                                <h4 class="text-xl font-bold text-slate-800 dark:text-slate-100">榮譽獎項</h4>
                            </div>
                            <div class="bg-yellow-50/50 dark:bg-yellow-900/10 rounded-2xl p-6 border border-yellow-100 dark:border-yellow-900/30">
                                <ul class="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    ${honorsHTML}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderTeamMembers(gridId, members) {
    const grid = document.getElementById(gridId);
    const section = grid ? grid.closest('section') : null;

    if (!grid || !section) return;

    if (!members || members.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = '';
    grid.innerHTML = members.map(member => {
        const positionClass = member.img_position ? `object-position-${member.img_position}` : '';
        return `
        <div class="team-member-card text-center bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col h-full">
            <div class="w-32 h-32 rounded-full mx-auto mb-4 shadow-md overflow-hidden">
                <img src="${member.image}" alt="${member.name}" class="w-full h-full object-cover ${positionClass}">
            </div>
            <div class="flex-grow mb-4">
                <h4 class="text-xl font-semibold">${member.name}</h4>
            </div>
            <div class="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2 text-sm text-left">
                ${member.email ? `
                <div class="flex items-start">
                    <i class="fas fa-envelope fa-fw mr-2 w-4 text-center mt-1 text-slate-400"></i>
                    <a href="mailto:${member.email}" class="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors break-all">${member.email}</a>
                </div>` : ''}
                ${member.office ? `
                <div class="flex items-center text-slate-500 dark:text-slate-400">
                    <i class="fas fa-map-marker-alt fa-fw mr-2 w-4 text-center"></i> ${member.office}
                </div>` : ''}
                ${member.ext ? `
                <div class="flex items-center text-slate-500 dark:text-slate-400">
                    <i class="fas fa-phone fa-fw mr-2 w-4 text-center"></i> 分機: ${member.ext}
                </div>` : ''}
            </div>
        </div>
    `}).join('');
}

// ===== UPDATED FUNCTION: Renders alumni separated by degree =====
function renderAlumni(containerId, alumniData) {
    const container = document.getElementById(containerId);
    if (!container || !alumniData) {
        const mainContainer = document.getElementById('alumni-container');
        if (mainContainer) mainContainer.style.display = 'none';
        return;
    }

    // Clear previous content
    container.innerHTML = '';

    // Helper function to create alumni cards
    const createAlumniCards = (members) => {
        if (!members || members.length === 0) return '';
        return members.map(member => `
            <div class="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 dark:border-slate-700 overflow-hidden">
                <!-- Top Gradient Bar -->
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                
                <!-- Decorative Background -->
                <div class="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 dark:bg-slate-700/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>

                <div class="relative z-10">
                    <!-- Header -->
                    <div class="flex items-center justify-center mb-6">
                        <div class="w-12 h-12 rounded-full bg-blue-50 dark:bg-slate-700 flex items-center justify-center text-blue-500 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                            <i class="fas fa-user-graduate text-xl"></i>
                        </div>
                    </div>

                    <h4 class="text-xl font-bold text-center text-slate-800 dark:text-slate-100 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        ${member.name}
                    </h4>
                    
                    <div class="space-y-3">
                        <div class="flex items-start justify-center text-sm">
                            <i class="fas fa-building mt-1 mr-2 text-slate-400 group-hover:text-blue-500 transition-colors"></i>
                            <span class="font-medium text-slate-600 dark:text-slate-300 text-center">${member.company}</span>
                        </div>
                        
                        ${member.job_title ? `
                        <div class="flex items-center justify-center text-sm">
                            <i class="fas fa-briefcase mr-2 text-slate-400 group-hover:text-purple-500 transition-colors"></i>
                            <span class="text-slate-500 dark:text-slate-400">${member.job_title}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    };

    // Render PhD alumni section
    if (alumniData.phd && alumniData.phd.length > 0) {
        const phdSection = document.createElement('div');
        phdSection.className = 'alumni-section mb-12';
        phdSection.innerHTML = `
            <h3 class="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100 border-b-2 border-blue-500 pb-2">
                <i class="fas fa-graduation-cap mr-2 text-blue-500"></i>博士班畢業
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                ${createAlumniCards(alumniData.phd)}
            </div>
        `;
        container.appendChild(phdSection);
    }

    // Render Master alumni section
    if (alumniData.master && alumniData.master.length > 0) {
        const masterSection = document.createElement('div');
        masterSection.className = 'alumni-section';
        masterSection.innerHTML = `
            <h3 class="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100 border-b-2 border-blue-500 pb-2">
                <i class="fas fa-user-graduate mr-2 text-blue-500"></i>碩士班畢業
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                ${createAlumniCards(alumniData.master)}
            </div>
        `;
        container.appendChild(masterSection);
    }
}


// --- 研究成果頁面功能 (publications.html) ---

let allPublications = [];

async function loadPublicationsData() {
    try {
        const response = await fetch('data/publications.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        allPublications = await response.json();

        populateFilters(allPublications);
        renderPublications(allPublications);
        setupPublicationEventListeners();

    } catch (error) {
        console.error("無法載入研究成果資料:", error);
        const mainContent = document.querySelector('main');
        if (mainContent) mainContent.innerHTML = `<p class="text-center text-red-500">無法載入研究成果資料，請稍後再試。</p>`;
    }
}

function populateFilters(data) {
    const yearFilter = document.getElementById('filter-year');
    if (!yearFilter) return;

    const years = [...new Set(data.map(item => item.year))].sort((a, b) => b - a);

    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
}

function renderPublications(data) {
    const container = document.getElementById('publications-list');
    const noResults = document.getElementById('no-publications-found');
    if (!container || !noResults) return;

    container.innerHTML = '';

    if (data.length === 0) {
        noResults.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');

    container.innerHTML = data.map(item => {
        const hasLink = item.link && item.link.trim() !== '';

        const titleHtml = hasLink
            ? `<a href="${item.link}" target="_blank" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">${item.title}</a>`
            : item.title;

        const buttonHtml = hasLink
            ? `<div class="flex-shrink-0 mt-2 md:mt-0">
                 <a href="${item.link}" target="_blank" class="inline-flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-slate-700 dark:text-blue-400 dark:hover:bg-slate-600 rounded-md transition-colors text-sm font-medium">
                    <i class="fas fa-external-link-alt mr-2"></i>View
                </a>
               </div>`
            : '';

        return `
        <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-blue-500">
            <div class="flex flex-col md:flex-row justify-between items-start gap-4">
                <div class="flex-grow">
                    <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">
                        ${titleHtml}
                    </h3>
                    <p class="text-slate-600 dark:text-slate-300 mb-2 text-sm">
                        <i class="fas fa-users mr-2 text-slate-400"></i>${item.authors}
                    </p>
                    <div class="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <span class="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                            <i class="far fa-calendar-alt mr-1"></i>${item.year}
                        </span>
                        <span class="italic">
                            <i class="fas fa-book mr-1"></i>${item.source}
                        </span>
                    </div>
                </div>
                ${buttonHtml}
            </div>
        </div>
    `}).join('');
}

function setupPublicationEventListeners() {
    const yearFilter = document.getElementById('filter-year');
    const clearBtn = document.getElementById('clear-filters-btn');
    const exportBtn = document.getElementById('export-csv-btn');

    const applyFilters = () => {
        const selectedYear = yearFilter.value;

        const filteredData = allPublications.filter(item => {
            const yearMatch = (selectedYear === 'all' || item.year.toString() === selectedYear);
            return yearMatch;
        });
        renderPublications(filteredData);
    };

    if (yearFilter) yearFilter.addEventListener('change', applyFilters);

    if (clearBtn) clearBtn.addEventListener('click', () => {
        if (yearFilter) yearFilter.value = 'all';
        renderPublications(allPublications);
    });

    if (exportBtn) exportBtn.addEventListener('click', exportToCsv);
}

function exportToCsv() {
    // 簡單起見，直接匯出當前篩選後的資料 (如果需要完全對應畫面可見性，需追蹤 filteredData)
    // 這裡我們重新執行一次篩選邏輯來獲取當前資料，或者直接使用全域變數 (如果我們有存 filteredData)
    // 為了簡單，我們重新讀取 filter 的值來過濾

    const yearFilter = document.getElementById('filter-year');
    const selectedYear = yearFilter ? yearFilter.value : 'all';

    const dataToExport = allPublications.filter(item => {
        return (selectedYear === 'all' || item.year.toString() === selectedYear);
    });

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "標題,作者,年份,類別,出處,連結\n";

    dataToExport.forEach(item => {
        const row = [item.title, item.authors, item.year, item.category, item.source, item.link]
            .map(field => `"${(field || '').toString().replace(/"/g, '""')}"`)
            .join(',');
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "kslab_publications.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// --- 研究系統頁面功能 (systems.html) ---

function setupSystemSearch() {
    const searchInput = document.getElementById('system-search-input');
    if (!searchInput) return;

    const systemSections = document.querySelectorAll('section[id$="-systems"]');
    const noResults = document.getElementById('no-systems-found');

    searchInput.addEventListener('keyup', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let totalVisibleCount = 0;

        systemSections.forEach(section => {
            const cards = section.querySelectorAll('.system-card');
            let sectionVisibleCount = 0;

            cards.forEach(card => {
                const isVisible = card.textContent.toLowerCase().includes(searchTerm);
                card.style.display = isVisible ? 'flex' : 'none';
                if (isVisible) sectionVisibleCount++;
            });

            section.style.display = sectionVisibleCount > 0 ? 'block' : 'none';
            totalVisibleCount += sectionVisibleCount;
        });

        noResults.style.display = totalVisibleCount === 0 ? 'block' : 'none';
    });
}
