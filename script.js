document.addEventListener('DOMContentLoaded', () => {
    const galleryInner = document.querySelector('.gallery-inner');
    const leftArrow = document.getElementById('leftArrow');
    const rightArrow = document.getElementById('rightArrow');
    const wallArea = document.querySelector('.wall-area');

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
    const itemSpacing = 60; // 各アイテム間の水平方向の最小間隔（額縁含む）

    // 画像の目標となる短辺のサイズ範囲 (額縁なしの画像本体のサイズ)
    const baseImgSizeMin = 180;
    const baseImgSizeMax = 280;

    // 壁の上下に確保したい余白のピクセル値
    const wallVerticalPadding = 60;

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

    // 画像がロードされてからサイズを調整し、位置を決定
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
            const aspectRatio = naturalWidth / naturalHeight;

            // ランダムな短辺のサイズを決定 (画像本体)
            const randomBaseSize = baseImgSizeMin + Math.random() * (baseImgSizeMax - baseImgSizeMin);

            let displayWidth, displayHeight;

            if (aspectRatio > 1) { // 横長画像
                displayWidth = randomBaseSize; // 横長の場合は幅を基準
                displayHeight = displayWidth / aspectRatio;
            } else { // 縦長または正方形画像
                displayHeight = randomBaseSize; // 縦長の場合は高さを基準
                displayWidth = displayHeight * aspectRatio;
            }
            
            // アイテム（額縁）の最終的なサイズを設定
            item.style.width = `${displayWidth + totalFrameThickness}px`;
            item.style.height = `${displayHeight + totalFrameThickness}px`;

            // 垂直方向のランダムな位置調整
            const wallAreaHeight = wallArea.clientHeight;
            const availableVerticalSpace = wallAreaHeight - (wallVerticalPadding * 2) - item.offsetHeight;
            const randomTop = Math.random() * availableVerticalSpace;
            item.style.top = `${wallVerticalPadding + randomTop}px`;
            item.style.position = 'absolute'; // topを有効にするため

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
        let currentXOffset = 0; // galleryInnerの左端からの各アイテムの相対X位置

        galleryItems.forEach((item, index) => {
            // 各アイテムのX位置を設定
            // ひとつ前のアイテムの右端から、itemSpacingの間隔を開けて配置
            item.style.left = `${currentXOffset}px`;
            
            // 次のアイテムの開始位置を更新
            currentXOffset += item.offsetWidth + itemSpacing;
        });

        // ギャラリーの全体の幅を設定
        galleryInner.style.width = `${currentXOffset}px`;

        // ギャラリーの最初と最後に画面半分の余白を追加 (スクロールの見た目を改善)
        const viewportWidth = window.innerWidth;
        galleryInner.style.paddingLeft = `${viewportWidth / 2 - (galleryItems[0].offsetWidth / 2)}px`; // 最初の画像が中央に来るように調整
        galleryInner.style.paddingRight = `${viewportWidth / 2}px`; // 右端にも画面半分ほどの余白

        // 最初の画像を画面中央に配置する初期位置
        // paddingLeftが適用されるので、transformXは0で良い
        // currentTranslateX = 0; // Flexboxのalign-itemsとpaddingで初期位置は中央に
        // ここではpaddingLeftを使って初期位置を調整したので、transformXは0で初期化

        updateArrowStates(); // 矢印の状態を更新
    }

    // ギャラリーを移動させる関数
    function moveToItem(direction) {
        const transformValue = window.getComputedStyle(galleryInner).transform;
        if (transformValue !== 'none') {
            const matrix = new DOMMatrixReadOnly(transformValue);
            currentTranslateX = matrix.m41;
        }

        let targetIndex = currentIndex; // ターゲットインデックスを現在値で初期化

        if (direction === 'next') {
            targetIndex = Math.min(currentIndex + 1, galleryItems.length - 1);
        } else { // direction === 'prev'
            targetIndex = Math.max(currentIndex - 1, 0);
        }

        // 目標のアイテムの中心がビューポート中央に来るように移動量を計算
        const targetItem = galleryItems[targetIndex];
        const targetItemLeft = parseFloat(targetItem.style.left); // galleryInnerからの相対位置
        const targetItemWidth = targetItem.offsetWidth;
        const viewportCenter = window.innerWidth / 2;

        // moveDistance: ビューポートの中央 - (アイテムのgalleryInnerからの開始位置 + アイテムの幅の半分 + galleryInnerのpaddingLeft)
        let moveDistance = viewportCenter - (targetItemLeft + (targetItemWidth / 2) + parseFloat(getComputedStyle(galleryInner).paddingLeft));

        // 限界値を計算
        const maxTranslateX = viewportCenter - (galleryItems[0].offsetWidth / 2) - parseFloat(getComputedStyle(galleryInner).paddingLeft);
        const minTranslateX = viewportCenter - (galleryInner.scrollWidth - parseFloat(getComputedStyle(galleryInner).paddingRight) - (galleryItems[galleryItems.length - 1].offsetWidth / 2));
        
        // 限界値を超えないように補正
        if (moveDistance > maxTranslateX + 0.1) { // わずかな誤差を許容
            moveDistance = maxTranslateX;
        } else if (moveDistance < minTranslateX - 0.1) { // わずかな誤差を許容
            moveDistance = minTranslateX;
        }
        
        currentIndex = targetIndex;
        galleryInner.style.transform = `translateX(${moveDistance}px)`;
        currentTranslateX = moveDistance;

        updateArrowStates();
    }

    // 矢印の有効/無効状態を更新する関数
    function updateArrowStates() {
        if (!galleryInner.scrollWidth || galleryItems.length === 0) return;

        const epsilon = 1; 

        // 限界位置の計算
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


    // 矢印クリックイベント
    leftArrow.addEventListener('click', () => {
        if (!leftArrow.classList.contains('disabled')) {
            moveToItem('prev');
        }
    });

    rightArrow.addEventListener('click', () => {
        if (!rightArrow.classList.contains('disabled')) {
            moveToItem('next');
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

                const randomBaseSize = baseImgSizeMin + Math.random() * (baseImgSizeMax - baseImgSizeMin);
                let displayHeight, displayWidth;
                if (aspectRatio > 1) {
                    displayWidth = randomBaseSize;
                    displayHeight = displayWidth / aspectRatio;
                } else {
                    displayHeight = randomBaseSize;
                    displayWidth = displayHeight * aspectRatio;
                }

                const framePadding = 10 * 2;
                const frameBorder = 2 * 2;
                const totalFrameThickness = framePadding + frameBorder;

                item.style.height = `${displayHeight + totalFrameThickness}px`;
                item.style.width = `${displayWidth + totalFrameThickness}px`;

                // 垂直方向の位置もリサイズ時に再計算し直す
                const wallAreaHeight = wallArea.clientHeight;
                const availableVerticalSpace = wallAreaHeight - (wallVerticalPadding * 2) - item.offsetHeight;
                const randomTop = Math.random() * availableVerticalSpace;
                item.style.top = `${wallVerticalPadding + randomTop}px`;
                item.style.position = 'absolute'; // topを有効にする
            }
        });
        updateGalleryLayout(); // ギャラリー全体の配置を更新
    });
});
