// ギャラリーデータ定義
// 各カテゴリーでpathPrefixは1回だけ定義し、itemsには個別のファイル情報のみを記述
const galleryData = {
    cgItems: {
        pathPrefix: 'resources/3dcg/',
        items: [
            { type: 'video', fileName: 'nurumayu.mp4', altText: 'Level 37、ぬるま湯と烏。 / Sera。', link: 'https://www.youtube.com/watch?v=me_tPVG_06E', cells: [1, 2] },
            { type: 'video', fileName: 'pastel.mp4', altText: 'パステル / urumeiwashi（cover）', link: 'https://www.youtube.com/watch?v=uyXaE3Z_G6Q', cells: [3, 4, 5, 8, 9, 10] },
            { type: 'video', fileName: 'cyan.mp4', altText: '総べてシアン / urumeiwashi（cover）', link: 'https://www.youtube.com/watch?v=jpvf1JqjGf4', cells: [6, 7, 11, 12] },
            { type: 'video', fileName: 'tukikage.mp4', altText: '月影見し海 / urumeiwashi', link: 'https://www.youtube.com/watch?v=mGBy8PUflyI', cells: [13, 14] },
            { type: 'video', fileName: 'yumeikaga.mp4', altText: '夢如何 / めんま', link: 'https://www.youtube.com/watch?v=GxAioK4PBLQ', cells: [15] }
        ]
    },
    
    lyricMotion: {
        pathPrefix: 'resources/lyric_motion/',
        items: [
            { type: 'video', fileName: 'hell.mp4', altText: '【二次創作】ヘルライクヘヴン / shikisai', link: 'https://www.youtube.com/watch?v=doOi2dS_Wrk', cells: [1, 2] },
            { type: 'video', fileName: 'astronauts.mp4', altText: 'アストロノーツ・テレキャスター / memex', link: 'https://www.youtube.com/watch?v=0inHMl2SktY', cells: [3, 4] },
            { type: 'video', fileName: 'septentrio.mp4', altText: 'セプテントリオー / Sera。 ', link: 'https://www.youtube.com/watch?v=_UKNvO-7ROo', cells: [5] },
            { type: 'video', fileName: 'reflection_fire.mp4', altText: 'Reflection FIRE / Eye feat.つぐ', link: 'https://www.youtube.com/watch?v=TQ9kBxxaQbc', cells: [6, 7, 8, 11, 12, 13] },
            { type: 'video', fileName: 'open_ur.mp4', altText: 'Øpen Ur / Eye＆ど～ぱみん', link: 'https://www.youtube.com/watch?v=10YaDSMg9Ng', cells: [9, 10] },
            { type: 'video', fileName: 'utakata_shima.mp4', altText: 'ウタカタララバイ / 島爺（cover）', link: 'https://x.com/utugi313/status/1862043754426949942/video/1', cells: [14, 15] }
        ]
    },
    
    motionGraphics: {
        pathPrefix: 'resources/motion_graphics/',
        items: [
            { type: 'video', fileName: 'self_251010_design.mp4', altText: '【自主制作】2025/10/10', link: 'https://x.com/utugi313/status/1976560485433819197?s=20', cells: [1, 6] },
            { type: 'video', fileName: 'self_251026.mp4', altText: '【自主制作】2025/10/26', link: 'https://x.com/utugi313/status/1982295977202786499?s=20', cells: [11] },
            { type: 'video', fileName: 'self_251103.mp4', altText: '【自主創作】2025/11/03', link: 'https://x.com/utugi313/status/1985225430417178690?s=20', cells: [4, 5] },
            { type: 'video', fileName: 'ego_rock.mp4', altText: '【二次創作】エゴロック / すりぃ', link: 'https://www.youtube.com/watch?v=D4bpqkqgy8c', cells: [7, 8, 9, 12, 13, 14] },
            { type: 'video', fileName: 'kawaii_2.mp4', altText: '【自主創作】kawaii💛　2026', link: 'https://www.youtube.com/watch?v=6xQbyOZX6Ho', cells: [2, 3] },
            { type: 'video', fileName: 'self_251015_night.mp4', altText: '【自主制作】2025/10/15', link: 'https://x.com/utugi313/status/1978369480448147663?s=20', cells: [10, 15] }
        ]
    },
    
    logoDesign: {
        pathPrefix: 'resources/logo/',
        items: [
            { type: 'image', fileName: 'yumeikaga.jpg', altText: '夢如何 / めんま', link: 'https://www.youtube.com/watch?v=GxAioK4PBLQ', cells: [1, 2] },
            { type: 'image', fileName: 'gen.png', altText: '眩 / ユアネス', link: 'https://www.youtube.com/watch?v=IvDIGdqnWbY', cells: [3, 8] },
            { type: 'image', fileName: 'mieterudake.png', altText: '見えてるだけ / szri', link: 'https://www.youtube.com/watch?v=i-qSBGMxeuA', cells: [4, 5] },
            { type: 'image', fileName: 'open_ur.jpg', altText: 'Øpen Ur / Eye＆ど～ぱみん', link: 'https://www.youtube.com/watch?v=10YaDSMg9Ng', cells: [6, 7, 11, 12] },
            { type: 'image', fileName: 'pastel.jpg', altText: 'パステル / urumeiwashi（cover）', link: 'https://www.youtube.com/watch?v=uyXaE3Z_G6Q', cells: [9, 10] },
            { type: 'image', fileName: 'nurumayu.png', altText: 'Level 37、ぬるま湯と烏。 / Sera。', link: 'https://www.youtube.com/watch?v=me_tPVG_06E', cells: [13, 14] },
            { type: 'image', fileName: 'unravel.png', altText: 'unravel / 音ノ乃のの（cover）', link: 'https://www.youtube.com/watch?v=u5RRk9DZs3M', cells: [15] }
        ]
    },
    
    independentProduction: {
        pathPrefix: 'resources/fan_fiction/',
        items: [
            { type: 'video', fileName: 'sizumu.mp4', altText: '【二次創作】沈沈沈沈沈沈… / Ruliea', link: 'https://www.youtube.com/watch?v=l9WJpH_DePI', cells: [11, 12] },
            { type: 'video', fileName: 'utsutsu.mp4', altText: '【二次創作】うつつと空の放送 / 凍傷のエト', link: 'https://www.youtube.com/watch?v=2PkiTNbfzeU', cells: [4, 5] },
            { type: 'video', fileName: 'tikyuuzinn.mp4', altText: '【二次創作】地球人です / SHOE', link: 'https://www.youtube.com/watch?v=0dwp3auEbOo', cells: [1, 2, 3, 6, 7, 8] },
            { type: 'video', fileName: 'moumoku.mp4', altText: '【二次創作】盲目の怪物 / ひらぎ', link: 'https://www.youtube.com/watch?v=0Pli20EHCBw', cells: [13] },
            { type: 'video', fileName: 'anatanokoto.mp4', altText: '【二次創作】あなたのことをおしえて / キタニタツヤ', link: 'https://youtu.be/C5WNpQ4Qkls?si=wWjJY2PNBH7Cn8aR', cells: [9, 10, 14, 15] }
        ]
    }
};
