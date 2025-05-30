document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('gallery-container'); // 今回は直接使いませんが、要素の取得は残しておきます
    const videoPlayer = document.getElementById('video-player');
    const leftArrow = document.getElementById('left-arrow');
    const rightArrow = document.getElementById('right-arrow');

    // 動画のパス
    const videoPaths = {
        left: 'movies/wall_move_left.mp4',
        right: 'movies/wall_move_right.mp4'
    };

    // 動画を事前に読み込むための関数 (変更なし)
    const preloadVideos = () => {
        for (const key in videoPaths) {
            if (videoPaths.hasOwnProperty(key)) {
                const video = document.createElement('video');
                video.src = videoPaths[key];
                video.preload = 'auto'; // 'auto' または 'metadata'
                video.style.display = 'none'; // 画面に表示しない
                document.body.appendChild(video); // DOMに追加して読み込みを開始させる
            }
        }
    };

    // 動画の再生と背景の切り替えを行う関数
    const playVideo = (direction) => {
        // 再生中の場合は何もしない (連続クリック防止)
        if (!videoPlayer.paused && !videoPlayer.ended) {
            return;
        }

        // 動画プレーヤーのソースを設定
        videoPlayer.src = videoPaths[direction];
        videoPlayer.load(); // ソースを再ロードして準備

        // 動画が再生可能になったら表示して再生
        videoPlayer.oncanplaythrough = () => { // oncanplaythrough: 途切れることなく再生できると判断されたら
            videoPlayer.classList.add('video-active'); // display: block にする
            videoPlayer.play()
                .catch(error => {
                    console.error("動画の再生に失敗しました:", error);
                    resetToBackground();
                });
            videoPlayer.oncanplaythrough = null; // イベントリスナーを一度だけ実行するために解除
        };

        // oncanplaythroughが何らかの理由で発火しない場合（非常に短い動画など）
        // に備えて、少し遅れても再生を試みるフォールバック
        setTimeout(() => {
            if (videoPlayer.paused) { // まだ再生が始まっていなければ
                videoPlayer.classList.add('video-active');
                videoPlayer.play().catch(error => {
                    console.error("動画の再生に失敗しました (fallback):", error);
                    resetToBackground();
                });
            }
        }, 100); // 100ms 待つ
    };

    // 動画再生終了後の処理
    videoPlayer.addEventListener('ended', () => {
        resetToBackground();
    });

    // 動画再生中にエラーが発生した場合の処理
    videoPlayer.addEventListener('error', (e) => {
        console.error("動画再生中にエラーが発生しました:", e);
        resetToBackground();
    });

    // 背景画像に戻す関数 (動画を非表示にする)
    const resetToBackground = () => {
        videoPlayer.pause();
        videoPlayer.classList.remove('video-active'); // display: none にする
        videoPlayer.src = ''; // ソースをクリアしてメモリを解放
        // galleryContainerの背景は常に表示されているため、特別な操作は不要
    };

    // イベントリスナーの設定
    leftArrow.addEventListener('click', () => {
        playVideo('left');
    });

    rightArrow.addEventListener('click', () => {
        playVideo('right');
    });

    // ページロード時に動画を事前に読み込む
    preloadVideos();
});