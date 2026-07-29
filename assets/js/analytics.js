/*
 * Private analytics dashboards:
 * Counter.dev: https://counter.dev/
 *
 * This file adds no visible page component. Local previews are excluded.
 */
(function loadPrivateAnalytics(){
  const localHosts=new Set(["localhost","127.0.0.1","0.0.0.0"]);
  if(localHosts.has(window.location.hostname))return;

  const counter=document.createElement("script");
  counter.src="https://cdn.counter.dev/script.js";
  counter.dataset.id="b23f4ed4-b8e3-4465-af1d-4859ae141cbb";
  counter.dataset.utcoffset="8";
  counter.async=true;
  document.head.appendChild(counter);
})();
