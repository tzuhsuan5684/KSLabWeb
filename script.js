// script.js

document.addEventListener('DOMContentLoaded', () => {

    // --- 全站共用功能 ---

    // 1. 深色模式切換 (Dark Mode Toggle)
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const sunIcon = darkModeToggle.querySelector('.fa-sun');
    const moonIcon = darkModeToggle.querySelector('.fa-moon');

    // 檢查 localStorage 中是否已儲存模式偏好
    if (localStorage.getItem('color-theme') === 'dark' || 
       (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }

    darkModeToggle.addEventListener('click', () => {
        // 切換 localStorage 中的值
        if (localStorage.getItem('color-theme')) {
            if (localStorage.getItem('color-theme') === 'light') {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            }
        } else {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            }
        }
        
        // 切換圖示
        sunIcon.classList.toggle('hidden');
        moonIcon.classList.toggle('hidden');
    });

    // 2. 手機版選單 (Mobile Menu)
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // 3. 回到頂部按鈕 (Back to Top Button)
    const backToTopButton = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.remove('hidden');
            backToTopButton.classList.add('flex'); // 使用 flex 以便置中
        } else {
            backToTopButton.classList.remove('flex');
            backToTopButton.classList.add('hidden');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 4. 動態更新頁尾年份 (Footer Year)
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }


    // --- 特定頁面功能 ---

    // 1. 研究系統頁面：即時搜尋 (systems.html)
    const systemSearchInput = document.getElementById('system-search-input');
    if (systemSearchInput) {
        const systemSections = document.querySelectorAll('#learning-systems, #tutor-systems, #esg-systems');
        const noSystemsFound = document.getElementById('no-systems-found');

        systemSearchInput.addEventListener('keyup', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            let totalVisibleCount = 0;

            systemSections.forEach(section => {
                const cards = section.querySelectorAll('.system-card');
                let sectionVisibleCount = 0;

                cards.forEach(card => {
                    const title = card.querySelector('h3').textContent.toLowerCase();
                    const description = card.querySelector('p').textContent.toLowerCase();
                    const features = Array.from(card.querySelectorAll('li')).map(li => li.textContent.toLowerCase()).join(' ');
                    const cardContent = title + ' ' + description + ' ' + features;

                    if (cardContent.includes(searchTerm)) {
                        card.style.display = 'flex';
                        sectionVisibleCount++;
                    } else {
                        card.style.display = 'none';
                    }
                });

                // 如果該區塊內有可見的卡片，則顯示區塊，否則隱藏
                if (sectionVisibleCount > 0) {
                    section.style.display = 'block';
                    totalVisibleCount += sectionVisibleCount;
                } else {
                    section.style.display = 'none';
                }
            });
            
            // 如果所有區塊都沒有結果，顯示 "找不到結果" 的訊息
            if (totalVisibleCount === 0) {
                noSystemsFound.style.display = 'block';
            } else {
                noSystemsFound.style.display = 'none';
            }
        });
    }

    // 2. 研究成果頁面：篩選與匯出 (publications.html)
    const filterYear = document.getElementById('filter-year');
    const filterCategory = document.getElementById('filter-category');
    const publicationsTable = document.getElementById('publications-table');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');

    if (publicationsTable) {
        const publicationItems = publicationsTable.querySelectorAll('tbody .publication-item');
        const noPublicationsFound = document.getElementById('no-publications-found');

        const applyFilters = () => {
            const selectedYear = filterYear.value;
            const selectedCategory = filterCategory.value;
            let visibleCount = 0;

            publicationItems.forEach(item => {
                const itemYear = item.dataset.year;
                const itemCategory = item.dataset.category;

                const yearMatch = (selectedYear === 'all' || itemYear === selectedYear);
                const categoryMatch = (selectedCategory === 'all' || itemCategory === selectedCategory);

                if (yearMatch && categoryMatch) {
                    item.style.display = 'table-row';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            if (visibleCount === 0) {
                noPublicationsFound.style.display = 'table-row';
            } else {
                noPublicationsFound.style.display = 'none';
            }
        };

        const exportToCsv = () => {
            const visibleRows = Array.from(publicationsTable.querySelectorAll('tbody tr:not([style*="display: none"])'));
            let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // \uFEFF for BOM
            csvContent += "標題與出處,作者,年份,類別\n"; // Header

            visibleRows.forEach(row => {
                if(row.classList.contains('publication-item')) {
                    const cols = row.querySelectorAll('td');
                    const title = `"${cols[0].innerText.replace(/"/g, '""')}"`;
                    const authors = `"${cols[1].textContent.replace(/"/g, '""')}"`;
                    const year = cols[2].textContent;
                    const category = cols[3].textContent;
                    csvContent += [title, authors, year, category].join(',') + "\n";
                }
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "ks_lab_publications.csv"); // 更新檔名
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        if (filterYear && filterCategory) {
            filterYear.addEventListener('change', applyFilters);
            filterCategory.addEventListener('change', applyFilters);
        }

        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                filterYear.value = 'all';
                filterCategory.value = 'all';
                applyFilters();
            });
        }
        
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', exportToCsv);
        }
    }
});
