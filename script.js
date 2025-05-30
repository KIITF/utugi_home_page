document.addEventListener('DOMContentLoaded', () => {
    const galleryInner = document.querySelector('.gallery-inner');
    const leftArrow = document.getElementById('leftArrow');
    const rightArrow = document.getElementById('rightArrow');
    // wallArea は Y座標の統一により直接使わなくなりますが、参照として残します
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

    // 画像の目標となる短辺のサイズ (額縁なしの画像本体のサイズ)
    // 以前のベースサイズから1.5倍に拡大: (280 * 1.5 = 420)を参考に、調整
    const fixedBaseImgHeight = 420; // 画像の高さを固定（面積もある程度統一される）

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
            const aspectRatio = naturalWidth / naturalHeight;

            // 高さを固定値に設定し、幅は縦横比から計算
            let displayHeight = fixedBaseImgHeight;
            let displayWidth = displayHeight * aspectRatio;
            
            // アイテム（額縁）の最終的なサイズを設定
            item.style.width = `${displayWidth + totalFrameThickness}px`;
            item.style.height = `${displayHeight + totalFrameThickness}px`;

            // Y座標の調整はFlexboxのalign-items: centerに任せるため、
            // JavaScriptでのtopやposition設定は削除
            // もし何らかの理由でわずかにY座標をずらしたい場合は、
            // item.style.position = 'relative'; と item.style.top = 'XXpx'; を使う

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
        // 最初のアイテムが画面中央に来るように、paddingLeftを調整
        galleryInner.style.paddingLeft = `${viewportWidth / 2 - (galleryItems[0].offsetWidth / 2) - itemMargin}px`;
        // 最後のアイテムが画面中央に来るように、paddingRightを調整
        galleryInner.style.paddingRight = `${viewportWidth / 2 - (galleryItems[galleryItems.length - 1].offsetWidth / 2) - itemMargin}px`;

        // 最初の画像を中央に配置する初期位置は、paddingLeftで調整されるため、
        // transformXは0に戻しておく
        galleryInner.style.transform = `translateX(0px)`;
        currentTranslateX = 0; // 初期位置を設定

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

        // 目標のアイテムの中心がビューポート中央に来るように移動量を計算
        const targetItem = galleryItems[targetIndex];
        // offsetLeft は padding を含む galleryInner の左端からの位置
        const targetItemOffsetFromGalleryInnerStart = targetItem.offsetLeft;
        const targetItemWidth = targetItem.offsetWidth;
        const viewportCenter = window.innerWidth / 2;

        // 目標の移動量: ビューポートの中央 - (アイテムのgalleryInnerからの開始位置 + アイテムの幅の半分 + galleryInnerのpaddingLeft)
        let moveDistance = viewportCenter - (targetItemOffsetFromGalleryInnerStart + (targetItemWidth / 2) + parseFloat(getComputedStyle(galleryInner).paddingLeft));

        // 限界値を計算
        const maxTranslateX = (window.innerWidth / 2) - (galleryItems[0].offsetWidth / 2) - parseFloat(getComputedStyle(galleryInner).paddingLeft); // 最初のアイテムが中央に来る位置
        const minTranslateX = (window.innerWidth / 2) - (galleryInner.scrollWidth - parseFloat(getComputedStyle(galleryInner).paddingRight) - (galleryItems[galleryItems.length - 1].offsetWidth / 2)); // 最後のアイテムが中央に来る位置

        // 限界値を超えないように補正
        if (moveDistance > maxTranslateX + 0.1) {
            moveDistance = maxTranslateX;
        } else if (moveDistance < minTranslateX - 0.1) {
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

                // 高さを固定値に設定し、幅は縦横比から計算
                let displayHeight = fixedBaseImgHeight;
                let displayWidth = displayHeight * aspectRatio;
                
                const framePadding = 10 * 2;
                const frameBorder = 2 * 2;
                const totalFrameThickness = framePadding + frameBorder;

                item.style.height = `${displayHeight + totalFrameThickness}px`;
                item.style.width = `${displayWidth + totalFrameThickness}px`;
            }
        });
        updateGalleryLayout(); // ギャラリー全体の配置を更新
    });
});
