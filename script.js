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
    const itemMargin = 40; // CSSの.gallery-itemのmargin-left/rightと合わせる

    // 画像のランダムなサイズ設定範囲（額縁なし）
    const minImgHeight = 200; // 画像の最小高さ
    const maxImgHeight = 400; // 画像の最大高さ

    // 壁の上下に確保したい余白のピクセル値
    // この値を変えることで、壁の下上にもっと余裕を持たせられます
    const wallVerticalPadding = 60; // 例えば60pxを上下の余白に

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

            // ランダムな高さを決定
            const randomHeight = minImgHeight + Math.random() * (maxImgHeight - minImgHeight);
            
            let displayHeight = randomHeight;
            let displayWidth = displayHeight * aspectRatio;

            // 画像のサイズを適用 (額縁込み)
            item.style.height = `${displayHeight + totalFrameThickness}px`;
            item.style.width = `${displayWidth + totalFrameThickness}px`;

            // 垂直方向のランダムな位置調整
            const wallAreaHeight = wallArea.clientHeight;
            // 壁の利用可能な高さからアイテムの高さを引いた範囲内でランダムに配置
            const availableVerticalSpace = wallAreaHeight - (wallVerticalPadding * 2) - item.offsetHeight;
            const randomTop = Math.random() * availableVerticalSpace;
            item.style.top = `${wallVerticalPadding + randomTop}px`;
            // flexboxで中央揃えされているため、topを使う場合はposition:absoluteが必要
            // しかし、今回は横一列なので、flexboxのalign-itemsに任せる
            // もしランダムな垂直オフセットを適用するなら`position: absolute`と`top`を使う
            // 現状は`align-items: center`で中央揃えされているため、コメントアウト
            // item.style.position = 'absolute'; // これを有効にするなら、CSSのalign-items: centerはコメントアウト

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
        let totalGalleryWidth = 0;
        galleryItems.forEach(item => {
            totalGalleryWidth += item.offsetWidth + (itemMargin * 2); // アイテム幅 + 左右マージン
        });

        // ギャラリーの全体の幅を設定
        galleryInner.style.width = `${totalGalleryWidth}px`;

        // ギャラリーの最初と最後に画面半分の余白を追加 (スクロールの見た目を改善)
        const viewportWidth = window.innerWidth;
        galleryInner.style.paddingLeft = `${viewportWidth / 2}px`;
        galleryInner.style.paddingRight = `${viewportWidth / 2}px`;


        // 最初の画像を画面中央に配置する初期位置
        // galleryInnerのpaddingLeftを考慮して最初のアイテムの真ん中を中央に
        const firstItemOffset = (galleryItems[0].offsetWidth / 2); // 最初のアイテムの中心
        const initialTranslateX = (viewportWidth / 2) - firstItemOffset - parseFloat(getComputedStyle(galleryInner).paddingLeft);
        
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

        let targetIndex = currentIndex; // ターゲットインデックスを現在値で初期化

        if (direction === 'next') {
            targetIndex = Math.min(currentIndex + 1, galleryItems.length - 1);
        } else { // direction === 'prev'
            targetIndex = Math.max(currentIndex - 1, 0);
        }

        // 移動距離を計算
        // 目標のアイテムの左端 + アイテム幅の半分
        const targetItemOffsetFromGalleryStart = galleryItems[targetIndex].offsetLeft + (galleryItems[targetIndex].offsetWidth / 2);
        // ビューポート中央 - (ギャラリーの左端からのアイテムの中心位置 + ギャラリーのpaddingLeft)
        let moveDistance = (window.innerWidth / 2) - (targetItemOffsetFromGalleryStart + parseFloat(getComputedStyle(galleryInner).paddingLeft));

        // 限界値を計算
        const maxTranslateX = (window.innerWidth / 2) - (galleryItems[0].offsetWidth / 2) - parseFloat(getComputedStyle(galleryInner).paddingLeft); // 最初のアイテムが中央に来る位置
        const minTranslateX = (window.innerWidth / 2) - (galleryInner.scrollWidth - galleryItems[galleryItems.length - 1].offsetWidth / 2) - parseFloat(getComputedStyle(galleryInner).paddingLeft); // 最後のアイテムが中央に来る位置

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

        // 限界位置の計算を再確認
        const maxTranslateX = (window.innerWidth / 2) - (galleryItems[0].offsetWidth / 2) - parseFloat(getComputedStyle(galleryInner).paddingLeft);
        const minTranslateX = (window.innerWidth / 2) - (galleryInner.scrollWidth - galleryItems[galleryItems.length - 1].offsetWidth / 2) - parseFloat(getComputedStyle(galleryInner).paddingLeft);

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

                const randomHeight = minImgHeight + Math.random() * (maxImgHeight - minImgHeight);
                let displayHeight = randomHeight;
                let displayWidth = displayHeight * aspectRatio;

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
