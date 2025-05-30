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
    const horizontalSpacing = 80; // 各アイテム間の水平方向の間隔（ランダム性を加える余地あり）
    const verticalSpacing = 60; // 各アイテム間の垂直方向の間隔（ランダム性を加える余地あり）

    const minImgSize = 150; // 画像の最小サイズ（短い辺）
    const maxImgSize = 350; // 画像の最大サイズ（長い辺）

    // 壁の上下に確保したい余白の割合
    const wallVerticalPaddingRatio = 0.15; // 例えば、壁の高さの15%を上下の余白に

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

            // ランダムなサイズ倍率を決定
            // minImgSizeからmaxImgSizeの範囲で、短い辺の基準サイズを決める
            const randomBaseSize = minImgSize + Math.random() * (maxImgSize - minImgSize);

            let displayWidth, displayHeight;

            if (aspectRatio > 1) { // 横長画像
                displayWidth = randomBaseSize;
                displayHeight = displayWidth / aspectRatio;
            } else { // 縦長または正方形画像
                displayHeight = randomBaseSize;
                displayWidth = displayHeight * aspectRatio;
            }

            // アイテム（額縁）の最終的なサイズを設定
            item.style.width = `${displayWidth + totalFrameThickness}px`;
            item.style.height = `${displayHeight + totalFrameThickness}px`;

            if (loadedImagesCount === images.length) {
                // すべての画像がロードされた後に、ギャラリーの配置と初期位置を設定
                arrangeImagesIrregularly();
            }
        };
        img.onerror = () => {
            console.error(`画像のロードに失敗しました: ${img.src}`);
            loadedImagesCount++;
            if (loadedImagesCount === images.length) {
                arrangeImagesIrregularly();
            }
        };
        // キャッシュされている画像の場合
        if (img.complete) {
            img.onload();
        }
    });

    let columns = []; // 各列の現在の使用済み高さを管理
    let galleryTotalWidth = 0; // ギャラリー全体の幅

    // 画像を不規則に配置する関数 (新しいロジック)
    function arrangeImagesIrregularly() {
        const wallAreaHeight = wallArea.clientHeight;
        const wallVerticalPadding = wallAreaHeight * wallVerticalPaddingRatio; // 上下の余白
        const availableWallHeight = wallAreaHeight - (wallVerticalPadding * 2); // 上下の余白を除いた有効な壁の高さ

        // 初期化：各列の現在の高さを0に設定
        // 適度な列数を見積もる（例: ギャラリーの幅/最小アイテム幅）
        const estimatedMaxColumns = Math.ceil(galleryItems.length / 2); // 2行に並ぶ可能性を考慮
        columns = Array.from({ length: estimatedMaxColumns * 2 }, () => 0); // 各列の高さ

        let currentX = 0; // 現在配置中のX座標の基準
        let itemProcessedCount = 0; // 配置済みのアイテム数

        galleryItems.forEach((item, index) => {
            // 配置する列のインデックスを決定
            // 常に最も低い列を見つける（縦に詰めていく）
            let targetColumnIndex = 0;
            let minHeight = Infinity;
            for (let i = 0; i < columns.length; i++) {
                if (columns[i] < minHeight) {
                    minHeight = columns[i];
                    targetColumnIndex = i;
                }
            }

            // ランダムな水平オフセット（水平方向の「いい感じ」のズレ）
            // -horizontalSpacing/2 から +horizontalSpacing/2 の範囲
            const randomXOffset = (Math.random() - 0.5) * horizontalSpacing;

            // X座標の設定
            // 現在のX基準 + ランダムオフセット
            item.style.left = `${currentX + randomXOffset}px`;

            // Y座標の設定（壁の上下余白と、列の現在の高さを考慮）
            // 列の高さ + 垂直方向のランダムオフセット
            const randomYOffset = (Math.random() - 0.5) * (verticalSpacing / 2); // 垂直方向のズレを小さめに
            item.style.top = `${wallVerticalPadding + columns[targetColumnIndex] + randomYOffset}px`;

            item.style.position = 'absolute'; // left/topを有効にするため

            // 列の高さを更新
            columns[targetColumnIndex] += item.offsetHeight + verticalSpacing;

            // 次の列（垂直に配置する列）のインデックス
            const nextColumnIndex = targetColumnIndex + 1;

            // もし現在の列の高さが壁の最大高さを超えそうなら、次のアイテムは新しい「X座標グループ」に移る
            // または、ある程度のアイテム数を配置したら、次のX座標グループに進む
            // ここでは、特定の数のアイテムが配置されたら次のX座標グループに進むように制御
            // 縦に2～3個並んだら次の水平位置へ
            const itemsPerRowGroup = 2 + Math.floor(Math.random() * 2); // 2個か3個で次のXに移動
            
            itemProcessedCount++;
            if (itemProcessedCount % itemsPerRowGroup === 0) {
                // 次のX座標グループの基準点を更新
                currentX += maxImgSize + horizontalSpacing * 1.5; // ある程度の隙間を空けて移動
                
                // 列の高さをリセット（新しいX座標グループでは新しい垂直配置を開始）
                columns.fill(0); 
            }
        });

        // ギャラリー全体の幅を計算（最も右にあるアイテムの右端）
        galleryTotalWidth = 0;
        galleryItems.forEach(item => {
            const itemRight = parseFloat(item.style.left) + item.offsetWidth;
            if (itemRight > galleryTotalWidth) {
                galleryTotalWidth = itemRight;
            }
        });
        // ギャラリーの最後の余白分を追加
        galleryInner.style.width = `${galleryTotalWidth + window.innerWidth / 2}px`; // 右端にも画面半分の余白

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
        const maxTranslateX = (window.innerWidth / 2) - (galleryItems[0].offsetWidth / 2) - parseFloat(galleryItems[0].style.left);
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

        // 最初のアイテムの中心が画面中央に来る位置
        const maxTranslateX = (window.innerWidth / 2) - (galleryItems[0].offsetWidth / 2) - parseFloat(galleryItems[0].style.left);
        // 最後のアイテムの中心が画面中央に来る位置
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
        galleryItems.forEach(item => {
            const img = item.querySelector('img');
            if (img.complete) {
                // 画像の自然なサイズと縦横比を再取得
                const naturalWidth = img.naturalWidth;
                const naturalHeight = img.naturalHeight;
                const aspectRatio = naturalWidth / naturalHeight;

                // ランダムなサイズ倍率を再計算
                const randomBaseSize = minImgSize + Math.random() * (maxImgSize - minImgSize);
                let displayWidth, displayHeight;
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

                item.style.width = `${displayWidth + totalFrameThickness}px`;
                item.style.height = `${displayHeight + totalFrameThickness}px`;
            }
        });
        arrangeImagesIrregularly(); // ギャラリー全体の配置を更新
    });
});
