document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('gallery-container');
    const videoPlayer = document.getElementById('video-player');
    const leftArrow = document.getElementById('left-arrow');
    const rightArrow = document.getElementById('right-arrow');

    // 動画のパス
    const videoPaths = {
        left: 'movies/wall_move_left.mp4',
        right: 'movies/wall_move_right.mp4'
    };

    // 動画を事前に読み込むための関数
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
        // 現在の背景画像を非表示にする
        galleryContainer.style.backgroundImage = 'none';

        // 動画プレーヤーを表示し、ソースを設定して再生
        videoPlayer.src = videoPaths[direction];
        videoPlayer.classList.remove('hidden');
        videoPlayer.load(); // ソースを再ロード
        videoPlayer.play()
            .catch(error => {
                console.error("動画の再生に失敗しました:", error);
                // エラーが発生した場合はすぐに背景に戻す
                resetToBackground();
            });
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

    // 背景画像に戻す関数
    const resetToBackground = () => {
        videoPlayer.pause();
        videoPlayer.classList.add('hidden');
        videoPlayer.src = ''; // ソースをクリアしてメモリを解放
        galleryContainer.style.backgroundImage = 'url("images/wall_base.png")';
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