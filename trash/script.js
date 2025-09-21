document.addEventListener('DOMContentLoaded', () => {
    const wallBase = document.getElementById('wall-base');
    const videoLeft = document.getElementById('video-left');
    const videoRight = document.getElementById('video-right');
    const arrowLeft = document.getElementById('arrow-left');
    const arrowRight = document.getElementById('arrow-right');

    let currentVideo = null; // 現在再生中の動画を追跡

    // 動画再生後の処理
    const handleVideoEnd = () => {
        if (currentVideo) {
            currentVideo.style.display = 'none'; // 動画を非表示にする
            currentVideo.currentTime = 0; // 動画の再生位置を最初に戻す
            currentVideo = null; // 現在再生中の動画をリセット
            // 必要に応じてwallBaseを再表示する処理もここに記述できますが、今回は常に表示されるため不要です
        }
    };

    videoLeft.addEventListener('ended', handleVideoEnd);
    videoRight.addEventListener('ended', handleVideoEnd);

    // 左矢印クリック時の処理
    arrowLeft.addEventListener('click', () => {
        if (currentVideo) {
            currentVideo.pause(); // 他の動画が再生中なら停止
            currentVideo.currentTime = 0;
            currentVideo.style.display = 'none';
        }
        videoLeft.style.display = 'block'; // 動画を表示
        videoLeft.play(); // 動画を再生
        currentVideo = videoLeft;
    });

    // 右矢印クリック時の処理
    arrowRight.addEventListener('click', () => {
        if (currentVideo) {
            currentVideo.pause(); // 他の動画が再生中なら停止
            currentVideo.currentTime = 0;
            currentVideo.style.display = 'none';
        }
        videoRight.style.display = 'block'; // 動画を表示
        videoRight.play(); // 動画を再生
        currentVideo = videoRight;
    });
});