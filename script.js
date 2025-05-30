document.addEventListener('DOMContentLoaded', () => {
    const galleryInner = document.querySelector('.gallery-inner');
    const leftArrow = document.getElementById('leftArrow');
    const rightArrow = document.getElementById('rightArrow');
    const wallArea = document.querySelector('.wall-area'); 
    
    const wallBackground = document.querySelector('.wall-background'); // 静止画背景
    const moveVideo = document.getElementById('moveVideo'); // 動画要素

    // ポートフォリオ画像のリスト、リンク先、タイトル
    const images = [
        { src: 'images/cappuccino.png', link: 'https://www.youtube.com/', alt: 'Cappuccino', title: '贅沢と君とカプチーノ(cover)' },
        { src: 'images/EpisodeX.png', link: 'https://www.youtube.com/', alt: 'EpisodeX(cover)' },
        { src: 'images/c_plant_yuki.png', link: 'https://www.youtube.com/', alt: 'Plant Yuki', title: '食虫植物(cover)' },
        { src: 'images/cappuccino.png', link: 'https://www.youtube.com/', alt: 'Cappuccino 2', title: '贅沢と君とカプチーノ(cover)' },
        { src: 'images/EpisodeX.png', link: 'https://www.youtube.com/', alt: 'EpisodeX(cover)' },
        { src: 'images/c_plant_yuki.png', link: 'https://www.youtube.com/', alt: 'Plant Yuki 2', title: '食虫植物(cover)' },
        { src: 'images/cappuccino.png', link: 'https://www.youtube.com/', alt: 'Cappuccino 3', title: '贅沢と君とカプチーノ(cover)' },
        { src: 'images/EpisodeX.png', link: 'https://www.youtube.com/', alt: 'EpisodeX(cover)' },
        { src: 'images/c_plant_yuki.png', link: 'https://www.youtube.com/', alt: 'Plant Yuki 3', title: '食虫植物(cover)' },
        // 必要に応じてさらに画像を追加
    ];

    let currentIndex = 0; // 現在中央に表示されている画像のインデックス
    const itemMargin = 40; // CSSの.gallery-itemのmargin-left/rightと合わせる
    const moveDistanceMultiplier = 1.5; // 移動距離の倍率 (1.5倍)

    // **画像の目標面積 (正方形の辺の長さの2乗として考える)**
    const TARGET_AREA = 150000; 

    // 画像を動的にギャラリーに追加
    images.forEach(imageData => {
        const a = document.createElement('a');
        a.href = imageData.link;
        a.target = '_blank';
        a.classList.add('gallery-item');

        const img = document.createElement('img');
        img.src = imageData.src;
        img.alt = imageData.alt;

        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        const overlayText = document.createElement('div');
        overlayText.classList.add('overlay-text');
        overlayText.textContent = imageData.title;
        overlay.appendChild(overlayText);

        a.appendChild(img);
        a.appendChild(overlay);
        galleryInner.appendChild(a);
    });

    let loadedImagesCount = 0;
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));

    // 画像がロードされてからサイズを調整
    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        img.onload = () => {
            loadedImagesCount++;

            // 額縁の厚み (CSSのpaddingとborderの合計)
            const framePadding = 10 * 2;
            const frameBorder = 2 * 2;
            const totalFrameThickness = framePadding + frameBorder;

            // 画像の自然なサイズと縦横比
            const naturalWidth = img.naturalWidth;
            const naturalHeight = img.naturalHeight;
            const aspectRatio = naturalWidth / naturalHeight;
            
            // 面積を固定して幅と高さを計算
            let displayWidth = Math.sqrt(TARGET_AREA * aspectRatio);
            let displayHeight = TARGET_AREA / displayWidth;
            
            // アイテム（額縁）の最終的なサイズを設定
            item.style.width = `${displayWidth + totalFrameThickness}px`;
            item.style.height = `${displayHeight + totalFrameThickness}px`;

            if (loadedImagesCount === images.length) {
                updateGalleryLayout();
            }
        };
        img.onerror = () => {
            console.error(`画像のロードに失敗しました: ${img.src}`);
            loadedImagesCount++;
            if (loadedImagesCount === images.length) {
                updateGalleryLayout();
            }
        };
        if (img.complete) {
            img.onload();
        }
    });

    let currentTranslateX = 0; // galleryInnerの現在のtranslateX値

    // ギャラリーのレイアウトを更新する関数 (横一列)
    function updateGalleryLayout() {
        if (galleryItems.length === 0) return;

        let totalGalleryContentWidth = 0;
        // galleryInnerのflexboxがアイテムを配置するため、ここでは各アイテムの左端からのオフセットを計算
        // そして、それを元にgalleryInnerの幅を計算する
        let currentItemLeft = 0;
        galleryItems.forEach((item, index) => {
            // item.style.left = `${currentItemLeft}px`; // Flexboxに任せるのでleftは設定しない
            currentItemLeft += item.offsetWidth + (itemMargin * 2); // 次のアイテムの開始位置
        });
        totalGalleryContentWidth = currentItemLeft; // これがgalleryInnerが内部で持つべき幅

        galleryInner.style.width = `${totalGalleryContentWidth}px`;

        // ギャラリーの最初と最後に画面半分の余白を追加 (スクロールの見た目を改善)
        const viewportWidth = window.innerWidth;
        // 最初のアイテムが画面中央に来るように、paddingLeftを調整
        galleryInner.style.paddingLeft = `${viewportWidth / 2 - (galleryItems[0].offsetWidth / 2) - itemMargin}px`;
        // 最後のアイテムが画面中央に来るように、paddingRightを調整
        galleryInner.style.paddingRight = `${viewportWidth / 2 - (galleryItems[galleryItems.length - 1].offsetWidth / 2) - itemMargin}px`;

        // 初期表示位置を0に戻す (paddingLeftで位置調整されるため)
        galleryInner.style.transform = `translateX(0px)`;
        currentTranslateX = 0;

        updateArrowStates();
    }

    // --- 移動動画の再生とギャラリー移動のロジック ---
    function playMoveAnimation(direction) {
        if (!moveVideo.paused && moveVideo.style.opacity === '1') {
            return;
        }
        if ((direction === 'prev' && currentIndex === 0) || (direction === 'next' && currentIndex === galleryItems.length - 1)) {
            return;
        }

        leftArrow.classList.add('disabled');
        rightArrow.classList.add('disabled');

        wallBackground.style.opacity = 0;
        moveVideo.style.opacity = 1;
        
        moveVideo.currentTime = 0;
        const playPromise = moveVideo.play();

        const moveDuration = 500; // ミリ秒単位、CSSのtransition時間と合わせる (0.5秒)
        galleryInner.style.transitionDuration = `${moveDuration}ms`; // 常にCSSと同じ時間を設定

        if (playPromise !== undefined) {
            playPromise.then(() => {
                moveToItem(direction);
            }).catch(error => {
                console.error("動画の自動再生に失敗しました:", error);
                // 自動再生がブロックされた場合は、動画なしで移動し、静止画に戻す
                wallBackground.style.opacity = 1;
                moveVideo.style.opacity = 0;
                moveToItem(direction); // 動画なしでギャラリーだけ移動
                updateArrowStates();
            });
        } else {
            moveToItem(direction);
        }

        moveVideo.onended = () => {
            wallBackground.style.opacity = 1;
            moveVideo.style.opacity = 0;
            moveVideo.pause();
            updateArrowStates();
        };
        // フォールバック用のsetTimeout (動画がonendedを発火しない場合)
        setTimeout(() => {
            if (moveVideo.style.opacity === '1' && !moveVideo.paused) { // まだ動画が再生中なら強制停止
                moveVideo.pause();
                moveVideo.style.opacity = 0;
                wallBackground.style.opacity = 1;
                updateArrowStates();
            }
        }, moveDuration + 200); // 移動時間より少し長く設定
    }

    // let currentTranslateX = 0; // galleryInnerの現在のtranslateX値

    // ギャラリーを移動させる関数
    function moveToItem(direction) {
        const transformValue = window.getComputedStyle(galleryInner).transform;
        if (transformValue && transformValue !== 'none') {
            const matrix = new DOMMatrixReadOnly(transformValue);
            currentTranslateX = matrix.m41;
        } else {
            currentTranslateX = 0;
        }

        let targetIndex = currentIndex;

        if (direction === 'next') {
            targetIndex = Math.min(currentIndex + 1, galleryItems.length - 1);
        } else { // direction === 'prev'
            targetIndex = Math.max(currentIndex - 1, 0);
        }

        // 目標のアイテムの中心がビューポート中央に来るように移動量を計算
        const targetItem = galleryItems[targetIndex];
        const targetItemOffsetFromGalleryInnerStart = targetItem.offsetLeft;
        const targetItemWidth = targetItem.offsetWidth;
        const viewportCenter = window.innerWidth / 2;

        // 次の移動距離を計算 (ここが移動距離の変更点)
        // 基本の移動距離は、現在アイテムの中心から次のアイテムの中心までの距離
        let distanceToMove;
        if (direction === 'next' && targetIndex < galleryItems.length -1) {
            distanceToMove = (galleryItems[targetIndex + 1].offsetLeft + galleryItems[targetIndex + 1].offsetWidth / 2) - (targetItemOffsetFromGalleryInnerStart + targetItemWidth / 2);
        } else if (direction === 'prev' && targetIndex > 0) {
            distanceToMove = (targetItemOffsetFromGalleryInnerStart + targetItemWidth / 2) - (galleryItems[targetIndex - 1].offsetLeft + galleryItems[targetIndex - 1].offsetWidth / 2);
        } else {
            // 端にいる場合や、計算できない場合は、現在のアイテムを中央に合わせる距離
            distanceToMove = (targetItemOffsetFromGalleryInnerStart + targetItemWidth / 2 + parseFloat(getComputedStyle(galleryInner).paddingLeft)) - viewportCenter;
            distanceToMove *= -1; // 符号を反転
        }

        // 移動距離に倍率を適用
        let newMoveDistance = currentTranslateX;
        if (direction === 'next') {
            newMoveDistance -= distanceToMove * moveDistanceMultiplier;
        } else {
            newMoveDistance += distanceToMove * moveDistanceMultiplier;
        }


        // 限界値を計算
        const maxTranslateX = (viewportWidth / 2) - (galleryItems[0].offsetWidth / 2) - parseFloat(getComputedStyle(galleryInner).paddingLeft);
        const minTranslateX = (viewportWidth / 2) - (galleryInner.scrollWidth - parseFloat(getComputedStyle(galleryInner).paddingRight) - (galleryItems[galleryItems.length - 1].offsetWidth / 2));

        // 限界値を超えないように補正（誤差を考慮）
        if (newMoveDistance > maxTranslateX + 0.1) {
            newMoveDistance = maxTranslateX;
            targetIndex = 0; // 最初のアイテムに強制
        } else if (newMoveDistance < minTranslateX - 0.1) {
            newMoveDistance = minTranslateX;
            targetIndex = galleryItems.length - 1; // 最後のアイテムに強制
        }
        
        currentIndex = targetIndex;
        galleryInner.style.transform = `translateX(${newMoveDistance}px)`;
        currentTranslateX = newMoveDistance;
    }

    // 矢印の有効/無効状態を更新する関数
    function updateArrowStates() {
        if (moveVideo.paused && moveVideo.style.opacity === '0') { 
            if (galleryItems.length === 0) {
                leftArrow.classList.add('disabled');
                rightArrow.classList.add('disabled');
                return;
            }

            const epsilon = 1; 

            const maxTranslateX = (window.innerWidth / 2) - (galleryItems[0].offsetWidth / 2) - parseFloat(getComputedStyle(galleryInner).paddingLeft);
            const minTranslateX = (window.innerWidth / 2) - (galleryInner.scrollWidth - parseFloat(getComputedStyle(galleryInner).paddingRight) - (galleryItems[galleryItems.length - 1].offsetWidth / 2));

            if (currentTranslateX >= maxTranslateX - epsilon) {
                leftArrow.classList.add('disabled');
            } else {
                leftArrow.classList.remove('disabled');
            }

            if (currentTranslateX <= minTranslateX + epsilon) {
                rightArrow.classList.add('disabled');
            } else {
                rightArrow.classList.remove('disabled');
            }
        }
    }


    // 矢印クリックイベント
    leftArrow.addEventListener('click', () => {
        if (!leftArrow.classList.contains('disabled')) {
            playMoveAnimation('prev');
        }
    });

    rightArrow.addEventListener('click', () => {
        if (!rightArrow.classList.contains('disabled')) {
            playMoveAnimation('next');
        }
    });

    // リサイズ時にギャラリーの配置を再調整
    window.addEventListener('resize', () => {
        galleryItems.forEach(item => {
            const img = item.querySelector('img');
            if (img.complete) {
                const naturalWidth = img.naturalWidth;
                const naturalHeight = img.naturalHeight;
                const aspectRatio = naturalWidth / naturalHeight;

                let displayWidth = Math.sqrt(TARGET_AREA * aspectRatio);
                let displayHeight = TARGET_AREA / displayWidth;
                
                const framePadding = 10 * 2;
                const frameBorder = 2 * 2;
                const totalFrameThickness = framePadding + frameBorder;

                item.style.width = `${displayWidth + totalFrameThickness}px`;
                item.style.height = `${displayHeight + totalFrameThickness}px`;
            }
        });
        updateGalleryLayout();
    });
});