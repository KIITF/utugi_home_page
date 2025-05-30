document.addEventListener('DOMContentLoaded', () => {
    const galleryInner = document.querySelector('.gallery-inner');
    const leftArrow = document.getElementById('leftArrow');
    const rightArrow = document.getElementById('rightArrow');

    // ポートフォリオ画像のリストとリンク先
    const images = [
        { src: 'images/cappuccino.png', link: 'https://www.youtube.com/', alt: 'Cappuccino' },
        { src: 'images/EpisodeX.png', link: 'https://www.youtube.com/', alt: 'Episode X' },
        { src: 'images/c_plant_yuki.png', link: 'https://www.youtube.com/', alt: 'Plant Yuki' },
        { src: 'images/cappuccino.png', link: 'https://www.youtube.com/', alt: 'Cappuccino 2' },
        { src: 'images/EpisodeX.png', link: 'https://www.youtube.com/', alt: 'Episode X 2' },
        { src: 'images/c_plant_yuki.png', link: 'https://www.youtube.com/', alt: 'Plant Yuki 2' },
        { src: 'images/cappuccino.png', link: 'https://www.youtube.com/', alt: 'Cappuccino 3' },
        { src: 'images/EpisodeX.png', link: 'https://www.youtube.com/', alt: 'Episode X 3' },
        { src: 'images/c_plant_yuki.png', link: 'https://www.youtube.com/', alt: 'Plant Yuki 3' },
    ];

    let currentIndex = 0;
    const marginBetweenItems = 40; // gallery-itemの左右マージン (CSSと合わせる)

    // 画像を動的にギャラリーに追加
    images.forEach(imageData => {
        const a = document.createElement('a');
        a.href = imageData.link;
        a.target = '_blank'; // 新しいタブで開く
        a.classList.add('gallery-item');

        const img = document.createElement('img');
        img.src = imageData.src;
        img.alt = imageData.alt;

        a.appendChild(img);
        galleryInner.appendChild(a);
    });

    // 画像がロードされてからサイズを調整し、位置をずらす
    // すべての画像をロードし終わってから処理を実行
    let loadedImagesCount = 0;
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        img.onload = () => {
            loadedImagesCount++;

            // 画像のサイズに合わせて額縁（paddingとborder）の幅を調整
            // 画像の縦横比を保ちつつ、壁の高さの一定割合に収める
            const wallAreaHeight = document.querySelector('.wall-area').clientHeight;
            const targetHeight = wallAreaHeight * 0.7; // 壁の高さの70%を使用
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            let imgWidth = targetHeight * aspectRatio;
            let imgHeight = targetHeight;

            // 最小幅と最大幅を設定して極端なサイズにならないようにする (任意)
            if (imgWidth < 200) imgWidth = 200;
            if (imgWidth > 450) imgWidth = 450;
            imgHeight = imgWidth / aspectRatio; // 幅に合わせて高さを再計算

            item.style.width = `${imgWidth + (10 * 2) + (2 * 2)}px`; // 画像幅 + padding + border
            item.style.height = `${imgHeight + (10 * 2) + (2 * 2)}px`; // 画像高さ + padding + border

            // 額縁の位置を「いい感じにずらす」
            // wall-areaの高さの範囲内でランダムに位置を調整
            const wallPaddingTopBottom = wallAreaHeight * 0.1; // 壁の上下の余白
            const availableHeight = wallAreaHeight - wallPaddingTopBottom * 2 - item.offsetHeight;
            const randomTop = Math.random() * availableHeight; // ランダムな上方向のオフセット
            item.style.top = `${randomTop + wallPaddingTopBottom}px`;
            item.style.position = 'absolute'; // topを有効にするためにabsoluteにする

            // 各アイテムを壁内でランダムなX位置に配置するためのleftオフセットを設定
            // これは後で移動量を計算する際に使う
            item.dataset.originalLeft = parseFloat(item.style.left || 0);


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
    });

    // ギャラリーの全体幅を計算し、配置
    function updateGalleryPosition() {
        let totalWidth = 0;
        let currentX = 0; // 各アイテムの開始位置
        const items = Array.from(galleryInner.children); // ライブコレクションではなく配列に変換

        items.forEach((item, index) => {
            // 各アイテムにランダムな左右のオフセットを適用
            // item.style.marginLeft = `${marginBetweenItems + (Math.random() * 80 - 40)}px`; // -40pxから+40pxまでランダムにずらす
            // item.style.marginRight = `${marginBetweenItems + (Math.random() * 80 - 40)}px`;

            // ここでは margin-left/right はCSSで固定し、ギャラリー全体の移動で対応
            // 各アイテムを横にずらす（CSSのmargin-left/rightに加えて）
            const randomXOffset = (Math.random() - 0.5) * 80; // -40px から +40px の範囲
            item.style.marginLeft = `${marginBetweenItems + randomXOffset}px`;
            item.style.marginRight = `${marginBetweenItems - randomXOffset}px`;


            // 各アイテムの最終的な幅（margin含む）を計算
            const itemFullWidth = item.offsetWidth + parseFloat(getComputedStyle(item).marginLeft) + parseFloat(getComputedStyle(item).marginRight);
            
            // アイテムのleftプロパティを更新（absolute配置とギャラリー全体の移動を組み合わせる）
            // この`left`は、`gallery-inner`の左端からの相対位置
            item.style.left = `${currentX}px`;
            currentX += itemFullWidth; // 次のアイテムの開始位置を更新
        });

        // gallery-inner全体の幅を計算し、設定
        totalWidth = currentX; // 最後のアイテムの末尾までの幅
        galleryInner.style.width = `${totalWidth}px`;


        // ギャラリーの初期位置を設定（最初の画像を中央に）
        // padding: 0 50vw; を考慮して、全体の幅を計算
        const viewportWidth = window.innerWidth;
        const initialGalleryOffset = (viewportWidth / 2) - (items[0].offsetWidth / 2) - parseFloat(getComputedStyle(items[0]).marginLeft);
        galleryInner.style.transform = `translateX(${initialGalleryOffset}px)`;
        currentTranslateX = initialGalleryOffset; // 初期位置を設定

        // 矢印の有効/無効状態を更新
        updateArrowStates();
    }


    let currentTranslateX = 0; // galleryInnerの現在のtranslateX値

    // ギャラリーを移動させる関数
    function moveToItem(direction) {
        // 現在のtranslateX値を数値として取得
        const transformValue = window.getComputedStyle(galleryInner).transform;
        if (transformValue !== 'none') {
            currentTranslateX = parseFloat(transformValue.split(',')[4]);
        } else {
            currentTranslateX = 0;
        }

        let targetIndex;
        let moveDistance = 0;

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
        // `gallery-inner`の`left: 0;`からスタートしたときの、目標アイテムの左端位置
        const targetItemLeft = parseFloat(galleryItems[targetIndex].style.left);
        const itemCenterOffset = galleryItems[targetIndex].offsetWidth / 2; // アイテムの中心までのオフセット
        const viewportCenter = window.innerWidth / 2; // ビューポートの中央

        // 目標の移動量: アイテムの左端がビューポート中央に来るように
        moveDistance = viewportCenter - targetItemLeft - itemCenterOffset;

        // ギャラリーの左端と右端の限界値
        const minTranslateX = window.innerWidth / 2 - galleryInner.scrollWidth + (galleryItems[galleryItems.length - 1].offsetWidth / 2); // 右端の画像が中央に来る位置
        const maxTranslateX = window.innerWidth / 2 - (galleryItems[0].offsetWidth / 2); // 左端の画像が中央に来る位置

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
        // galleryInnerが完全にロードされていなければ何もしない
        if (!galleryInner.scrollWidth) return;

        // 許容誤差を設定
        const epsilon = 5; // 5pxの誤差を許容

        // 現在の表示位置（左端からのtranslateX値）
        const currentLeft = currentTranslateX;

        // ギャラリーの左端がビューポート中央に来るべき理想の位置
        const idealMaxLeft = window.innerWidth / 2 - (galleryItems[0].offsetWidth / 2) - parseFloat(getComputedStyle(galleryItems[0]).marginLeft);

        // ギャラリーの右端がビューポート中央に来るべき理想の位置
        const idealMinLeft = window.innerWidth / 2 - galleryInner.scrollWidth + (galleryItems[galleryItems.length - 1].offsetWidth / 2) + parseFloat(getComputedStyle(galleryItems[galleryItems.length - 1]).marginRight);

        if (currentLeft >= idealMaxLeft - epsilon) {
            leftArrow.classList.add('disabled');
        } else {
            leftArrow.classList.remove('disabled');
        }

        if (currentLeft <= idealMinLeft + epsilon) {
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

    // リサイズ時にギャラリーの位置を再調整
    window.addEventListener('resize', () => {
        // 画像のサイズと位置の計算を再実行
        loadedImagesCount = 0; // ロード済みカウントをリセットして再計算を強制
        galleryItems.forEach(item => {
            const img = item.querySelector('img');
            // 画像のロード完了を待つ必要があるので、onloadトリガーのロジックに任せる
            // もしくは、ここではDOM要素の再配置のみを行い、サイズは別途計算
            // 今回は簡略化のため、リサイズ時もすべての画像が再配置される想定
            const wallAreaHeight = document.querySelector('.wall-area').clientHeight;
            const targetHeight = wallAreaHeight * 0.7;
            const imgNaturalWidth = img.naturalWidth;
            const imgNaturalHeight = img.naturalHeight;
            const aspectRatio = imgNaturalWidth / imgNaturalHeight;

            let imgWidth = targetHeight * aspectRatio;
            let imgHeight = targetHeight;

            if (imgWidth < 200) imgWidth = 200;
            if (imgWidth > 450) imgWidth = 450;
            imgHeight = imgWidth / aspectRatio;

            item.style.width = `${imgWidth + (10 * 2) + (2 * 2)}px`;
            item.style.height = `${imgHeight + (10 * 2) + (2 * 2)}px`;

            const wallPaddingTopBottom = wallAreaHeight * 0.1;
            const availableHeight = wallAreaHeight - wallPaddingTopBottom * 2 - item.offsetHeight;
            const randomTop = Math.random() * availableHeight;
            item.style.top = `${randomTop + wallPaddingTopBottom}px`;
        });
        updateGalleryPosition();
    });
});
