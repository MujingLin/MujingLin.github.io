(function(){
  const config=window.MUJING_OS;
  const LANGUAGE_KEY="mujing-session-language";
  let lang=sessionStorage.getItem(LANGUAGE_KEY)||"en";
  const body=document.body;
  const page=body.dataset.page;
  const t=()=>config.ui[lang];
  let transitionEffect=null;
  let typingTimer=null;

  /* ---------- Language ---------- */

  function setLanguage(){
    document.documentElement.lang=lang==="zh"?"zh-CN":"en";
    document.querySelectorAll("[data-en]").forEach(el=>{el.textContent=el.dataset[lang]||el.dataset.en});
    document.querySelectorAll("[data-lang-toggle]").forEach(button=>{
      button.dataset.activeLanguage=lang;
      button.setAttribute("aria-label",lang==="en"?"Switch language to Chinese":"切换语言为英文");
      button.querySelectorAll("[data-lang-option]").forEach(option=>{
        const active=option.dataset.langOption===lang;
        option.classList.toggle("active",active);
        option.setAttribute("aria-current",active?"true":"false");
      });
    });
    sessionStorage.setItem(LANGUAGE_KEY,lang);
  }

  function transitionTo(url){
    if(body.classList.contains("transitioning"))return;
    body.classList.add("transitioning");
    const reduced=window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    const overlay=document.querySelector("#tide-transition");
    const webgl=document.querySelector("#webgl-transition");
    const targetKey=url.includes("/work/")?"works":url.includes("/compass/")?"compass":url.includes("/profile/")?"profile":null;
    if(targetKey&&window.hoverEffect&&!reduced&&webgl){
      webgl.innerHTML="";webgl.classList.add("active");
      try{
        const sourceKey=page==="home"?"works":page;
        transitionEffect=new window.hoverEffect({parent:webgl,intensity:.24,image1:config.assets[sourceKey].transition,image2:config.assets[targetKey].transition,displacementImage:"/assets/vendor/hover-effect/fluid.jpg",imagesRatio:1080/1920,speedIn:.8,speedOut:.8,hover:false});
        window.setTimeout(()=>transitionEffect.next(),40);
      }catch(error){overlay.classList.add("active")}
    }else overlay.classList.add("active");
    window.setTimeout(()=>location.href=url,reduced?30:840);
  }

  function bindLanguage(){
    document.querySelectorAll("[data-lang-toggle]").forEach(button=>button.addEventListener("click",async()=>{
      lang=lang==="en"?"zh":"en";setLanguage();if(page!=="home")await loadContent();else startTyping();
    }));
  }

  /* ---------- Landing and page transitions ---------- */

  function startTyping(){
    const el=document.querySelector("#typingText");if(!el)return;
    window.clearTimeout(typingTimer);
    const words=(el.dataset["typing"+(lang==="zh"?"Zh":"En")]||el.dataset[lang]||"").split("|");
    let wordIndex=0,charIndex=0,deleting=false;
    const type=()=>{
      const chars=Array.from(words[wordIndex]);
      charIndex+=deleting?-1:1;el.textContent=chars.slice(0,charIndex).join("");
      if(!deleting&&charIndex>=chars.length){typingTimer=window.setTimeout(()=>{deleting=true;type()},1800);return}
      if(deleting&&charIndex<=0){deleting=false;wordIndex=(wordIndex+1)%words.length;typingTimer=window.setTimeout(type,420);return}
      typingTimer=window.setTimeout(type,deleting?42:78);
    };
    el.textContent="";typingTimer=window.setTimeout(type,450);
  }

  function landing(){
    document.documentElement.lang="en";
    lang="en";
    sessionStorage.setItem(LANGUAGE_KEY,"en");
    const overlay=document.querySelector("#terminal-overlay");
    const terminalScreen=document.querySelector("#landing-screen");
    const heroVideo=document.querySelector(".hero-video");
    let launching=false;

    if(heroVideo){
      const revealVideo=()=>body.classList.add("video-ready");
      if(heroVideo.readyState>=2)revealVideo();
      else heroVideo.addEventListener("loadeddata",revealVideo,{once:true});
      heroVideo.addEventListener("error",()=>body.classList.add("video-unavailable"),{once:true});
      heroVideo.play().catch(()=>{});
    }

    const openTerminal=()=>{
      if(body.classList.contains("terminal-open"))return;
      body.classList.add("terminal-open");
      overlay.setAttribute("aria-hidden","false");
      startTyping();
      window.setTimeout(()=>terminalScreen.focus(),420);
    };

    const closeTerminal=()=>{
      if(launching)return;
      body.classList.remove("terminal-open");
      overlay.setAttribute("aria-hidden","true");
    };

    const launch=()=>{
      if(launching)return;launching=true;body.classList.add("loading");
      const percent=document.querySelector("#launch-percent"),state=document.querySelector(".launch-state");state.textContent="LAUNCHING...";
      const started=performance.now(),duration=680;
      const tick=now=>{const value=Math.min(100,Math.round((now-started)/duration*100));percent.textContent=`${value}%`;if(value<100)requestAnimationFrame(tick);else window.setTimeout(()=>transitionTo("/profile/?v=20260730a"),100)};
      requestAnimationFrame(tick);
    };

    document.querySelectorAll("[data-open-terminal]").forEach(button=>button.addEventListener("click",openTerminal));
    document.querySelectorAll("[data-close-terminal]").forEach(button=>button.addEventListener("click",closeTerminal));
    terminalScreen.addEventListener("click",launch);
    document.addEventListener("keydown",event=>{
      if(event.key==="Escape"){closeTerminal();return}
      if(event.key==="Enter"&&body.classList.contains("terminal-open"))launch();
      else if(event.key==="Enter"&&event.target===body)openTerminal();
    });

    if(!window.matchMedia("(prefers-reduced-motion:reduce)").matches){
      window.addEventListener("pointermove",event=>{
        const x=(event.clientX/window.innerWidth-.5);
        const y=(event.clientY/window.innerHeight-.5);
        body.style.setProperty("--scene-x",`${(-x*12).toFixed(2)}px`);
        body.style.setProperty("--scene-y",`${(-y*8).toFixed(2)}px`);
      },{passive:true});
    }
  }

  /* ---------- Desktop window controls ---------- */

  function bindWindow(){
    const win=document.querySelector(".window");
    document.querySelectorAll("[data-window-action]").forEach(button=>button.addEventListener("click",()=>{
      const action=button.dataset.windowAction;
      if(action==="close")closeWindow(win);
      if(action==="minimize")win.classList.add("minimized");
      if(action==="zoom")win.classList.toggle("maximized");
    }));
  }

  function closeWindow(win){
    if(win.dataset.closed==="true")return;
    const dock=document.querySelector('.dock a[aria-current="page"]');
    const wr=win.getBoundingClientRect(),dr=dock.getBoundingClientRect();
    const x=dr.left+dr.width/2-(wr.left+wr.width/2),y=dr.top+dr.height/2-(wr.top+wr.height/2);
    win.dataset.closed="true";
    document.querySelector(".desktop-hint")?.classList.add("visible");
    if(window.anime&&!window.matchMedia("(prefers-reduced-motion:reduce)").matches){
      window.anime.animate(win,{x,y,scale:.055,opacity:0,rotate:1.5,duration:560,ease:"inBack",onComplete:()=>win.classList.add("closed")});
    }else win.classList.add("closed");
  }

  function reopenWindow(win){
    win.classList.remove("closed","minimized");
    document.querySelector(".desktop-hint")?.classList.remove("visible");
    win.dataset.closed="false";
    if(window.anime&&!window.matchMedia("(prefers-reduced-motion:reduce)").matches){
      window.anime.animate(win,{x:0,y:0,scale:1,opacity:1,rotate:0,ease:window.anime.spring({bounce:.28,duration:620})});
    }else win.style.cssText="";
  }

  /* ---------- Content presentation ---------- */

  function structureWorks(target){
    if(page!=="works")return;
    const children=[...target.childNodes];
    let reel=null;
    let pendingMeta=null;

    children.forEach(node=>{
      if(node.nodeType===1&&node.classList.contains("media-meta")){
        pendingMeta={
          track:Number(node.dataset.track),
          chapter:node.dataset.chapter
        };
        node.remove();
      }else if(node.nodeType===1&&node.tagName==="H2"&&pendingMeta){
        reel=document.createElement("section");
        reel.className="media-track";
        reel.dataset.track=String(pendingMeta.track);
        reel.dataset.chapter=pendingMeta.chapter;

        const marker=document.createElement("div");
        marker.className="track-marker";
        marker.textContent=`TRACK ${String(pendingMeta.track).padStart(2,"0")}`;

        target.insertBefore(reel,node);
        reel.append(marker,node);
        pendingMeta=null;
      }else if(reel)reel.append(node);
    });

    const tracks=[...target.querySelectorAll(".media-track")];
    config.works.chapters.forEach((chapter,chapterIndex)=>{
      const chapterTracks=tracks.filter(track=>track.dataset.chapter===chapter.id);
      if(!chapterTracks.length)return;

      const section=document.createElement("section");
      section.className="works-chapter";
      section.dataset.chapter=chapter.id;

      const heading=document.createElement("header");
      heading.className="chapter-heading";
      heading.innerHTML=`<span>CHAPTER ${String(chapterIndex+1).padStart(2,"0")}</span><h2>${chapter[lang]}</h2>`;
      section.appendChild(heading);
      chapterTracks.forEach(track=>section.appendChild(track));
      target.appendChild(section);
    });

    tracks.forEach(track=>{if(!track.closest(".works-chapter"))track.remove()});
  }

  function structureProfile(target){
    if(page!=="profile")return;
    const photo=target.querySelector('img[src*="mujing"]');if(!photo)return;
    const frame=document.createElement("figure");frame.className="star-polaroid";
    photo.parentNode.insertBefore(frame,photo);frame.appendChild(photo);
    for(let index=0;index<14;index++){const star=document.createElement("span");star.className="polaroid-star";star.setAttribute("aria-hidden","true");frame.appendChild(star)}
  }

  function drawCompassLines(stage){
    const svg=stage?.querySelector(".map-lines"),cards=[...(stage?.querySelectorAll(".map-node")||[])];if(!svg||cards.length<2)return;
    const sr=stage.getBoundingClientRect();svg.setAttribute("viewBox",`0 0 ${sr.width} ${stage.scrollHeight}`);svg.innerHTML="";
    cards.slice(0,-1).forEach((card,index)=>{
      const a=card.getBoundingClientRect(),b=cards[index+1].getBoundingClientRect();
      const x1=a.left+a.width/2-sr.left,y1=a.bottom-sr.top,x2=b.left+b.width/2-sr.left,y2=b.top-sr.top;
      const path=document.createElementNS("http://www.w3.org/2000/svg","path");
      path.setAttribute("d",`M ${x1} ${y1} C ${x1} ${y1+52}, ${x2} ${y2-52}, ${x2} ${y2}`);svg.appendChild(path);
    });
  }

  function structureCompass(target){
    if(page!=="compass")return;
    const children=[...target.childNodes];let stage=null,node=null,index=0;
    children.forEach(child=>{
      if(child.nodeType===1&&child.tagName==="H2"){
        if(!stage){stage=document.createElement("div");stage.className="exploration-map";stage.innerHTML='<div class="map-label">PERSONAL EXPLORATION MAP</div><svg class="map-lines" aria-hidden="true"></svg>';target.insertBefore(stage,child)}
        index+=1;node=document.createElement("section");node.className="map-node";node.style.setProperty("--i",index);stage.appendChild(node);node.appendChild(child);
        const cat=document.createElement("img");cat.className="map-cat";cat.src="/backgroundimage/heartcat.png";cat.alt="";node.appendChild(cat);
      }else if(node)node.insertBefore(child,node.querySelector(".map-cat"));
    });
    if(stage){bindMapDrag(stage);requestAnimationFrame(()=>requestAnimationFrame(()=>drawCompassLines(stage)));window.setTimeout(()=>drawCompassLines(stage),500)}
  }

  function bindMapDrag(stage){
    const precisePointer=window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if(!precisePointer){
      stage.classList.add("touch-scroll-mode");
      stage.querySelectorAll(".map-node").forEach(card=>{card.style.removeProperty("left");card.style.removeProperty("top")});
      return;
    }
    stage.querySelectorAll(".map-node").forEach(card=>{
      let startX=0,startY=0,baseLeft=0,baseTop=0;
      card.addEventListener("pointerdown",event=>{
        if(event.button!==0)return;event.preventDefault();card.setPointerCapture(event.pointerId);card.classList.add("dragging");
        startX=event.clientX;startY=event.clientY;baseLeft=parseFloat(card.style.left)||0;baseTop=parseFloat(card.style.top)||0;
      });
      card.addEventListener("pointermove",event=>{
        if(!card.hasPointerCapture(event.pointerId))return;
        card.style.left=`${baseLeft+event.clientX-startX}px`;card.style.top=`${baseTop+event.clientY-startY}px`;drawCompassLines(stage);
      });
      const release=event=>{if(card.hasPointerCapture(event.pointerId))card.releasePointerCapture(event.pointerId);card.classList.remove("dragging");drawCompassLines(stage)};
      card.addEventListener("pointerup",release);card.addEventListener("pointercancel",release);
    });
  }

  function markdown(source){
    source=source
      .replace(/^---[\s\S]*?---\s*/,"")
      .replace(
        /^\[youtube:\s*([^\]\s]+)\s*\]$/gmi,
        (_,rawId)=>{
          const videoId=rawId.split(/[?&]/)[0];
          return `<button class="video-cover" type="button" data-youtube="${videoId}" aria-label="Play video on this page"><img src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="" loading="lazy"><span class="youtube-play" aria-hidden="true"><b>▶</b><small>YouTube</small></span></button>`;
        }
      )
      .replace(
        /<!--\s*media:\s*track=(\d+)\s+chapter=([a-z-]+)\s*-->/gi,
        '<span class="media-meta" data-track="$1" data-chapter="$2" hidden></span>'
      )
      .replace(/<!--[\s\S]*?-->/g,"");
    const lines=source.split(/\r?\n/),out=[];let paragraph=[],list=false;
    const inline=value=>value
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(m,a,s)=>`<img src="${s.replace(/^\.\/images\//,"/images/")}" alt="${a}" loading="lazy">`)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
    const flush=()=>{if(paragraph.length){out.push(`<p>${inline(paragraph.join(" "))}</p>`);paragraph=[]}if(list){out.push("</ul>");list=false}};
    for(let i=0;i<lines.length;i++){
      const raw=lines[i],line=raw.trim();
      if(!line){flush();continue}
      if(/^<[^>]+/.test(line)||line.startsWith("src=")||line==="</iframe>"){flush();out.push(raw);continue}
      if(line.startsWith("### ")){flush();out.push(`<h3>${inline(line.slice(4))}</h3>`);continue}
      if(line.startsWith("## ")){flush();out.push(`<h2>${inline(line.slice(3))}</h2>`);continue}
      if(line.startsWith("# ")){flush();out.push(`<h1>${inline(line.slice(2))}</h1>`);continue}
      if(line.startsWith("> ")){flush();out.push(`<p class="update">${inline(line.slice(2))}</p>`);continue}
      if(line.startsWith("- ")){if(paragraph.length)flush();if(!list){out.push("<ul>");list=true}out.push(`<li>${inline(line.slice(2))}</li>`);continue}
      if(line==="---"){flush();out.push("<hr>");continue}
      paragraph.push(line);
    }
    flush();return out.join("\n");
  }

  /* ---------- Page boot ---------- */

  async function loadContent(){
    const target=document.querySelector("#document-content");if(!target)return;
    target.classList.add("changing");
    const source=config.content?.[page]?.[lang]||target.dataset[lang+"Source"];
    try{const response=await fetch(source,{cache:"no-store"});const text=await response.text();target.innerHTML=markdown(text);}
    catch(error){target.innerHTML="<p>Content could not be loaded.</p>"}
    structureProfile(target);structureWorks(target);structureCompass(target);
    const configureFrame=(frame,videoId)=>{
      frame.setAttribute("allowfullscreen","");
      frame.setAttribute("loading","lazy");
      frame.setAttribute("referrerpolicy","strict-origin-when-cross-origin");
      frame.setAttribute("allow","accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      frame.setAttribute("title",frame.previousElementSibling?.textContent||"Mujing Lin film");
      if(!videoId){
        const match=frame.src.match(/embed\/([^?]+)/);
        videoId=match?.[1];
      }
      return videoId;
    };
    target.querySelectorAll("[data-youtube]").forEach(cover=>{
      const videoId=cover.dataset.youtube;
      const shell=document.createElement("div");shell.className="player-shell";
      cover.parentNode.insertBefore(shell,cover);shell.appendChild(cover);
      const fallback=document.createElement("p");fallback.className="video-fallback";
      fallback.innerHTML=`<a href="https://youtu.be/${videoId}" target="_blank" rel="noopener">${lang==="zh"?"若播放器无法载入，可前往 YouTube 观看 ↗":"Player unavailable? Watch directly on YouTube ↗"}</a>`;
      shell.insertAdjacentElement("afterend",fallback);
      cover.addEventListener("click",()=>{
        const frame=document.createElement("iframe");
        frame.src=`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        configureFrame(frame,videoId);
        cover.replaceWith(frame);
      },{once:true});
    });
    target.querySelectorAll("iframe").forEach(frame=>configureFrame(frame));
    requestAnimationFrame(()=>target.classList.remove("changing"));
  }

  async function desktop(){
    const art=config.assets[page];
    document.documentElement.style.setProperty("--desktop-art",`url('${art.desktop}')`);
    document.documentElement.style.setProperty("--mobile-art",`url('${art.mobile}')`);
    config.assets.profile.transition&&Object.values(config.assets).forEach(asset=>{const preload=new Image();preload.src=asset.transition});
    setLanguage();bindLanguage();bindWindow();
    document.querySelectorAll("[data-route]").forEach(link=>link.addEventListener("click",event=>{event.preventDefault();const win=document.querySelector(".window");if(link.getAttribute("aria-current")==="page"&&(win.classList.contains("minimized")||win.dataset.closed==="true")){reopenWindow(win);return}transitionTo(link.href)}));
    const clock=document.querySelector("#clock");const tick=()=>clock.textContent=new Intl.DateTimeFormat(lang==="zh"?"zh-CN":"en",{weekday:"short",hour:"2-digit",minute:"2-digit"}).format(new Date());tick();setInterval(tick,30000);
    try{await loadContent()}finally{body.classList.add("ready")}
  }

  if(page==="home")landing();else desktop();
})();
