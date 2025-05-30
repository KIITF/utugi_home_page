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
    ];

    let currentIndex = 0; // 現在表示されている画像のインデックス（中央に来る画像）
    const cellWidth = 350; // 各グリッドセルの基準幅 (額縁込み)
    const cellHeight = 350; // 各グリッドセルの基準高さ (額縁込み)
    const gridPaddingX = 60; // グリッドの左右の余白（セル間のマージンとして機能）
    const gridPaddingY = 60; // グリッドの上下の余白（セル間のマージンとして機能）

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

    // すべての画像をロードし終わってから処理を実行
    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        img.onload = () => {
            loadedImagesCount++;

            // 額縁の厚み (CSSのpaddingとborderの合計)
            const framePadding = 10 * 2; // top/bottom and left/right padding
            const frameBorder = 2 * 2;   // top/bottom and left/right border
            const totalFrameThickness = framePadding + frameBorder;

            // 画像の縦横比を保ちつつ、グリッドセルに収まるように調整
            const naturalWidth = img.naturalWidth;
            const naturalHeight = img.naturalHeight;
            const aspectRatio = naturalWidth / naturalHeight;

            // 画像のサイズをセルに合わせて調整
            let displayWidth = cellWidth - totalFrameThickness;
            let displayHeight = cellHeight - totalFrameThickness;

            if (aspectRatio > (displayWidth / displayHeight)) { // 画像が横長の場合
                displayHeight = displayWidth / aspectRatio;
            } else { // 画像が縦長または正方形の場合
                displayWidth = displayHeight * aspectRatio;
            }

            // アイテム（額縁）の最終的なサイズを設定
            item.style.width = `${displayWidth + totalFrameThickness}px`;
            item.style.height = `${displayHeight + totalFrameThickness}px`;

            if (loadedImagesCount === images.length) {
                // すべての画像がロードされた後に、ギャラリーの配置と初期位置を設定
                placeImagesInGrid();
            }
        };
        img.onerror = () => {
            console.error(`画像のロードに失敗しました: ${img.src}`);
            loadedImagesCount++;
            if (loadedImagesCount === images.length) {
                placeImagesInGrid();
            }
        };
        // キャッシュされている画像の場合
        if (img.complete) {
            img.onload();
        }
    });

    let columns = []; // グリッドの列を管理する配列。各列の現在の高さ（使用済みスペース）を保持
    let galleryTotalWidth = 0; // ギャラリー全体の幅

    // グリッドに画像を配置する関数
    function placeImagesInGrid() {
        const wallAreaHeight = wallArea.clientHeight;
        // 壁の上下の利用可能範囲
        const availableWallHeight = wallAreaHeight - (gridPaddingY * 2); // 上下のパディングを考慮
        
        // 列の初期化
        columns = []; // 以前の配置をリセット
        // 最初の列は0pxから開始
        columns.push({ x: 0, height: 0 });

        galleryItems.forEach((item, index) => {
            // 各アイテムを配置する最適な列を見つける
            let bestColumnIndex = 0;
            let minColumnHeight = Infinity;

            for (let i = 0; i < columns.length; i++) {
                if (columns[i].height < minColumnHeight) {
                    minColumnHeight = columns[i].height;
                    bestColumnIndex = i;
                }
            }

            // 選択された列にアイテムを配置
            item.style.left = `${columns[bestColumnIndex].x + gridPaddingX / 2}px`; // 左側のグリッドパディング
            item.style.top = `${columns[bestColumnIndex].height + gridPaddingY / 2}px`; // 上側のグリッドパディング

            // 列の高さとX座標を更新
            columns[bestColumnIndex].height += item.offsetHeight + gridPaddingY;

            // もし現在の列の高さが壁の最大高さを超える場合、新しい列を開始
            if (columns[bestColumnIndex].height > availableWallHeight) {
                // 新しい列のX座標は、現在の列のX座標 + セルの幅 + グリッドの左右パディング
                const newColumnX = columns[bestColumnIndex].x + cellWidth + gridPaddingX;
                columns.push({ x: newColumnX, height: 0 }); // 新しい列を開始
            }
            // 各アイテムの左マージンは、CSSではなくJavaScriptで個別に計算・設定
            item.style.marginLeft = `${gridPaddingX / 2}px`;
            item.style.marginRight = `${gridPaddingX / 2}px`; // 各アイテムの右マージン
        });

        // ギャラリー全体の幅を計算（最も右にある列のx座標 + セルの幅）
        galleryTotalWidth = 0;
        columns.forEach(col => {
            if (col.x + cellWidth > galleryTotalWidth) {
                galleryTotalWidth = col.x + cellWidth;
            }
        });
        galleryInner.style.width = `${galleryTotalWidth + gridPaddingX}px`; // ギャラリー全体の幅を設定

        // 最初の画像を画面中央に配置する初期位置を再計算
        const initialGalleryOffset = (window.innerWidth / 2) - (galleryItems[0].offsetWidth / 2) - parseFloat(galleryItems[0].style.left);
        galleryInner.style.transform = `translateX(${initialGalleryOffset}px)`;
        currentTranslateX = initialGalleryOffset;

        updateArrowStates(); // 矢印の状態を更新
    }

    let currentTranslateX = 0; // galleryInnerの現在のtranslateX値

    // ギャラリーを移動させる関数
    function moveToItem(direction) {
        const transformValue = window.getComputedStyle(galleryInner).transform;
        if (transformValue !== 'none') {
            const matrix = new DOMMatrixReadOnly(transformValue);
            currentTranslateX = matrix.m41;
        }

        let targetIndex;
        if (direction === 'next') {
            targetIndex = currentIndex + 1;
            if (targetIndex >= galleryItems.length) {
                targetIndex = galleryItems.length - 1;
            }
        } else { // direction === 'prev'
            targetIndex = currentIndex - 1;
            if (targetIndex < 0) {
                targetIndex = 0;
            }
        }

        // 目標のアイテムの中心がビューポート中央に来るように移動量を計算
        const targetItem = galleryItems[targetIndex];
        const targetItemLeft = parseFloat(targetItem.style.left);
        const targetItemWidth = targetItem.offsetWidth;
        const viewportCenter = window.innerWidth / 2;

        let moveDistance = viewportCenter - (targetItemLeft + (targetItemWidth / 2));

        // ギャラリーの左端と右端の限界値
        // 最初のアイテムの中心が画面中央に来る位置
        const maxTranslateX = (window.innerWidth / 2) - (galleryItems[0].offsetWidth / 2) - parseFloat(galleryItems[0].style.left);
        // 最後のアイテムの中心が画面中央に来る位置
        const minTranslateX = (window.innerWidth / 2) - (galleryItems[galleryItems.length - 1].offsetWidth / 2) - parseFloat(galleryItems[galleryItems.length - 1].style.left);
        
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

        const maxTranslateX = (window.innerWidth / 2) - (galleryItems[0].offsetWidth / 2) - parseFloat(galleryItems[0].style.left);
        const minTranslateX = (window.innerWidth / 2) - (galleryItems[galleryItems.length - 1].offsetWidth / 2) - parseFloat(galleryItems[galleryItems.length - 1].style.left);

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
        // 画像のサイズと位置の計算を再実行
        loadedImagesCount = 0; // ロード済みカウントをリセットして再計算を強制
        galleryItems.forEach(item => {
            const img = item.querySelector('img');
            if (img.complete) {
                // img.onloadロジックを再度実行する
                img.onload(); 
            }
        });
        // placeImagesInGrid() が onload 内で呼ばれるので、ここでは直接呼ばない
        // もしonloadが発火しない場合を考慮するなら、タイムアウトなどで呼び出す
    });
});
