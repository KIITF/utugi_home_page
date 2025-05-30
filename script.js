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

    // --- 設定値 ---
    const itemsPerPage = 6; // 1ページ（画面幅）に表示したい作品数
    const baseItemWidth = 280; // 額縁込みのアイテムの基準幅（px）
    const itemHorizontalGap = 80; // アイテム間の水平方向の間隔（px）

    // 壁の上下に確保したい余白のピクセル値
    const wallVerticalPadding = 80; // 上下80pxの余白を確保

    // 各アイテムの表示サイズを調整する範囲（中央値からの±px）
    const sizeVariationRange = 40; // 基準サイズから±40pxの範囲で変動させる
    // --- /設定値 ---

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

    // 画像がロードされてからサイズと位置を決定
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

            // アイテムのランダムな表示幅を決定
            const randomWidthOffset = Math.random() * sizeVariationRange * 2 - sizeVariationRange; // -sizeVariationRange から +sizeVariationRange
            let itemDisplayWidth = baseItemWidth + randomWidthOffset;

            // 幅に合わせて高さを計算
            let itemDisplayHeight = itemDisplayWidth / aspectRatio;

            // 高さが壁の利用可能な範囲を超えないように調整
            const wallAreaHeight = wallArea.clientHeight;
            const availableWallHeight = wallAreaHeight - (wallVerticalPadding * 2);

            if (itemDisplayHeight > availableWallHeight) {
                itemDisplayHeight = availableWallHeight;
                itemDisplayWidth = itemDisplayHeight * aspectRatio; // 高さに合わせて幅を再計算
            }

            // アイテム（額縁）の最終的なサイズを設定
            item.style.width = `${itemDisplayWidth}px`;
            item.style.height = `${itemDisplayHeight}px`;

            // 垂直方向の位置調整（壁の上下余白を意識し、縦横比を考慮）
            // 利用可能な垂直スペース内でランダムに配置
            const currentItemHeightWithoutFrame = itemDisplayHeight - totalFrameThickness;
            const availableVerticalSpaceForImage = wallAreaHeight - (wallVerticalPadding * 2) - currentItemHeightWithoutFrame;
            
            let randomTopOffset = Math.random() * availableVerticalSpaceForImage; // 画像の高さに応じてランダムな位置

            // 最終的なtop位置 (額縁のpadding/borderも考慮)
            item.style.top = `${wallVerticalPadding + randomTopOffset - (framePadding / 2) - (frameBorder / 2)}px`;
            item.style.position = 'absolute'; // topを有効にする

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
        let currentX = 0; // galleryInnerの左端からの配置基準X座標

        // 各アイテムのX座標を設定
        galleryItems.forEach((item, index) => {
            // ランダムな水平オフセット（水平方向の「いい感じ」のズレ）
            const randomXOffset = (Math.random() - 0.5) * (itemHorizontalGap / 2); // -40pxから+40px

            item.style.left = `${currentX + randomXOffset}px`;
            currentX += item.offsetWidth + itemHorizontalGap; // 次のアイテムの開始位置
        });

        // ギャラリーの全体の幅を設定
        galleryInner.style.width = `${currentX}px`;

        // ギャラリーの最初と最後に画面半分の余白を追加 (スクロールの見た目を改善)
        const viewportWidth = window.innerWidth;
        galleryInner.style.paddingLeft = `${viewportWidth / 2}px`;
        galleryInner.style.paddingRight = `${viewportWidth / 2}px`;

        // 最初の画像を画面中央に配置する初期位置
        // galleryInnerのpaddingLeftを考慮
        const initialTranslateX = (viewportWidth / 2) - (galleryItems[0].offsetWidth / 2) - parseFloat(getComputedStyle(galleryInner).paddingLeft) - parseFloat(galleryItems[0].style.left || 0);
        
        galleryInner.style.transform = `translateX(${initialTranslateX}px)`;
        currentTranslateX = initialTranslateX;

        updateArrowStates(); // 矢印の状態を更新
    }

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

        // 移動距離を計算
        const targetItem = galleryItems[targetIndex];
        const targetItemLeft = parseFloat(targetItem.style.left);
        const targetItemWidth = targetItem.offsetWidth;
        const viewportCenter = window.innerWidth / 2;

        // 目標のアイテムの中心がビューポート中央に来るように
        let moveDistance = viewportCenter - (targetItemLeft + (targetItemWidth / 2) + parseFloat(getComputedStyle(galleryInner).paddingLeft));

        // 限界値を計算
        const maxTranslateX = (window.innerWidth / 2) - (galleryItems[0].offsetWidth / 2) - parseFloat(getComputedStyle(galleryInner).paddingLeft) - parseFloat(galleryItems[0].style.left || 0); // 最初のアイテムが中央に来る位置
        const minTranslateX = (window.innerWidth / 2) - (parseFloat(galleryInner.style.width) - galleryItems[galleryItems.length - 1].offsetWidth / 2) - parseFloat(getComputedStyle(galleryInner).paddingLeft) - parseFloat(galleryItems[galleryItems.length - 1].style.left || 0); // 最後のアイテムが中央に来る位置

        // 限界値を超えないように補正
        if (moveDistance > maxTranslateX) {
            moveDistance = maxTranslateX;
        } else if (moveDistance < minTranslateX) {
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
        const maxTranslateX = (window.innerWidth / 2) - (galleryItems[0].offsetWidth / 2) - parseFloat(getComputedStyle(galleryInner).paddingLeft) - parseFloat(galleryItems[0].style.left || 0);
        const minTranslateX = (window.innerWidth / 2) - (parseFloat(galleryInner.style.width) - galleryItems[galleryItems.length - 1].offsetWidth / 2) - parseFloat(getComputedStyle(galleryInner).paddingLeft) - parseFloat(galleryItems[galleryItems.length - 1].style.left || 0);

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

                const framePadding = 10 * 2;
                const frameBorder = 2 * 2;
                const totalFrameThickness = framePadding + frameBorder;

                const randomWidthOffset = Math.random() * sizeVariationRange * 2 - sizeVariationRange;
                let itemDisplayWidth = baseItemWidth + randomWidthOffset;

                let itemDisplayHeight = itemDisplayWidth / aspectRatio;

                const wallAreaHeight = wallArea.clientHeight;
                const availableWallHeight = wallAreaHeight - (wallVerticalPadding * 2);

                if (itemDisplayHeight > availableWallHeight) {
                    itemDisplayHeight = availableWallHeight;
                    itemDisplayWidth = itemDisplayHeight * aspectRatio;
                }

                item.style.width = `${itemDisplayWidth}px`;
                item.style.height = `${itemDisplayHeight}px`;

                const currentItemHeightWithoutFrame = itemDisplayHeight - totalFrameThickness;
                const availableVerticalSpaceForImage = wallAreaHeight - (wallVerticalPadding * 2) - currentItemHeightWithoutFrame;
                
                let randomTopOffset = Math.random() * availableVerticalSpaceForImage;
                item.style.top = `${wallVerticalPadding + randomTopOffset - (framePadding / 2) - (frameBorder / 2)}px`;
            }
        });
        updateGalleryLayout(); // ギャラリー全体の配置を更新
    });
});
