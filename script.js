document.addEventListener('DOMContentLoaded', () => {
    const galleryInner = document.querySelector('.gallery-inner');
    const leftArrow = document.getElementById('leftArrow');
    const rightArrow = document.getElementById('rightArrow');
    // const wallArea = document.querySelector('.wall-area'); // wallAreaはY座標の統一により直接使わなくなりますが、参照として残します
    
    const wallBackground = document.querySelector('.wall-background');
    const moveVideo = document.getElementById('moveVideo');

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
    // 各アイテムのimg要素のonloadイベントを監視
    // ロードが完了したらサイズ設定を行い、全ての画像が完了したらupdateGalleryLayoutを呼ぶ
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

            // すべての画像がロードされたらレイアウトを更新
            if (loadedImagesCount === images.length) {
                updateGalleryLayout();
            }
        };

        // イベントリスナーを追加
        img.addEventListener('load', imageLoadHandler);
        img.addEventListener('error', () => {
            console.error(`画像のロードに失敗しました: ${img.src}`);
            // エラー時もカウントを進め、レイアウト更新をブロックしない
            loadedImagesCount++;
            if (loadedImagesCount === images.length) {
                updateGalleryLayout();
            }
        });

        // キャッシュされている画像の場合、onloadが発火しないことがあるため、
        // readyState が complete であれば手動で onload をトリガーする
        if (img.complete) {
            img.removeEventListener('load', imageLoadHandler); // 重複防止
            imageLoadHandler(); // 直接ハンドラを呼び出す
        }
    });

    let currentTranslateX = 0;

    // ギャラリーのレイアウトを更新する関数
    function updateGalleryLayout() {
        if (galleryItems.length === 0) {
            // 画像が1枚もない場合、矢印を無効化して終了
            leftArrow.classList.add('disabled');
            rightArrow.classList.add('disabled');
            return;
        }

        let totalGalleryContentWidth = 0;
        galleryItems.forEach(item => {
            // item.offsetWidth はすでに padding や border を含んだ値
            totalGalleryContentWidth += item.offsetWidth + (itemMargin * 2);
        });

        galleryInner.style.width = `${totalGalleryContentWidth}px`;

        const viewportWidth = window.innerWidth;
        // PaddingLeft / Right の設定をより確実にする
        const firstItemCenterOffset = galleryItems[0].offsetWidth / 2 + itemMargin;
        const lastItemCenterOffset = galleryItems[galleryItems.length - 1].offsetWidth / 2 + itemMargin;

        galleryInner.style.paddingLeft = `${viewportWidth / 2 - firstItemCenterOffset}px`;
        galleryInner.style.paddingRight = `${viewportWidth / 2 - lastItemCenterOffset}px`;
        
        // 初期位置を再計算し設定
        // paddingLeftが設定された後のgalleryInnerのoffsetLeft（親からの相対位置）
        // 最初のアイテムの中心がビューポート中央に来るようにtranslateXを調整
        // galleryInner.style.transform = `translateX(${viewportWidth / 2 - galleryItems[0].offsetLeft - galleryItems[0].offsetWidth / 2}px)`;
        // currentTranslateX = parseFloat(galleryInner.style.transform.replace('translateX(', '').replace('px)', ''));

        // すでにpaddingLeftで調整済みなので、transformXは0
        galleryInner.style.transform = `translateX(0px)`;
        currentTranslateX = 0; // 初期位置は0

        // レイアウト更新後に矢印の状態を更新
        updateArrowStates();
    }

    // --- 移動動画の再生とギャラリー移動のロジック ---
    function playMoveAnimation(direction) {
        // 矢印ボタンがdisabledであれば、動画再生をブロック
        if (leftArrow.classList.contains('disabled') && rightArrow.classList.contains('disabled')) {
             return;
        }

        // 動画が既に再生中であれば何もしない
        if (!moveVideo.paused && moveVideo.style.opacity === '1') {
            return;
        }

        // ギャラリーの端であれば移動しない（矢印のdisabled状態と同期）
        if ((direction === 'prev' && currentIndex === 0) || (direction === 'next' && currentIndex === galleryItems.length - 1)) {
            // この条件で return しても、矢印がdisabledなら最初のチェックで弾かれるはず
            return;
        }

        leftArrow.classList.add('disabled');
        rightArrow.classList.add('disabled');

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
                // 自動再生がブロックされた場合は動画なしで移動し、静止画に戻す
                wallBackground.style.opacity = 1;
                moveVideo.style.opacity = 0; // 動画は非表示のまま
                moveToItem(direction);
                updateArrowStates(); // 矢印の状態を更新
            });
        } else { // Promiseを返さない古いブラウザの場合
            moveToItem(direction);
        }

        // 動画のonendedイベントハンドラ
        moveVideo.onended = () => {
            wallBackground.style.opacity = 1;
            moveVideo.style.opacity = 0;
            moveVideo.pause();
            updateArrowStates();
        };

        // フォールバック用のsetTimeout (動画がonendedを発火しない、または再生が途中で止まる場合)
        setTimeout(() => {
            // もし動画がまだ表示されている（=onendedが発火していない）なら強制終了
            if (moveVideo.style.opacity === '1' && !moveVideo.paused) {
                moveVideo.pause();
                moveVideo.style.opacity = 0;
                wallBackground.style.opacity = 1;
                updateArrowStates();
            }
        }, moveDuration + 200); // 移動アニメーション時間より少し長めに設定
    }

    // ギャラリーを移動させる関数
    function moveToItem(direction) {
        // 現在のtransformX値を取得
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

        // 移動すべき目標のX位置 (ビューポートの中心にアイテムの中心を合わせる)
        const targetItem = galleryItems[targetIndex];
        // targetItem.offsetLeft は galleryInner からの相対位置
        const targetItemOffsetFromGalleryInnerStart = targetItem.offsetLeft;
        const targetItemWidth = targetItem.offsetWidth;
        const viewportCenter = window.innerWidth / 2;
        const galleryInnerPaddingLeft = parseFloat(getComputedStyle(galleryInner).paddingLeft);

        // 目標のtranslateX値
        // ビューポート中央 - (アイテムのgalleryInnerからの開始位置 + アイテムの幅の半分 + galleryInnerのpaddingLeft)
        let newTranslateX = viewportCenter - (targetItemOffsetFromGalleryInnerStart + (targetItemWidth / 2) + galleryInnerPaddingLeft);

        // **移動距離の倍率適用ロジック**
        // 各アイテムの移動距離を固定したい場合は、この部分を調整
        // 例: 1アイテム分の距離を計算し、それに倍率をかける
        let calculatedMoveDistance;
        if (currentIndex !== targetIndex) { // 実際にインデックスが変化する場合のみ
            const currentItem = galleryItems[currentIndex];
            const currentItemCenterOffset = currentItem.offsetLeft + currentItem.offsetWidth / 2;
            const targetItemCenterOffset = targetItem.offsetLeft + targetItem.offsetWidth / 2;

            calculatedMoveDistance = Math.abs(currentItemCenterOffset - targetItemCenterOffset);
            
            // 倍率を適用した移動量
            if (direction === 'next') {
                newTranslateX = currentTranslateX - (calculatedMoveDistance * moveDistanceMultiplier);
            } else { // prev
                newTranslateX = currentTranslateX + (calculatedMoveDistance * moveDistanceMultiplier);
            }

            currentIndex = targetIndex; // ここでcurrentIndexを更新
        } else {
            // インデックスが変わらない場合（端にいる場合）は、現在のnewTranslateXをそのまま使用
            // currentIndexも変更しない
        }

        // 限界値を計算
        const maxTranslateX = (viewportCenter) - (galleryItems[0].offsetWidth / 2) - galleryInnerPaddingLeft;
        const minTranslateX = (viewportCenter) - (galleryInner.scrollWidth - galleryInnerPaddingLeft - (galleryItems[galleryItems.length - 1].offsetWidth / 2));

        // 限界値を超えないように補正（誤差を考慮）
        if (newTranslateX > maxTranslateX + 0.1) {
            newTranslateX = maxTranslateX;
            currentIndex = 0; // 最初のアイテムに強制
        } else if (newTranslateX < minTranslateX - 0.1) {
            newTranslateX = minTranslateX;
            currentIndex = galleryItems.length - 1; // 最後のアイテムに強制
        }
        
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
            const galleryInnerScrollWidth = galleryInner.scrollWidth; // content + padding-left + padding-right

            // 限界位置の再計算
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
            // img.complete のチェックを追加し、画像が読み込まれていることを確認
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
        updateGalleryLayout(); // ギャラリー全体の配置を更新
    });

    // 初期化時の処理: 画像が全てロードされた後にupdateGalleryLayoutが呼ばれるため、
    // それまでは矢印は無効化しておく（または、display:noneにしておく）
    // galleryItemsが空の場合に備えて、ロード完了を待つ前に無効化
    if (galleryItems.length === 0) {
        leftArrow.classList.add('disabled');
        rightArrow.classList.add('disabled');
    }
});