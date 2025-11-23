// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- 全站共用功能 ---
    handleDarkMode();
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

function handleDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (!darkModeToggle) return;
    const sunIcon = darkModeToggle.querySelector('.fa-sun');
    const moonIcon = darkModeToggle.querySelector('.fa-moon');

    const isDark = localStorage.getItem('color-theme') === 'dark' ||
                   (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.classList.toggle('dark', isDark);
    sunIcon.classList.toggle('hidden', isDark);
    moonIcon.classList.toggle('hidden', !isDark);

    darkModeToggle.addEventListener('click', () => {
        const isCurrentlyDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('color-theme', isCurrentlyDark ? 'dark' : 'light');
        sunIcon.classList.toggle('hidden');
        moonIcon.classList.toggle('hidden');
    });
}

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
        if(container) container.innerHTML = `<p class="text-center text-red-500">無法載入公告資料：${error.message}</p>`;
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
        '活動': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
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
                <a href="${item.link}" class="block group">
                    <h3 class="text-lg font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                        ${item.title}
                    </h3>
                    <p class="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                        ${item.summary}
                    </p>
                </a>
            </div>
            <div class="action shrink-0 hidden md:flex items-center h-full">
                <a href="${item.link}" class="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </div>
        </div>
        `;
    }).join('');
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
        if(mainContent) {
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

    const titlesHTML = professor.titles.map(t => `<li><i class="${t.icon} fa-fw mr-2 text-blue-500"></i>${t.text}</li>`).join('');
    const honorsHTML = professor.honors.map(h => `<li><i class="${h.icon} fa-fw mr-2 text-yellow-500"></i>${h.text}</li>`).join('');
    
    const positionClass = professor.img_position ? `object-position-${professor.img_position}` : '';

    section.innerHTML = `
        <h2 class="text-3xl font-bold text-center mb-8">指導教授</h2>
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <div class="flex-shrink-0 w-36 h-36 md:w-48 md:h-48 rounded-full border-4 border-blue-200 dark:border-blue-700 overflow-hidden">
                <img src="${professor.image}" alt="${professor.name}" class="w-full h-full object-cover ${positionClass}">
            </div>
            <div class="text-left w-full">
                <h3 class="text-3xl font-bold text-blue-600 dark:text-blue-400">${professor.name}</h3>
                <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                        <h4 class="font-semibold text-lg mb-2 text-slate-800 dark:text-slate-100">主要職務</h4>
                        <ul class="space-y-2 text-slate-600 dark:text-slate-300 list-none pl-0">${titlesHTML}</ul>
                    </div>
                    <div>
                        <h4 class="font-semibold text-lg mb-2 text-slate-800 dark:text-slate-100">榮譽獎項</h4>
                        <ul class="space-y-2 text-slate-600 dark:text-slate-300 list-none pl-0">${honorsHTML}</ul>
                    </div>
                </div>
                <div class="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-slate-600 dark:text-slate-300">
                    <p><i class="fas fa-envelope fa-fw mr-2"></i><a href="mailto:${professor.email}" class="hover:text-blue-500">${professor.email}</a></p>
                    ${professor.office ? `<p><i class="fas fa-map-marker-alt fa-fw mr-2"></i>${professor.office}</p>` : ''}
                    ${professor.ext ? `<p><i class="fas fa-phone fa-fw mr-2"></i>分機: ${professor.ext}</p>` : ''}
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

