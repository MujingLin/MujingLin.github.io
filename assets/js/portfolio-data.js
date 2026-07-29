window.MUJING_OS = {
  /*
   * Site-wide visual assets.
   * Keep page-specific files here so the interaction code never needs
   * hard-coded image paths.
   */
  assets: {
    profile: { desktop: "/backgroundimage/profile背景.png", mobile: "/backgroundimage/profile背景-竖屏.png", transition:"/assets/media/transition/profile.jpg" },
    works: { desktop: "/backgroundimage/海洋works横屏.png", mobile: "/backgroundimage/海洋works竖屏.png", transition:"/assets/media/transition/works.jpg" },
    compass: { desktop: "/backgroundimage/compass背景.png", mobile: "/backgroundimage/compass背景-竖屏.png", transition:"/assets/media/transition/compass.jpg" }
  },

  /*
   * Editable bilingual content sources for the three desktop pages.
   * Update content files themselves; these paths only need changing when a
   * file is renamed or moved.
   */
  content: {
    profile: {
      en:"/content/profile.en.md?v=20260729f",
      zh:"/content/profile.zh.md?v=20260729f"
    },
    works: {
      en:"/content/works.en.md?v=20260729f",
      zh:"/content/works.zh.md?v=20260729f"
    },
    compass: {
      en:"/content/compass.en.md?v=20260729f",
      zh:"/content/compass.zh.md?v=20260729f"
    }
  },

  /*
   * Works archive chapters.
   * A media block chooses one of these IDs in its content marker:
   * <!-- media: track=23 chapter=narrative -->
   */
  works: {
    chapters: [
      { id:"aigc", en:"AIGC WORKS", zh:"AIGC 作品" },
      { id:"narrative", en:"NARRATIVE", zh:"叙事作品" },
      { id:"exhibition", en:"EXHIBITION", zh:"展览" },
      { id:"reality", en:"REALITY SHOW", zh:"综艺" },
      { id:"other", en:"OTHER", zh:"其他" }
    ]
  },

  /* Interface copy shared by every page. */
  ui: {
    en: { enter:"Press Enter — the film is about to begin", hello:"Hello, I’m", intro:"I make films where human feeling, playful ideas and intelligent tools meet.", profile:"Profile", works:"Works", compass:"Compass" },
    zh: { enter:"进入放映 ↵", hello:"你好，我是", intro:"林沐菁，影像创作者。关注 AI 影像、叙事与创作工具。", profile:"关于我", works:"作品", compass:"心之罗盘" }
  }
};
