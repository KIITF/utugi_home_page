document.addEventListener('DOMContentLoaded', function () {

    // 設定定数
    const CONFIG = {
        GRID: {
            ROWS: 3,
            COLS: 5
        },
        LOADING: {
            DOM_UPDATE_DELAY: 100,
            FADE_OUT_DELAY: 300
        },
        VIDEO: {
            PRELOAD: 'metadata',
            START_TIME: 0.2
        },
        CHART: {
            ANIMATION_DURATION: 1500,
            OBSERVER_THRESHOLD: 0.5
        },
        HISTORY: {
            ITEMS_TO_DISPLAY: 3
        }
    };

    const CSS_CLASSES = {
        ACTIVE_TAB: 'active-tab',
        ACTIVE: 'active',
        HIDDEN: 'hidden',
        GALLERY_ITEM: 'gallery-item',
        MOBILE_MENU_LINK: 'mobile-menu-link',
        HISTORY_ITEM: 'history-item'
    };

    const REQUEST_CATEGORIES = {
        ORIGINAL_MV: 'オリジナル楽曲MV制作',
        COVER_MV: '歌ってみたMV制作',
        SHORT_MOVIE: 'ショートムービー制作',
        OTHER: 'その他'
    };

    const CHART_COLORS = {
        BACKGROUNDS: ['rgba(193, 217, 199, 0.8)', 'rgba(218, 232, 221, 0.8)', 'rgba(167, 201, 176, 0.7)', 'rgba(141, 185, 153, 0.8)', 'rgba(229, 239, 233, 0.8)'],
        BORDERS: ['rgba(193, 217, 199, 1)', 'rgba(218, 232, 221, 1)', 'rgba(167, 201, 176, 1)', 'rgba(141, 185, 153, 1)', 'rgba(229, 239, 233, 1)']
    };

    function getGridPositionClasses(cells) {
        const numRows = CONFIG.GRID.ROWS, numCols = CONFIG.GRID.COLS;
        let minRow = numRows + 1, maxRow = 0, minCol = numCols + 1, maxCol = 0;
        cells.forEach(cellNumber => {
            const row = Math.floor((cellNumber - 1) / numCols) + 1;
            const col = ((cellNumber - 1) % numCols) + 1;
            if (row < minRow) minRow = row;
            if (row > maxRow) maxRow = row;
            if (col < minCol) minCol = col;
            if (col > maxCol) maxCol = col;
        });
        return `col-start-${minCol} col-span-${maxCol - minCol + 1} row-start-${minRow} row-span-${maxRow - minRow + 1}`;
    }

    function populateGallery(containerId, pathPrefix, itemsData) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        itemsData.forEach(itemData => {
            const itemWrapper = document.createElement('div');
            itemWrapper.className = `${CSS_CLASSES.GALLERY_ITEM} ${getGridPositionClasses(itemData.cells)}`;
            const link = document.createElement('a');
            link.href = itemData.link;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            let mediaElement;
            const mediaPath = `${pathPrefix}${itemData.fileName}`;
            if (itemData.type === 'image') {
                mediaElement = document.createElement('img');
                mediaElement.src = mediaPath;
                mediaElement.alt = itemData.altText;
                mediaElement.onerror = function() {
                    this.onerror = null;
                    this.src = `https://placehold.co/${itemWrapper.offsetWidth || 200}x${itemWrapper.offsetHeight || 200}/FFFFFF/1F2937?text=${encodeURIComponent(itemData.fileName)}`;
                };
            } else if (itemData.type === 'video') {
                mediaElement = document.createElement('video');
                mediaElement.src = mediaPath;
                mediaElement.alt = itemData.altText;
                mediaElement.muted = true;
                mediaElement.preload = CONFIG.VIDEO.PRELOAD;
                mediaElement.setAttribute('playsinline', '');

                mediaElement.addEventListener('loadedmetadata', function() {
                    this.currentTime = CONFIG.VIDEO.START_TIME;
                }, { once: true });

                mediaElement.addEventListener('mouseover', () => { mediaElement.loop = true; mediaElement.play().catch(e => {}); });
                mediaElement.addEventListener('mouseout', () => { mediaElement.loop = false; mediaElement.pause(); });
                mediaElement.onerror = function() {
                    this.outerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-xs p-2">Video not found: ${itemData.fileName}</div>`;
                };
            }
            if (mediaElement) {
                link.appendChild(mediaElement);
                itemWrapper.appendChild(link);
                container.appendChild(itemWrapper);
            }
        });
    }

    // Create all galleries first (using data from galleryData.js)
    populateGallery('lyric-grid-items-container', galleryData.lyricMotion.pathPrefix, galleryData.lyricMotion.items);
    populateGallery('3dcg-grid-items-container', galleryData.cgItems.pathPrefix, galleryData.cgItems.items);
    populateGallery('graphics-grid-items-container', galleryData.motionGraphics.pathPrefix, galleryData.motionGraphics.items);
    populateGallery('logo-grid-items-container', galleryData.logoDesign.pathPrefix, galleryData.logoDesign.items);
    populateGallery('independent-grid-items-container', galleryData.independentProduction.pathPrefix, galleryData.independentProduction.items);

    // Loading screen control
    const loadingOverlay = document.getElementById('loading-overlay');
    const progressBar = document.getElementById('loading-progress-bar');
    const percentageText = document.getElementById('loading-percentage');
    const mainContent = document.getElementById('main-content');

    document.body.style.overflow = 'hidden';

    // Wait for DOM update before getting assets
    setTimeout(() => {
        const assets = Array.from(document.querySelectorAll('img, video')).filter(el => {
            const src = el.src || el.currentSrc;
            return src && !src.includes('placehold.co');
        });

        startLoadingProcess(assets);
    }, CONFIG.LOADING.DOM_UPDATE_DELAY);

    function startLoadingProcess(assets) {
        let loadedCount = 0;
        const totalAssets = assets.length;

        if (totalAssets === 0) {
            hideLoadingScreenAndInit();
            return;
        }

        function assetLoaded() {
            loadedCount++;
            const percentage = Math.min(100, totalAssets > 0 ? Math.round((loadedCount / totalAssets) * 100) : 100);
            progressBar.style.width = percentage + '%';
            percentageText.textContent = percentage + '%';

            if (loadedCount >= totalAssets) {
                setTimeout(hideLoadingScreenAndInit, CONFIG.LOADING.FADE_OUT_DELAY);
            }
        }

        assets.forEach(asset => {
            let hasLoaded = false;
            const onAssetComplete = () => {
                if (hasLoaded) return;
                hasLoaded = true;
                assetLoaded();
            };

            if (asset.tagName.toLowerCase() === 'img') {
                if (asset.complete) {
                    onAssetComplete();
                } else {
                    asset.addEventListener('load', onAssetComplete, { once: true });
                    asset.addEventListener('error', onAssetComplete, { once: true });
                }
            } else if (asset.tagName.toLowerCase() === 'video') {
                if (asset.readyState >= 3) {
                    onAssetComplete();
                } else {
                    asset.addEventListener('canplaythrough', onAssetComplete, { once: true });
                    asset.addEventListener('error', onAssetComplete, { once: true });
                }
            }
        });
    }

    function hideLoadingScreenAndInit() {
        loadingOverlay.style.opacity = '0';
        loadingOverlay.addEventListener('transitionend', () => {
            loadingOverlay.style.display = 'none';
        });

        mainContent.style.visibility = 'visible';
        document.body.style.overflow = 'auto';

        initializeApp();
    }

    // Main initialization
    function initializeApp() {
        initMobileMenu();
        initContactForm();
        initGalleryInteractions();
        initTabNavigation();
        initDataVisualization();
    }

    // モバイルメニューの初期化
    function initMobileMenu() {
        const hamburgerButton = document.getElementById('hamburger-button');
        const mobileMenu = document.getElementById('mobile-menu-nav');
        const mobileMenuLinks = mobileMenu?.querySelectorAll(`.${CSS_CLASSES.MOBILE_MENU_LINK}`);

        if (hamburgerButton && mobileMenu) {
            hamburgerButton.addEventListener('click', function() {
                mobileMenu.classList.toggle(CSS_CLASSES.ACTIVE);
            });
            mobileMenuLinks?.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove(CSS_CLASSES.ACTIVE);
                });
            });
        }
    }

    // コンタクトフォームの初期化
    function initContactForm() {
        const confirmationModal = document.getElementById('confirmation-modal');
        const submitConfirmButton = document.getElementById('submit-confirm-button');
        const cancelButton = document.getElementById('cancel-button');
        const contactForm = document.getElementById('contact-form');

        if (!contactForm || !confirmationModal) return;

        const nameInput = document.getElementById('name');
        const detailsInput = document.getElementById('consultation-details');
        const budgetInput = document.getElementById('budget');
        const cgUsageInputs = document.querySelectorAll('input[name="CGの使用度合い"]');
        const deliveryDateInput = document.getElementById('delivery-date');
        const songLengthInput = document.getElementById('song-length');
        const referenceInputs = document.querySelectorAll('input[name="リファレンス有無"]');
        const referenceDetails = document.getElementById('reference-details');
        const referenceInput = document.getElementById('reference');
        const emailInput = document.getElementById('email');
        const accountInput = document.getElementById('account');
        const otherNotesInput = document.getElementById('other-notes');
        const subjectInput = document.getElementById('email-subject');

        const confirmName = document.getElementById('confirm-name');
        const confirmDetails = document.getElementById('confirm-consultation-details');
        const confirmBudget = document.getElementById('confirm-budget');
        const confirmCgUsage = document.getElementById('confirm-cg-usage');
        const confirmDeliveryDate = document.getElementById('confirm-delivery-date');
        const confirmSongLength = document.getElementById('confirm-song-length');
        const confirmReference = document.getElementById('confirm-reference');
        const confirmEmail = document.getElementById('confirm-email');
        const confirmAccount = document.getElementById('confirm-account');
        const confirmOtherNotes = document.getElementById('confirm-other-notes');

        // メールアドレスコピー機能
        const copyEmailBtn = document.getElementById('copy-email-btn');
        const copyFeedback = document.getElementById('copy-feedback');
        if (copyEmailBtn && copyFeedback) {
            copyEmailBtn.addEventListener('click', async function() {
                const emailText = 'utugi0313@gmail.com';
                try {
                    await navigator.clipboard.writeText(emailText);
                    copyFeedback.classList.add('show');
                    setTimeout(() => {
                        copyFeedback.classList.remove('show');
                    }, 2000);
                } catch (err) {
                    console.error('コピーに失敗しました:', err);
                }
            });
        }

        // ラジオボタンを2回クリックで選択解除できるようにする
        function makeRadioDeselectable(radioInputs) {
            let lastChecked = null;
            radioInputs.forEach(radio => {
                radio.addEventListener('click', function() {
                    if (this === lastChecked) {
                        this.checked = false;
                        lastChecked = null;
                        // changeイベントを手動で発火
                        this.dispatchEvent(new Event('change', { bubbles: true }));
                    } else {
                        lastChecked = this;
                    }
                });
            });
        }

        // CGの使用度合いとリファレンス有無のラジオボタンに適用
        makeRadioDeselectable(cgUsageInputs);
        makeRadioDeselectable(referenceInputs);

        // リファレンス選択の表示切り替え（ラジオボタン対応）
        if (referenceInputs.length > 0 && referenceDetails) {
            referenceInputs.forEach(input => {
                input.addEventListener('change', function() {
                    if (this.checked && this.value === 'あり') {
                        referenceDetails.style.display = 'block';
                        referenceInput.required = true;
                    } else {
                        referenceDetails.style.display = 'none';
                        referenceInput.required = false;
                        referenceInput.value = '';
                    }
                });
            });
        }

        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // ラジオボタンのバリデーションチェック
            const cgUsageChecked = Array.from(cgUsageInputs).some(input => input.checked);
            const referenceChecked = Array.from(referenceInputs).some(input => input.checked);
            
            if (!cgUsageChecked) {
                cgUsageInputs[0].setCustomValidity('いずれかのオプションを選択してください');
            } else {
                cgUsageInputs.forEach(input => input.setCustomValidity(''));
            }
            
            if (!referenceChecked) {
                referenceInputs[0].setCustomValidity('いずれかのオプションを選択してください');
            } else {
                referenceInputs.forEach(input => input.setCustomValidity(''));
            }
            
            if (!contactForm.checkValidity()) {
                // 最初の無効な要素を見つける
                const firstInvalidElement = contactForm.querySelector(':invalid');
                if (firstInvalidElement) {
                    const headerHeight = 96 + 40;
                    
                    // ラジオボタンの場合は親のコンテナ（mb-4やmb-6）を取得
                    let targetElement = firstInvalidElement;
                    if (firstInvalidElement.type === 'radio') {
                        targetElement = firstInvalidElement.closest('.mb-4, .mb-6') || firstInvalidElement;
                    }
                    
                    const elementRect = targetElement.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    
                    // 要素がヘッダーの下に隠れているか、画面外にあるかを確認
                    const isHiddenOrOutside = elementRect.top < headerHeight || elementRect.bottom > viewportHeight;
                    
                    if (isHiddenOrOutside) {
                        // スクロールが必要な場合
                        const absoluteElementTop = elementRect.top + window.scrollY;
                        const offsetPosition = absoluteElementTop - headerHeight;
                        
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                        
                        // スクロール後にバリデーションメッセージを表示
                        setTimeout(() => {
                            firstInvalidElement.reportValidity();
                        }, 200);
                    } else {
                        // すでに画面内にある場合は即座に表示
                        firstInvalidElement.reportValidity();
                    }
                }
                return;
            }
            subjectInput.value = `【${nameInput.value || '名前未入力'}, ${budgetInput.value || '予算未入力'}】ホームページから依頼が入りました。`;
            confirmName.textContent = nameInput.value || '未入力';
            confirmDetails.textContent = detailsInput.value || '未入力';
            confirmBudget.textContent = budgetInput.value || '未入力';
            
            // CGの使用度合い（ラジオボタン対応）
            const selectedCgUsage = Array.from(cgUsageInputs).find(input => input.checked);
            confirmCgUsage.textContent = selectedCgUsage ? selectedCgUsage.value : '未選択';
            
            confirmDeliveryDate.textContent = deliveryDateInput.value || '未入力';
            confirmSongLength.textContent = songLengthInput.value || '未入力';
            
            // リファレンスの表示を更新（ラジオボタン対応）
            const selectedReference = Array.from(referenceInputs).find(input => input.checked);
            if (selectedReference && selectedReference.value === 'あり') {
                confirmReference.textContent = referenceInput.value || '未入力';
            } else if (selectedReference) {
                confirmReference.textContent = selectedReference.value;
            } else {
                confirmReference.textContent = '未入力';
            }
            
            confirmEmail.textContent = emailInput.value || '未入力';
            confirmAccount.textContent = accountInput.value || '未入力';
            confirmOtherNotes.textContent = otherNotesInput.value || '未入力';
            confirmationModal.classList.remove(CSS_CLASSES.HIDDEN);
        });

        submitConfirmButton.addEventListener('click', function() {
            contactForm.submit();
        });

        cancelButton.addEventListener('click', function() {
            confirmationModal.classList.add(CSS_CLASSES.HIDDEN);
        });
    }

    // ギャラリー操作の初期化（イベント委譲使用）
    function initGalleryInteractions() {
        const titleDisplayElement = document.getElementById('gallery-item-title-display');
        if (!titleDisplayElement) return;

        // イベント委譲：各タブコンテナに対してリスナーを設定
        const galleryContainers = document.querySelectorAll('[id$="-content"]');
        galleryContainers.forEach(container => {
            container.addEventListener('mouseenter', (e) => {
                const galleryItem = e.target.closest(`.${CSS_CLASSES.GALLERY_ITEM}`);
                if (!galleryItem) return;

                const media = galleryItem.querySelector('img, video');
                if (media?.alt) {
                    titleDisplayElement.textContent = media.alt;
                    titleDisplayElement.style.opacity = '1';
                    titleDisplayElement.style.visibility = 'visible';
                }
            }, true);

            container.addEventListener('mouseleave', (e) => {
                const galleryItem = e.target.closest(`.${CSS_CLASSES.GALLERY_ITEM}`);
                if (!galleryItem) return;

                titleDisplayElement.style.opacity = '0';
                titleDisplayElement.style.visibility = 'hidden';
            }, true);
        });
    }

    // タブナビゲーションの初期化
    function initTabNavigation() {
        const tabButtons = Array.from(document.querySelectorAll('.gallery-tab-button'));
        const prevButton = document.getElementById('gallery-prev-button');
        const nextButton = document.getElementById('gallery-next-button');
        let currentTabIndex = tabButtons.findIndex(button => button.classList.contains(CSS_CLASSES.ACTIVE_TAB));
        currentTabIndex = currentTabIndex === -1 ? 0 : currentTabIndex;

        function updateTabs(newIndex) {
            if (newIndex < 0 || newIndex >= tabButtons.length) return;
            const oldTabId = tabButtons[currentTabIndex].dataset.tab;
            document.getElementById(oldTabId + '-content').classList.remove(CSS_CLASSES.ACTIVE);
            tabButtons[currentTabIndex].classList.remove(CSS_CLASSES.ACTIVE_TAB);
            currentTabIndex = newIndex;
            const newTabId = tabButtons[currentTabIndex].dataset.tab;
            document.getElementById(newTabId + '-content').classList.add(CSS_CLASSES.ACTIVE);
            tabButtons[currentTabIndex].classList.add(CSS_CLASSES.ACTIVE_TAB);
        }

        tabButtons.forEach((button, index) => button.addEventListener('click', () => updateTabs(index)));
        prevButton?.addEventListener('click', () => updateTabs((currentTabIndex - 1 + tabButtons.length) % tabButtons.length));
        nextButton?.addEventListener('click', () => updateTabs((currentTabIndex + 1) % tabButtons.length));
        if(tabButtons[currentTabIndex]) updateTabs(currentTabIndex);
    }

    // データ可視化の初期化
    function initDataVisualization() {
        const commonChartOptions = {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#374151' }},
                title: { display: true, font: { size: 16 }, color: '#1F2937' },
                tooltip: { callbacks: { label: context => '' } }
            },
            animation: { animateScale: true, animateRotate: true, duration: CONFIG.CHART.ANIMATION_DURATION }
        };

        const requestRatioChartConfig = {
            type: 'pie',
            data: {
                labels: [REQUEST_CATEGORIES.ORIGINAL_MV, REQUEST_CATEGORIES.COVER_MV, REQUEST_CATEGORIES.SHORT_MOVIE, REQUEST_CATEGORIES.OTHER],
                datasets: [{
                    label: '依頼内容の割合', data: [],
                    backgroundColor: CHART_COLORS.BACKGROUNDS,
                    borderColor: CHART_COLORS.BORDERS,
                    borderWidth: 1
                }]
            },
            options: { ...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { ...commonChartOptions.plugins.title, text: '依頼内容の割合' } } }
        };

        let requestRatioChartInstance = null;
        let allHistoryData = [];

        function renderHistory() {
            const historyListContainer = document.getElementById('history-list-container');
            if (!historyListContainer) return;
            historyListContainer.innerHTML = '';
            const itemsToRender = allHistoryData.slice(0, CONFIG.HISTORY.ITEMS_TO_DISPLAY);
            itemsToRender.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = CSS_CLASSES.HISTORY_ITEM;
                itemDiv.innerHTML = `<div class="flex-grow"><p class="title">${item.title}</p><p class="artist">${item.artist}</p></div><div class="text-right"><p class="date">${item.date}</p><p class="type">${item.type}</p></div>`;
                historyListContainer.appendChild(itemDiv);
            });
        }

        function parseCsvAndRenderCharts(csvText) {
            const lines = csvText.trim().split('\n');
            const dataRows = lines.slice(1);
            const parsedData = dataRows.map(line => {
                const values = line.split(',');
                return values.length >= 10 ? {
                    client: (values[0] || '').trim(), title: (values[1] || '').trim(),
                    releaseDate: (values[2] || '').trim(), requestContent: (values[3] || '').trim(),
                    cgUsageCol4: (values[4] || '').trim(), link: (values[5] || '').trim(),
                    cgUsageCol9: (values[9] || '').trim()
                } : null;
            }).filter(Boolean);

            const requestCounts = {
                [REQUEST_CATEGORIES.ORIGINAL_MV]: 0,
                [REQUEST_CATEGORIES.COVER_MV]: 0,
                [REQUEST_CATEGORIES.SHORT_MOVIE]: 0,
                [REQUEST_CATEGORIES.OTHER]: 0
            };
            parsedData.forEach(item => {
                if (requestCounts.hasOwnProperty(item.requestContent)) {
                    requestCounts[item.requestContent]++;
                } else { requestCounts[REQUEST_CATEGORIES.OTHER]++; }
            });

            const requestChartCanvas = document.getElementById('requestRatioChart');
            if (requestChartCanvas) {
                const observer = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting) {
                        if (requestRatioChartInstance) requestRatioChartInstance.destroy();
                        const requestData = [
                            requestCounts[REQUEST_CATEGORIES.ORIGINAL_MV],
                            requestCounts[REQUEST_CATEGORIES.COVER_MV],
                            requestCounts[REQUEST_CATEGORIES.SHORT_MOVIE],
                            requestCounts[REQUEST_CATEGORIES.OTHER]
                        ];
                        requestRatioChartConfig.data.datasets[0].data = requestData;
                        requestRatioChartInstance = new Chart(requestChartCanvas, requestRatioChartConfig);
                        observer.disconnect();
                    }
                }, { threshold: CONFIG.CHART.OBSERVER_THRESHOLD });
                observer.observe(requestChartCanvas);
            }

            allHistoryData = parsedData.map(item => ({
                artist: item.client, title: item.title, date: item.releaseDate, type: item.requestContent
            })).sort((a, b) => new Date(b.date) - new Date(a.date));
            renderHistory();
        }

        async function loadCsvData() {
            try {
                const response = await fetch('data/utugi_works.csv');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const csvText = await response.text();
                parseCsvAndRenderCharts(csvText);
            } catch (error) {
                console.error('CSVデータの読み込みまたはパース中にエラーが発生しました:', error);
                const dataSection = document.getElementById('data');
                if (dataSection) {
                    const errorMessage = document.createElement('p');
                    errorMessage.className = 'text-center text-red-500 mt-4';
                    errorMessage.textContent = 'データ表示に失敗しました。';
                    dataSection.querySelector('.container').appendChild(errorMessage);
                }
            }
        }

        loadCsvData();
    }
});