// ===== UPDATED FUNCTION: Renders all alumni in a single grid =====
function renderAlumni(containerId, alumniData) {
    const container = document.getElementById(containerId);
    if (!container || !alumniData || alumniData.length === 0) {
        const mainContainer = document.getElementById('alumni-container');
        if(mainContainer) mainContainer.style.display = 'none';
        return;
    }

    // 2. Clear previous content
    container.innerHTML = '';

    // 3. Create a single grid for all alumni
    const grid = document.createElement('div');
    grid.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8";

    grid.innerHTML = alumniData.map(member => {
        return `
        <div class="team-member-card text-center bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
            <h4 class="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">${member.name}</h4>
            
            <div class="flex-grow flex flex-col justify-center mb-4">
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">現職</p>
                <p class="font-semibold text-blue-600 dark:text-blue-400 text-lg">${member.company}</p>
            </div>

            ${member.email ? `
            <div class="mt-auto pt-3 border-t border-slate-200 dark:border-slate-700">
                <a href="mailto:${member.email}" class="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors inline-flex items-center break-all">
                    <i class="fas fa-envelope mr-2"></i>${member.email}
                </a>
            </div>` : ''}
        </div>
        `;
    }).join('');

    container.appendChild(grid);
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
        if(mainContent) mainContent.innerHTML = `<p class="text-center text-red-500">無法載入研究成果資料，請稍後再試。</p>`;
    }
}

function populateFilters(data) {
    const yearFilter = document.getElementById('filter-year');
    const categoryFilter = document.getElementById('filter-category');
    if (!yearFilter || !categoryFilter) return;

    const years = [...new Set(data.map(item => item.year))].sort((a, b) => b - a);
    const categories = [...new Set(data.map(item => item.category))];

    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function renderPublications(data) {
    const tbody = document.getElementById('publications-tbody');
    const noResults = document.getElementById('no-publications-found');
    if (!tbody || !noResults) return;

    tbody.innerHTML = ''; 

    if (data.length === 0) {
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');

    const categoryColors = {
        '論文': 'purple',
        '專案': 'blue',
        '產學合作': 'green',
        '獎項': 'yellow'
    };

    data.forEach(item => {
        const color = categoryColors[item.category] || 'gray';
        const row = document.createElement('tr');
        row.className = 'publication-item border-t border-slate-200 dark:border-slate-700';
        row.innerHTML = `
            <td class="p-4 font-medium">
                <a href="${item.link}" target="_blank" class="text-blue-600 hover:underline dark:text-blue-400">${item.title}</a>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 italic">${item.source}</p>
                <p class="text-sm text-slate-600 dark:text-slate-400 mt-2 md:hidden"><strong>作者:</strong> ${item.authors}</p>
            </td>
            <td class="p-4 text-slate-600 dark:text-slate-400 hidden md:table-cell">${item.authors}</td>
            <td class="p-4 text-center text-slate-600 dark:text-slate-400">${item.year}</td>
            <td class="p-4 text-center">
                <span class="bg-${color}-100 text-${color}-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-${color}-900 dark:text-${color}-300">${item.category}</span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function setupPublicationEventListeners() {
    const yearFilter = document.getElementById('filter-year');
    const categoryFilter = document.getElementById('filter-category');
    const clearBtn = document.getElementById('clear-filters-btn');
    const exportBtn = document.getElementById('export-csv-btn');

    const applyFilters = () => {
        const selectedYear = yearFilter.value;
        const selectedCategory = categoryFilter.value;

        const filteredData = allPublications.filter(item => {
            const yearMatch = (selectedYear === 'all' || item.year.toString() === selectedYear);
            const categoryMatch = (selectedCategory === 'all' || item.category === selectedCategory);
            return yearMatch && categoryMatch;
        });
        renderPublications(filteredData);
    };

    yearFilter.addEventListener('change', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);

    clearBtn.addEventListener('click', () => {
        yearFilter.value = 'all';
        categoryFilter.value = 'all';
        renderPublications(allPublications);
    });

    exportBtn.addEventListener('click', exportToCsv);
}

function exportToCsv() {
    const visibleItems = allPublications.filter(item => {
         const row = document.querySelector(`a[href="${item.link}"]`);
         return row && row.closest('tr').style.display !== 'none';
    });
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "標題,作者,年份,類別,出處,連結\n";

    const dataToExport = visibleItems.length > 0 ? visibleItems : allPublications;

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
