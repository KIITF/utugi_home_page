document.addEventListener('DOMContentLoaded', () => {
    const galleryInner = document.querySelector('.gallery-inner');
    const leftArrow = document.getElementById('leftArrow');
    const rightArrow = document.getElementById('rightArrow');

    // ポートフォリオ画像のリストとリンク先
    const images = [
        { src: 'images/cappuccino.png', link: 'https://www.youtube.com/', alt: 'Cappuccino' },
        { src: 'images/EpisodeX.png', link: 'https://www.youtube.com/', alt: 'Episode X' },
        { src: 'images/c_plant_yuki.png', link: 'https://www.youtube.com/', alt: 'Plant Yuki' },
        // 画像を増やしたい場合はここに追加してください（使いまわし可）
        { src: 'images/cappuccino.png', link: 'https://www.youtube.com/', alt: 'Cappuccino 2' },
        { src: 'images/EpisodeX.png', link: 'https://www.youtube.com/', alt: 'Episode X 2' },
        { src: 'images/c_plant_yuki.png', link: 'https://www.youtube.com/', alt: 'Plant Yuki 2' },
    ];

    let currentIndex = 0; // 現在表示されている画像のインデックス
    const itemWidth = 300 + (40 * 2); // gallery-itemのmin-width + margin-left + margin-right
                                     // CSSのmarginとmin-widthに合わせて調整してください

    // 画像を動的にギャラリーに追加
    images.forEach(imageData => {
        const a = document.createElement('a');
        a.href = imageData.link;
        a.target = '_blank'; // 新しいタブで開く
        a.classList.add('gallery-item');

        const img = document.createElement('img');
        img.src = imageData.src;
        img.alt = imageData.alt;

        const frame = document.createElement('div');
        frame.classList.add('frame');

        a.appendChild(img);
        a.appendChild(frame);
        galleryInner.appendChild(a);
    });

    // ギャラリーの初期位置を設定（最初の画像を中央に）
    // 画面中央に最初の画像を配置するため、初期のtranslateXを計算
    // gallery-innerのleft: 50%; transform: translateX(-50%); が適用されているので、
    // ここでは個々のアイテムのオフセット分だけ動かせばよい
    const initialOffset = (galleryInner.offsetWidth / 2) - (itemWidth / 2);
    // 初回ロード時に中央の画像に合わせるために、ギャラリーの初期位置を調整
    // (これはCSSでleft:50%とtranslateX(-50%)を使っているので、追加のJSでのオフセットは不要な場合が多いですが、
    //  画像の数や幅によっては微調整が必要になります)
    // ここではナビゲーションによって移動を制御するので、初期位置はCSSに任せます。

    // ギャラリーを移動させる関数
    function moveToItem(index) {
        // インデックスが範囲外にならないように調整
        if (index < 0) {
            index = 0;
        } else if (index >= images.length) {
            index = images.length - 1;
        }
        currentIndex = index;

        // 目標のtranslateX値を計算
        // 現在のアイテムがビューポートの中央に来るように調整
        // gallery-innerがtranslateX(-50%)で中央寄せになっているため、
        // 移動量は「現在のアイテムの左端位置 - ギャラリー全体の半分の幅 + アイテムの半分の幅」となる
        // itemWidthはmarginを含むため、正確な計算が必要です
        const targetX = -(currentIndex * itemWidth);
        galleryInner.style.transform = `translateX(calc(-50% + ${targetX}px))`;
    }

    // 矢印クリックイベント
    leftArrow.addEventListener('click', () => {
        moveToItem(currentIndex - 1);
    });

    rightArrow.addEventListener('click', () => {
        moveToItem(currentIndex + 1);
    });

    // 初期表示として最初の画像を中央に配置
    // (DOMロード後、ギャラリーアイテムがすべて配置されてから実行)
    // 初期表示はCSSのflexboxとleft/transformで中央寄せされているため、
    // ここで特に動かす必要はありません。
    // 必要に応じて、特定のインデックスの画像を最初から中央に表示したい場合は、
    // moveToItem(適切な初期インデックス) を呼び出します。
});
