document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('gallery-container');
    const videoPlayer = document.getElementById('video-player');
    const leftArrow = document.getElementById('left-arrow');
    const rightArrow = document.getElementById('right-arrow');

    const videoPaths = {
        left: 'movies/wall_move_left.mp4',
        right: 'movies/wall_move_right.mp4'
    };

    // 動画を事前に読み込むための関数
    // 今回はpreload="auto"とposter属性を使うため、DOMへの追加は不要
    const preloadVideos = () => {
        // poster属性でwal_base.pngが表示されるため、ここでは特別なDOM操作は不要
        // ブラウザがpreload="auto"に基づいて動画データを事前に取得する
    };

    // 動画の再生と背景の切り替えを行う関数
    const playVideo = (direction) => {
        // 矢印ボタンを一時的に無効化
        leftArrow.disabled = true;
        rightArrow.disabled = true;

        videoPlayer.src = videoPaths[direction];
        videoPlayer.load(); // 動画を再ロード

        // 動画が準備完了したら再生を開始し、スムーズに表示を切り替える
        videoPlayer.addEventListener('canplaythrough', function handler() {
            videoPlayer.removeEventListener('canplaythrough', handler); // イベントリスナーを一度だけ実行

            // 背景画像を非表示にする（透明にする）
            galleryContainer.style.backgroundImage = 'none';

            // videoPlayerを表示状態にする
            videoPlayer.classList.remove('hidden');
            videoPlayer.classList.add('visible'); // opacity: 1; を適用

            videoPlayer.play()
                .catch(error => {
                    console.error("動画の再生に失敗しました:", error);
                    resetToBackground();
                });
        }, { once: true }); // イベントリスナーが一度だけ実行されるように設定

        // エラーハンドリング
        videoPlayer.addEventListener('error', function errorHandler(e) {
            videoPlayer.removeEventListener('error', errorHandler);
            console.error("動画再生中にエラーが発生しました:", e);
            resetToBackground();
        }, { once: true });
    };

    // 動画再生終了後の処理
    videoPlayer.addEventListener('ended', () => {
        resetToBackground();
    });

    // 背景画像に戻す関数
    const resetToBackground = () => {
        videoPlayer.pause();
        videoPlayer.currentTime = 0; // 動画を最初に戻す

        // videoPlayerを非表示にする
        videoPlayer.classList.remove('visible');
        videoPlayer.classList.add('hidden'); // opacity: 0; を適用

        // transitionが完了するのを待ってから背景画像を再表示
        // これにより、動画が完全に透明になってから背景画像が現れる
        videoPlayer.addEventListener('transitionend', function handler() {
            videoPlayer.removeEventListener('transitionend', handler);
            galleryContainer.style.backgroundImage = 'url("images/wall_base.png")';
            // 矢印ボタンを再度有効化
            leftArrow.disabled = false;
            rightArrow.disabled = false;
        }, { once: true });
    };

    // イベントリスナーの設定
    leftArrow.addEventListener('click', () => {
        playVideo('left');
    });

    rightArrow.addEventListener('click', () => {
        playVideo('right');
    });

    // ページロード時に動画を事前に読み込む (preload="auto"が主となる)
    preloadVideos();
});