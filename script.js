document.addEventListener('DOMContentLoaded', () => {
    const galleryInner = document.querySelector('.gallery-inner');
    const leftArrow = document.getElementById('leftArrow');
    const rightArrow = document.getElementById('rightArrow');
    const wallArea = document.querySelector('.wall-area');

    // ポートフォリオ画像のリスト、リンク先、タイトル
    const images = [
        { src: 'images/cappuccino.png', link: 'https://www.youtube.com/', alt: 'Cappuccino', title: '贅沢と君とカプチーノ(cover)' },
        { src: 'images/EpisodeX.png', link: 'https://www.youtube.com/', alt: 'Episode X', title: 'EpisodeX(cover)' },
        { src: 'images/c_plant_yuki.png', link: 'https://www.youtube.com/', alt: 'Plant Yuki', title: '食虫植物(cover)' },
        { src: 'images/cappuccino.png', link: 'https://www.youtube.com/', alt: 'Cappuccino 2', title: '贅沢と君とカプチーノ(cover)' },
        { src: 'images/EpisodeX.png', link: 'https://www.youtube.com/', alt: 'Episode X 2', title: 'EpisodeX(cover)' },
        { src: 'images/c_plant_yuki.png', link: 'https://www.youtube.com/', alt: 'Plant Yuki 2', title: '食虫植物(cover)' },
        { src: 'images/cappuccino.png', link: 'https://www.youtube.com/', alt: 'Cappuccino 3', title: '贅沢と君とカプチーノ(cover)' },
        { src: 'images/EpisodeX.png', link: 'https://www.youtube.com/', alt: 'Episode X 3', title: 'EpisodeX(cover)' },
        { src: 'images/c_plant_yuki.png', link: 'https://www.youtube.com/', alt: 'Plant Yuki 3', title: '食虫植物(cover)' },
    ];

    let currentIndex = 0;
    const itemHorizontalMargin = 40; // gallery-itemの左右マージン (CSSと合わせる)

    // 画像を動的にギャラリーに追加
    images.forEach(imageData => {
        const a = document.createElement('a');
        a.href = imageData.link;
        a.target = '_blank'; // 新しいタブで開く
        a.classList.add('gallery-item');

        const img = document.createElement('img');
        img.src = imageData.src;
        img.alt = imageData.alt;

        // ホバー時のオーバーレイとタイトル要素
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        const overlayText = document.createElement('div');
        overlayText.classList.add('overlay-text');
        overlayText.textContent = imageData.title;
        overlay.appendChild(overlayText);

        a.appendChild(img);
        a.appendChild(overlay); // 画像の上にオーバーレイを追加
        galleryInner.appendChild(a);
    });

    let loadedImagesCount = 0;
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item')); // NodeListを配列に変換

    // 画像がロードされてからサイズを調整し、位置をずらす
    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        img.onload = () => {
            loadedImagesCount++;

            // 画像の縦横比を保ちつつ、壁の高さの一定割合に収める
            const wallAreaHeight = wallArea.clientHeight;
            const targetHeight = wallAreaHeight * 0.5; // 壁の高さの50%を使用（画像サイズを調整）
            const aspectRatio = img.naturalWidth / img.naturalHeight;

            // 初期幅と高さ
            let imgWidth = targetHeight * aspectRatio;
            let imgHeight = targetHeight;

            // 画像の最大・最小サイズを設定（額縁含まず）
            const minImgWidth = 180;
            const maxImgWidth = 350;

            if (imgWidth < minImgWidth) imgWidth = minImgWidth;
            if (imgWidth > maxImgWidth) imgWidth = maxImgWidth;
            imgHeight = imgWidth / aspectRatio; // 幅に合わせて高さを再計算

            // 額縁の厚み (CSSのpaddingとborderの合計)
            const framePadding = 10 * 2; // top/bottom padding
            const frameBorder = 2 * 2; // top/bottom border
            const totalFrameThickness = framePadding + frameBorder;

            item.style.width = `${imgWidth + totalFrameThickness}px`;
            item.style.height = `${imgHeight + totalFrameThickness}px`;

            // 額縁の位置を「いい感じにずらす」（縦方向）
            // 壁の上下の余白と画像の高さを考慮して、ランダムなtop位置を決定
            const wallPaddingTopBottom = wallAreaHeight * 0.1; // 壁の上下に10%の余白
            const availableVerticalSpace = wallAreaHeight - (wallPaddingTopBottom * 2) - item.offsetHeight;
            const randomTop = Math.random() * availableVerticalSpace;
            item.style.top = `${randomTop + wallPaddingTopBottom}px`;
            item.style.position = 'absolute'; // topを有効にするためにabsoluteにする

            if (loadedImagesCount === images.length) {
                // すべての画像がロードされた後に、ギャラリーの初期位置を設定
                updateGalleryPosition();
            }
        };
        // エラーハンドリング（画像が見つからない場合など）
        img.onerror = () => {
            console.error(`画像のロードに失敗しました: ${imageData.src}`);
            loadedImagesCount++;
            if (loadedImagesCount === images.length) {
                updateGalleryPosition();
            }
        };
        // キャッシュされている画像の場合はonloadが発火しないことがあるため、
        // 既にcompleteしている場合は手動でonloadをトリガーする
        if (img.complete) {
            img.onload();
        }
    });

    let currentTranslateX = 0; // galleryInnerの現在のtranslateX値

    // ギャラリーの全体幅を計算し、配置
    function updateGalleryPosition() {
        let currentXOffset = 0; // galleryInnerの左端からの各アイテムの相対X位置

        galleryItems.forEach((item, index) => {
            // 各アイテムにランダムな左右のマージンオフセットを適用
            // itemHorizontalMarginはCSSで定義された基本マージン
            // -itemHorizontalMargin/2 から +itemHorizontalMargin/2 の範囲でランダムにずらす
            const randomXOffset = (Math.random() - 0.5) * itemHorizontalMargin; // -20px から +20px の範囲
            
            // `gallery-inner`の左端からの正確な配置
            // margin-left はCSSで指定されているので、別途計算しない
            // ここでは各アイテムのleftプロパティを直接設定して、ギャラリー全体のレイアウトを構築
            item.style.left = `${currentXOffset + (itemHorizontalMargin / 2) + randomXOffset}px`;
            
            // 次のアイテムの開始位置を更新
            // (アイテム幅 + 左右マージンの合計)
            currentXOffset += item.offsetWidth + itemHorizontalMargin;
        });

        // gallery-innerの全体の幅を設定
        // 最後のアイテムの右端 + ギャラリーの最後のマージン
        galleryInner.style.width = `${currentXOffset + (itemHorizontalMargin / 2)}px`;

        // 最初の画像を画面中央に配置する初期位置
        // `(window.innerWidth / 2)`: ビューポートの中央
        // `- (galleryItems[0].offsetWidth / 2)`: 最初のアイテムの中心まで戻す
        // `- (parseFloat(getComputedStyle(galleryItems[0]).left))` : 最初のアイテムのleftオフセットを引く
        const initialGalleryOffset = (window.innerWidth / 2) - (galleryItems[0].offsetWidth / 2) - parseFloat(galleryItems[0].style.left);
        
        galleryInner.style.transform = `translateX(${initialGalleryOffset}px)`;
        currentTranslateX = initialGalleryOffset; // 初期位置をセット

        updateArrowStates(); // 矢印の状態を更新
    }

    // ギャラリーを移動させる関数
    function moveToItem(direction) {
        // 現在のtranslateX値を数値として取得
        const transformValue = window.getComputedStyle(galleryInner).transform;
        if (transformValue !== 'none') {
            const matrix = new DOMMatrixReadOnly(transformValue);
            currentTranslateX = matrix.m41; // translateXの値を取得
        }

        let targetIndex;

        if (direction === 'next') {
            targetIndex = currentIndex + 1;
            if (targetIndex >= galleryItems.length) {
                targetIndex = galleryItems.length - 1; // 最後の画像で止まる
            }
        } else { // direction === 'prev'
            targetIndex = currentIndex - 1;
            if (targetIndex < 0) {
                targetIndex = 0; // 最初の画像で止まる
            }
        }

        // 目標の画像に中央を合わせる移動距離を計算
        // 目標アイテムの左端位置 (galleryInnerからの相対)
        const targetItemLeft = parseFloat(galleryItems[targetIndex].style.left);
        // 目標アイテムの幅
        const targetItemWidth = galleryItems[targetIndex].offsetWidth;
        // ビューポートの中央
        const viewportCenter = window.innerWidth / 2;

        // 目標の移動量: アイテムの中心がビューポート中央に来るように
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
        currentTranslateX = moveDistance; // 現在位置を更新

        updateArrowStates();
    }

    // 矢印の有効/無効状態を更新する関数
    function updateArrowStates() {
        if (!galleryInner.scrollWidth || galleryItems.length === 0) return;

        // 許容誤差を設定（浮動小数点誤差を吸収するため）
        const epsilon = 1; 

        // 左端の限界位置（最初の画像が完全に左端に表示される位置）
        const maxTranslateX = (window.innerWidth / 2) - (galleryItems[0].offsetWidth / 2) - parseFloat(galleryItems[0].style.left);
        // 右端の限界位置（最後の画像が完全に右端に表示される位置）
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

    // リサイズ時にギャラリーの位置とアイテムのサイズを再調整
    window.addEventListener('resize', () => {
        // 画像のサイズと位置の計算を再実行
        galleryItems.forEach(item => {
            const img = item.querySelector('img');
            // 画像のロードが完了していることを確認
            if (img.complete) {
                const wallAreaHeight = wallArea.clientHeight;
                const targetHeight = wallAreaHeight * 0.5;
                const aspectRatio = img.naturalWidth / img.naturalHeight;

                let imgWidth = targetHeight * aspectRatio;
                let imgHeight = targetHeight;

                const minImgWidth = 180;
                const maxImgWidth = 350;

                if (imgWidth < minImgWidth) imgWidth = minImgWidth;
                if (imgWidth > maxImgWidth) imgWidth = maxImgWidth;
                imgHeight = imgWidth / aspectRatio;

                const framePadding = 10 * 2;
                const frameBorder = 2 * 2;
                const totalFrameThickness = framePadding + frameBorder;

                item.style.width = `${imgWidth + totalFrameThickness}px`;
                item.style.height = `${imgHeight + totalFrameThickness}px`;

                const wallPaddingTopBottom = wallAreaHeight * 0.1;
                const availableVerticalSpace = wallAreaHeight - (wallPaddingTopBottom * 2) - item.offsetHeight;
                const randomTop = Math.random() * availableVerticalSpace;
                item.style.top = `${randomTop + wallPaddingTopBottom}px`;
            }
        });
        updateGalleryPosition(); // ギャラリー全体の配置を更新
    });
});
