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
    const TARGET_AREA = 150000; // 例: 387px x 387px 程度の面積

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

            if (loadedImagesCount === images.length) {
                // すべての画像がロードされた後に、ギャラリーの初期位置を設定
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
        // キャッシュされている画像の場合
        if (img.complete) {
            img.onload();
        }
    });

    let currentTranslateX = 0; // galleryInnerの現在のtranslateX値

    // ギャラリーのレイアウトを更新する関数 (横一列)
    function updateGalleryLayout() {
        let totalGalleryContentWidth = 0; // アイテムとアイテム間のマージンを含む合計幅
        galleryItems.forEach(item => {
            totalGalleryContentWidth += item.offsetWidth + (itemMargin * 2); // アイテム幅 + 左右マージン
        });

        // ギャラリーの全体の幅を設定
        galleryInner.style.width = `${totalGalleryContentWidth}px`;

        // ギャラリーの最初と最後に画面半分の余白を追加 (スクロールの見た目を改善)
        const viewportWidth = window.innerWidth;
        galleryInner.style.paddingLeft = `${viewportWidth / 2 - (galleryItems[0].offsetWidth / 2) - itemMargin}px`;
        galleryInner.style.paddingRight = `${viewportWidth / 2 - (galleryItems[galleryItems.length - 1].offsetWidth / 2) - itemMargin}px`;

        // 最初の画像を中央に配置する初期位置は、paddingLeftで調整されるため、
        // transformXは0に戻しておく
        galleryInner.style.transform = `translateX(0px)`;
        currentTranslateX = 0;

        updateArrowStates();
    }

    // --- 新しい移動動画の再生ロジック ---
    function playMoveAnimation(direction) {
        // 矢印ボタンを無効化（動画再生中はクリックさせない）
        leftArrow.classList.add('disabled');
        rightArrow.classList.add('disabled');

        // 静止画を隠し、動画を表示
        wallBackground.style.opacity = 0;
        moveVideo.style.opacity = 1;
        moveVideo.currentTime = 0; // 動画を最初から再生
        moveVideo.play();

        // ギャラリーの実際の移動 (動画の再生と同時に行う)
        // ここでの移動は即座に行われるように、transitionを一時的に無効化する方が、
        // 動画の動きと同期しやすくなる可能性があります。
        // ただし、今回はCSSのtransitionを維持し、動画と動きを合わせる努力をします。
        moveToItem(direction); 

        // 動画の再生終了を待って、静止画に戻す
        moveVideo.onended = () => {
            wallBackground.style.opacity = 1;
            moveVideo.style.opacity = 0;
            moveVideo.pause(); // 再生を停止してリソースを解放

            // 動画再生後、矢印ボタンを再度有効化
            updateArrowStates(); // 既存の関数を呼び出して状態をリフレッシュ
        };
        // 動画がループしない場合は、onendedイベントが必ず発火します。
    }

    let currentTranslateX = 0; // galleryInnerの現在のtranslateX値

    // ギャラリーを移動させる関数
    function moveToItem(direction) {
        const transformValue = window.getComputedStyle(galleryInner).transform;
        if (transformValue !== 'none') {
            const matrix = new DOMMatrixReadOnly(transformValue);
            currentTranslateX = matrix.m41;
        }

        let targetIndex = currentIndex;

        if (direction === 'next') {
            targetIndex = Math.min(currentIndex + 1, galleryItems.length - 1);
        } else { // direction === 'prev'
            targetIndex = Math.max(currentIndex - 1, 0);
        }

        const targetItem = galleryItems[targetIndex];
        const targetItemOffsetFromGalleryInnerStart = targetItem.offsetLeft;
        const targetItemWidth = targetItem.offsetWidth;
        const viewportCenter = window.innerWidth / 2;

        let moveDistance = viewportCenter - (targetItemOffsetFromGalleryInnerStart + (targetItemWidth / 2) + parseFloat(getComputedStyle(galleryInner).paddingLeft));

        const maxTranslateX = (window.innerWidth / 2) - (galleryItems[0].offsetWidth / 2) - parseFloat(getComputedStyle(galleryInner).paddingLeft);
        const minTranslateX = (window.innerWidth / 2) - (galleryInner.scrollWidth - parseFloat(getComputedStyle(galleryInner).paddingRight) - (galleryItems[galleryItems.length - 1].offsetWidth / 2));

        if (moveDistance > maxTranslateX + 0.1) {
            moveDistance = maxTranslateX;
        } else if (moveDistance < minTranslateX - 0.1) {
            moveDistance = minTranslateX;
        }
        
        currentIndex = targetIndex;
        galleryInner.style.transform = `translateX(${moveDistance}px)`;
        currentTranslateX = moveDistance;

        // 動画再生中はupdateArrowStatesを呼ばず、onendedで呼ぶように変更
        // updateArrowStates(); 
    }

    // 矢印の有効/無効状態を更新する関数
    function updateArrowStates() {
        // 動画再生中でなければ有効/無効を更新
        if (moveVideo.style.opacity === '0' || moveVideo.paused) { // opacityが0または停止中であれば
            if (!galleryInner.scrollWidth || galleryItems.length === 0) {
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
        if (!leftArrow.classList.contains('disabled')) { // 無効化されていなければ
            playMoveAnimation('prev');
        }
    });

    rightArrow.addEventListener('click', () => {
        if (!rightArrow.classList.contains('disabled')) { // 無効化されていなければ
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

    // 初期状態での矢印の状態を更新 (動画再生中は無効化されないようonload時は有効)
    // この行は、画像がすべてロードされてupdateGalleryLayoutが呼ばれた後に実行される必要があります
    // そのため、updateGalleryLayoutの最後でupdateArrowStatesを呼び出しています。
});