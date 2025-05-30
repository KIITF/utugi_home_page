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
    // すべての画像を一度にロードし、それぞれのonloadイベントでカウントアップ。
    // 全てロードされたらレイアウト更新関数を呼ぶ。
    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        // 画像のonloadハンドラを設定
        img.onload = () => {
            loadedImagesCount++;

            // 額縁の厚み (CSSのpaddingとborderの合計)
            const framePadding = 10 * 2; // top/bottom and left/right padding
            const frameBorder = 2 * 2;   // top/bottom and left/right border
            const totalFrameThickness = framePadding + frameBorder;

            // 画像の自然なサイズと縦横比
            const naturalWidth = img.naturalWidth;
            const naturalHeight = img.naturalHeight;
            const aspectRatio = naturalWidth / naturalHeight; // 幅/高さ
            
            // 面積を固定して幅と高さを計算
            let displayWidth = Math.sqrt(TARGET_AREA * aspectRatio);
            let displayHeight = TARGET_AREA / displayWidth;
            
            // アイテム（額縁）の最終的なサイズを設定
            item.style.width = `${displayWidth + totalFrameThickness}px`;
            item.style.height = `${displayHeight + totalFrameThickness}px`;

            // すべての画像がロードされたらレイアウトを更新
            if (loadedImagesCount === images.length) {
                updateGalleryLayout();
            }
        };
        // 画像のロードエラーハンドラを設定
        img.onerror = () => {
            console.error(`画像のロードに失敗しました: ${img.src}`);
            loadedImagesCount++; // エラーでもカウントを進める
            if (loadedImagesCount === images.length) {
                updateGalleryLayout();
            }
        };
        // キャッシュされている画像の場合、onloadが発火しないことがあるので、
        // readyState が complete であれば手動で onload をトリガーする
        if (img.complete) {
            img.onload();
        }
    });

    let currentTranslateX = 0; // galleryInnerの現在のtranslateX値

    // ギャラリーのレイアウトを更新する関数 (横一列)
    function updateGalleryLayout() {
        if (galleryItems.length === 0) return; // 画像がない場合は処理しない

        let totalGalleryContentWidth = 0; // アイテムとアイテム間のマージンを含む合計幅
        galleryItems.forEach(item => {
            totalGalleryContentWidth += item.offsetWidth + (itemMargin * 2); // アイテム幅 + 左右マージン
        });

        // galleryInnerの幅を設定
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

        // レイアウト更新後に矢印の状態を更新
        updateArrowStates();
    }

    // --- 移動動画の再生とギャラリー移動のロジック ---
    function playMoveAnimation(direction) {
        // 既に動画再生中か、ギャラリーの端にいる場合は何もしない
        if (!moveVideo.paused && moveVideo.style.opacity === '1') {
            return;
        }
        if ((direction === 'prev' && currentIndex === 0) || (direction === 'next' && currentIndex === galleryItems.length - 1)) {
            return; // ギャラリーの端なら移動しない
        }

        // 矢印ボタンを無効化（動画再生中はクリックさせない）
        leftArrow.classList.add('disabled');
        rightArrow.classList.add('disabled');

        // 静止画を隠し、動画を表示
        wallBackground.style.opacity = 0;
        moveVideo.style.opacity = 1;
        
        moveVideo.currentTime = 0; // 動画を最初から再生
        const playPromise = moveVideo.play();

        // play()メソッドがPromiseを返す場合があるため、エラーハンドリング
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // 再生が開始されたらギャラリーを移動
                moveToItem(direction);
            }).catch(error => {
                console.error("動画の自動再生に失敗しました:", error);
                // 自動再生がブロックされた場合は、動画なしで移動し、静止画に戻す
                wallBackground.style.opacity = 1;
                moveVideo.style.opacity = 0;
                moveToItem(direction); // 動画なしでギャラリーだけ移動
                updateArrowStates(); // 矢印の状態を更新
            });
        } else {
            // Promiseを返さないブラウザの場合（古いブラウザなど）
            moveToItem(direction);
        }

        // 動画の再生終了を待って、静止画に戻す
        moveVideo.onended = () => {
            wallBackground.style.opacity = 1;
            moveVideo.style.opacity = 0;
            moveVideo.pause(); // 再生を停止してリソースを解放

            // 動画再生後、矢印ボタンを再度有効化
            updateArrowStates();
        };
    }

    // ギャラリーを移動させる関数
    function moveToItem(direction) {
        // 現在のtransformY値を正確に取得
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
        const targetItemOffsetFromGalleryInnerStart = targetItem.offsetLeft; // galleryInnerからの相対位置
        const targetItemWidth = targetItem.offsetWidth;
        const viewportCenter = window.innerWidth / 2;

        // moveDistance: ビューポートの中央 - (アイテムのgalleryInnerからの開始位置 + アイテムの幅の半分 + galleryInnerのpaddingLeft)
        let moveDistance = viewportCenter - (targetItemOffsetFromGalleryInnerStart + (targetItemWidth / 2) + parseFloat(getComputedStyle(galleryInner).paddingLeft));

        // 限界値を計算
        const maxTranslateX = (window.innerWidth / 2) - (galleryItems[0].offsetWidth / 2) - parseFloat(getComputedStyle(galleryInner).paddingLeft); // 最初のアイテムが中央に来る位置
        const minTranslateX = (window.innerWidth / 2) - (galleryInner.scrollWidth - parseFloat(getComputedStyle(galleryInner).paddingRight) - (galleryItems[galleryItems.length - 1].offsetWidth / 2)); // 最後のアイテムが中央に来る位置

        // 限界値を超えないように補正（誤差を考慮）
        if (moveDistance > maxTranslateX + 0.1) {
            moveDistance = maxTranslateX;
        } else if (moveDistance < minTranslateX - 0.1) {
            moveDistance = minTranslateX;
        }
        
        currentIndex = targetIndex;
        galleryInner.style.transform = `translateX(${moveDistance}px)`;
        currentTranslateX = moveDistance;

        // 動画再生中はupdateArrowStatesを呼ばず、onendedで呼ぶように変更
        // (ここでは呼ばない)
    }

    // 矢印の有効/無効状態を更新する関数
    function updateArrowStates() {
        // 動画再生中でなければ有効/無効を更新
        // `moveVideo.paused` も確認することで、動画が完全に停止していることを保証
        if (moveVideo.paused && moveVideo.style.opacity === '0') { 
            if (galleryItems.length === 0) { // 画像がまだ読み込まれていない、または空の場合
                leftArrow.classList.add('disabled');
                rightArrow.classList.add('disabled');
                return;
            }

            const epsilon = 1; // 許容誤差

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
        // disabledクラスが付与されていなければ動画再生をトリガー
        if (!leftArrow.classList.contains('disabled')) {
            playMoveAnimation('prev');
        }
    });

    rightArrow.addEventListener('click', () => {
        // disabledクラスが付与されていなければ動画再生をトリガー
        if (!rightArrow.classList.contains('disabled')) {
            playMoveAnimation('next');
        }
    });

    // リサイズ時にギャラリーの配置を再調整
    window.addEventListener('resize', () => {
        // 画像のサイズ計算を再実行
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
        updateGalleryLayout(); // ギャラリー全体の配置を更新
    });

    // 初期化時にも矢印の状態を更新 (画像ロード完了後にupdateGalleryLayoutが呼ばれるため、ここでは不要)
    // ただし、画像が全くない場合は、最初にupdateArrowStatesを呼んでおくべき
    if (images.length === 0) {
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

        if (playPromise !== undefined) {
            playPromise.then(() => {
                // 動画再生開始後、すぐにギャラリーを移動させる
                galleryInner.style.transitionDuration = `${moveDuration}ms`; // transition時間をJSから設定
                moveToItem(direction);

                // moveDuration後にtransitionDurationを元に戻す (必要であれば)
                setTimeout(() => {
                    galleryInner.style.transitionDuration = '0.5s'; // 元に戻す
                }, moveDuration);

            }).catch(error => {
                console.error("動画の自動再生に失敗しました:", error);
                wallBackground.style.opacity = 1;
                moveVideo.style.opacity = 0;
                galleryInner.style.transitionDuration = `${moveDuration}ms`;
                moveToItem(direction);
                setTimeout(() => {
                    galleryInner.style.transitionDuration = '0.5s';
                }, moveDuration);
                updateArrowStates();
            });
        } else {
            galleryInner.style.transitionDuration = `${moveDuration}ms`;
            moveToItem(direction);
            setTimeout(() => {
                galleryInner.style.transitionDuration = '0.5s';
            }, moveDuration);
        }

        // 動画の再生終了を待って、静止画に戻し、ボタンを有効化
        moveVideo.onended = () => {
            wallBackground.style.opacity = 1;
            moveVideo.style.opacity = 0;
            moveVideo.pause();
            updateArrowStates();
        };

        // 動画がループしない設定であることを前提に、
        // onendedが呼ばれない場合へのフォールバックとしてsetTimeoutを使用 (念のため)
        setTimeout(() => {
            if (moveVideo.style.opacity === '1') {
                moveVideo.pause();
                moveVideo.style.opacity = 0;
                wallBackground.style.opacity = 1;
                updateArrowStates();
            }
        }, Math.max(moveDuration, moveVideo.duration * 1000) + 100); // 少し長めに設定
    }
});