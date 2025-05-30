document.addEventListener('DOMContentLoaded', () => {
    const galleryInner = document.querySelector('.gallery-inner');
    const leftArrow = document.getElementById('leftArrow');
    const rightArrow = document.getElementById('rightArrow');
    
    const wallBackground = document.querySelector('.wall-background');
    const moveVideo = document.querySelector('.wall-video'); // idではなくclassで取得

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
    ];

    let currentIndex = 0;
    const itemMargin = 40;
    const moveDistanceMultiplier = 2.5; // 移動距離の倍率

    const TARGET_AREA = 150000; 

    // ギャラリーアイテムの生成
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

    // 画像がロードされてからサイズを調整し、レイアウトを更新
    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        const imageLoadHandler = () => {
            loadedImagesCount++;

            const framePadding = 10 * 2;
            const frameBorder = 2 * 2;
            const totalFrameThickness = framePadding + frameBorder;

            const naturalWidth = img.naturalWidth;
            const naturalHeight = img.naturalHeight;
            const aspectRatio = naturalWidth / naturalHeight;
            
            let displayWidth = Math.sqrt(TARGET_AREA * aspectRatio);
            let displayHeight = TARGET_AREA / displayWidth;
            
            item.style.width = `${displayWidth + totalFrameThickness}px`;
            item.style.height = `${displayHeight + totalFrameThickness}px`;

            if (loadedImagesCount === images.length) {
                updateGalleryLayout();
            }
        };

        img.addEventListener('load', imageLoadHandler);
        img.addEventListener('error', () => {
            console.error(`画像のロードに失敗しました: ${img.src}`);
            loadedImagesCount++;
            if (loadedImagesCount === images.length) {
                updateGalleryLayout();
            }
        });

        if (img.complete) {
            img.removeEventListener('load', imageLoadHandler);
            imageLoadHandler();
        }
    });

    let currentTranslateX = 0;

    // ギャラリーのレイアウトを更新する関数
    function updateGalleryLayout() {
        if (galleryItems.length === 0) {
            leftArrow.classList.add('disabled');
            rightArrow.classList.add('disabled');
            return;
        }

        let totalGalleryContentWidth = 0;
        galleryItems.forEach(item => {
            totalGalleryContentWidth += item.offsetWidth + (itemMargin * 2);
        });

        galleryInner.style.width = `${totalGalleryContentWidth}px`;

        const viewportWidth = window.innerWidth;
        const firstItemCenterOffset = galleryItems[0].offsetWidth / 2 + itemMargin;
        const lastItemCenterOffset = galleryItems[galleryItems.length - 1].offsetWidth / 2 + itemMargin;

        galleryInner.style.paddingLeft = `${viewportWidth / 2 - firstItemCenterOffset}px`;
        galleryInner.style.paddingRight = `${viewportWidth / 2 - lastItemCenterOffset}px`;
        
        galleryInner.style.transform = `translateX(0px)`;
        currentTranslateX = 0;

        updateArrowStates();
    }

    // --- 移動動画の再生とギャラリー移動のロジック ---
    function playMoveAnimation(direction) {
        if (leftArrow.classList.contains('disabled') && rightArrow.classList.contains('disabled')) {
             return;
        }
        if (!moveVideo.paused && moveVideo.style.opacity === '1') {
            return;
        }
        if ((direction === 'prev' && currentIndex === 0) || (direction === 'next' && currentIndex === galleryItems.length - 1)) {
            return;
        }

        leftArrow.classList.add('disabled');
        rightArrow.classList.add('disabled');

        // 動画ファイルのパスを方向に応じて設定
        const videoSrc = (direction === 'right' || direction === 'next') 
                         ? 'movies/wall_move_right.mp4' 
                         : 'movies/wall_move_left.mp4';
        
        // 新しいsource要素を作成し、videoタグに追加
        // 既存のsourceがあれば削除してから追加
        while (moveVideo.firstChild) {
            moveVideo.removeChild(moveVideo.firstChild);
        }
        const source = document.createElement('source');
        source.src = videoSrc;
        source.type = 'video/mp4'; // 必要に応じてwebmも追加
        moveVideo.appendChild(source);
        
        moveVideo.load(); // 新しいsourceをロード

        wallBackground.style.opacity = 0;
        moveVideo.style.opacity = 1;
        
        moveVideo.currentTime = 0;
        const playPromise = moveVideo.play();

        const moveDuration = 500;
        galleryInner.style.transitionDuration = `${moveDuration}ms`;

        if (playPromise !== undefined) {
            playPromise.then(() => {
                moveToItem(direction);
            }).catch(error => {
                console.warn("動画の自動再生がブロックされました。動画なしでギャラリーを移動します:", error);
                wallBackground.style.opacity = 1;
                moveVideo.style.opacity = 0;
                moveToItem(direction);
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

        setTimeout(() => {
            if (moveVideo.style.opacity === '1' && !moveVideo.paused) {
                moveVideo.pause();
                moveVideo.style.opacity = 0;
                wallBackground.style.opacity = 1;
                updateArrowStates();
            }
        }, moveDuration + 200);
    }

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
        } else {
            targetIndex = Math.max(currentIndex - 1, 0);
        }

        // ここでcurrentIndexを更新するのを一度やめる
        // 移動の計算は、あくまで目標となる位置を算出するため
        // currentIndexの更新は移動完了時、または移動先の限界値補正後に行うべき

        // 移動すべき目標のX位置 (ビューポートの中心にアイテムの中心を合わせる)
        const targetItem = galleryItems[targetIndex];
        const targetItemOffsetFromGalleryInnerStart = targetItem.offsetLeft;
        const targetItemWidth = targetItem.offsetWidth;
        const viewportCenter = window.innerWidth / 2;
        const galleryInnerPaddingLeft = parseFloat(getComputedStyle(galleryInner).paddingLeft);

        let newTranslateX;

        // **移動距離の倍率適用ロジック**
        // 常に次のアイテムの中心に移動しつつ、その距離に倍率をかける
        let distanceBetweenItems = 0;
        if (currentIndex !== targetIndex) { // 実際にインデックスが変化する場合
            const currentItem = galleryItems[currentIndex];
            distanceBetweenItems = Math.abs( (targetItem.offsetLeft + targetItem.offsetWidth / 2) - (currentItem.offsetLeft + currentItem.offsetWidth / 2) );
        } else { // 端にいる場合など、インデックスが変わらないが移動が必要な場合
            // この場合は、現在中央にあるアイテムの次のアイテム（または前のアイテム）までの距離
            if (direction === 'next' && currentIndex < galleryItems.length - 1) {
                 distanceBetweenItems = Math.abs( (galleryItems[currentIndex + 1].offsetLeft + galleryItems[currentIndex + 1].offsetWidth / 2) - (targetItem.offsetLeft + targetItem.offsetWidth / 2) );
            } else if (direction === 'prev' && currentIndex > 0) {
                 distanceBetweenItems = Math.abs( (galleryItems[currentIndex - 1].offsetLeft + galleryItems[currentIndex - 1].offsetWidth / 2) - (targetItem.offsetLeft + targetItem.offsetWidth / 2) );
            }
        }
        
        // 倍率を適用した移動量
        if (direction === 'next') {
            newTranslateX = currentTranslateX - (distanceBetweenItems * moveDistanceMultiplier);
        } else { // prev
            newTranslateX = currentTranslateX + (distanceBetweenItems * moveDistanceMultiplier);
        }


        // 限界値を計算
        const maxTranslateX = (viewportCenter) - (galleryItems[0].offsetWidth / 2) - galleryInnerPaddingLeft;
        const minTranslateX = (viewportCenter) - (galleryInner.scrollWidth - galleryInnerPaddingLeft - (galleryItems[galleryItems.length - 1].offsetWidth / 2));

        // 限界値を超えないように補正（誤差を考慮）
        // 限界値で停止し、currentIndexもそれに合わせる
        let finalIndex = targetIndex; // 最終的に止まるインデックス

        if (newTranslateX > maxTranslateX + 0.1) {
            newTranslateX = maxTranslateX;
            finalIndex = 0; // 最初のアイテムに強制
        } else if (newTranslateX < minTranslateX - 0.1) {
            newTranslateX = minTranslateX;
            finalIndex = galleryItems.length - 1; // 最後のアイテムに強制
        }
        
        // 最終的なcurrentIndexを更新
        currentIndex = finalIndex; 

        galleryInner.style.transform = `translateX(${newTranslateX}px)`;
        currentTranslateX = newTranslateX;
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

            const viewportWidth = window.innerWidth;
            const galleryInnerPaddingLeft = parseFloat(getComputedStyle(galleryInner).paddingLeft);
            const galleryInnerScrollWidth = galleryInner.scrollWidth;

            const maxTranslateX = (viewportWidth / 2) - (galleryItems[0].offsetWidth / 2) - galleryInnerPaddingLeft;
            const minTranslateX = (viewportWidth / 2) - (galleryInnerScrollWidth - (galleryItems[galleryItems.length - 1].offsetWidth / 2) - parseFloat(getComputedStyle(galleryInner).paddingRight));

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

    // イベントリスナーの追加
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

    // リサイズ時のギャラリーの配置を再調整
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

    // 初期化時の矢印無効化
    if (galleryItems.length === 0) {
        leftArrow.classList.add('disabled');
        rightArrow.classList.add('disabled');
    }
});