/* PEPZ animated Grainient background — shared across all pages.
   Renders into #grainientCanvas; toggled by the footer #particlesToggle.
   Extracted from the homepage so every page shows the same live gradient. */
(function () {
  "use strict";

  var canvas = document.getElementById("grainientCanvas");
  if (!canvas) return;

  var gl = canvas.getContext("webgl2", {
    alpha: false, antialias: false, depth: false, stencil: false,
    powerPreference: "low-power"
  });
  if (!gl) { canvas.style.display = "none"; return; }

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isCoarse = window.matchMedia &&
    window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ---------- shaders (verbatim from the React Bits component) ---------- */
  var VERT = "#version 300 es\n" +
    "void main() {\n" +
    "  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\n" +
    "  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\n" +
    "}\n";

  var FRAG = "#version 300 es\n" +
"precision highp float;\n" +
"uniform vec2 iResolution;\n" +
"uniform float iTime;\n" +
"uniform float uTimeSpeed;\n" +
"uniform float uColorBalance;\n" +
"uniform float uWarpStrength;\n" +
"uniform float uWarpFrequency;\n" +
"uniform float uWarpSpeed;\n" +
"uniform float uWarpAmplitude;\n" +
"uniform float uBlendAngle;\n" +
"uniform float uBlendSoftness;\n" +
"uniform float uRotationAmount;\n" +
"uniform float uNoiseScale;\n" +
"uniform float uGrainAmount;\n" +
"uniform float uGrainScale;\n" +
"uniform float uGrainAnimated;\n" +
"uniform float uContrast;\n" +
"uniform float uGamma;\n" +
"uniform float uSaturation;\n" +
"uniform vec2 uCenterOffset;\n" +
"uniform float uZoom;\n" +
"uniform vec3 uColor1;\n" +
"uniform vec3 uColor2;\n" +
"uniform vec3 uColor3;\n" +
"out vec4 fragColor;\n" +
"#define S(a,b,t) smoothstep(a,b,t)\n" +
"mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}\n" +
"vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}\n" +
"float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}\n" +
"void mainImage(out vec4 o, vec2 C){\n" +
"  float t=iTime*uTimeSpeed;\n" +
"  vec2 uv=C/iResolution.xy;\n" +
"  float ratio=iResolution.x/iResolution.y;\n" +
"  vec2 tuv=uv-0.5+uCenterOffset;\n" +
"  tuv/=max(uZoom,0.001);\n" +
"  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);\n" +
"  tuv.y*=1.0/ratio;\n" +
"  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));\n" +
"  tuv.y*=ratio;\n" +
"  float frequency=uWarpFrequency;\n" +
"  float ws=max(uWarpStrength,0.001);\n" +
"  float amplitude=uWarpAmplitude/ws;\n" +
"  float warpTime=t*uWarpSpeed;\n" +
"  tuv.x+=sin(tuv.y*frequency+warpTime)/amplitude;\n" +
"  tuv.y+=sin(tuv.x*(frequency*1.5)+warpTime)/(amplitude*0.5);\n" +
"  vec3 colLav=uColor1;\n" +
"  vec3 colOrg=uColor2;\n" +
"  vec3 colDark=uColor3;\n" +
"  float b=uColorBalance;\n" +
"  float s=max(uBlendSoftness,0.0);\n" +
"  mat2 blendRot=Rot(radians(uBlendAngle));\n" +
"  float blendX=(tuv*blendRot).x;\n" +
"  float edge0=-0.3-b-s;\n" +
"  float edge1=0.2-b+s;\n" +
"  float v0=0.5-b+s;\n" +
"  float v1=-0.3-b-s;\n" +
"  vec3 layer1=mix(colDark,colOrg,S(edge0,edge1,blendX));\n" +
"  vec3 layer2=mix(colOrg,colLav,S(edge0,edge1,blendX));\n" +
"  vec3 col=mix(layer1,layer2,S(v0,v1,tuv.y));\n" +
"  vec2 grainUv=uv*max(uGrainScale,0.001);\n" +
"  if(uGrainAnimated>0.5){grainUv+=vec2(iTime*0.05);}\n" +
"  float grain=fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453);\n" +
"  col+=(grain-0.5)*uGrainAmount;\n" +
"  col=(col-0.5)*uContrast+0.5;\n" +
"  float luma=dot(col,vec3(0.2126,0.7152,0.0722));\n" +
"  col=mix(vec3(luma),col,uSaturation);\n" +
"  col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));\n" +
"  col=clamp(col,0.0,1.0);\n" +
"  o=vec4(col,1.0);\n" +
"}\n" +
"void main(){\n" +
"  vec4 o=vec4(0.0);\n" +
"  mainImage(o,gl_FragCoord.xy);\n" +
"  fragColor=o;\n" +
"}\n";

  function compile(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      // Shader failure is non-fatal for the page: just hide the layer.
      console.warn("Grainient shader error:", gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }

  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { canvas.style.display = "none"; return; }

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn("Grainient link error:", gl.getProgramInfoLog(prog));
    canvas.style.display = "none";
    return;
  }
  gl.useProgram(prog);

  var U = {};
  ["iResolution","iTime","uTimeSpeed","uColorBalance","uWarpStrength",
   "uWarpFrequency","uWarpSpeed","uWarpAmplitude","uBlendAngle",
   "uBlendSoftness","uRotationAmount","uNoiseScale","uGrainAmount",
   "uGrainScale","uGrainAnimated","uContrast","uGamma","uSaturation",
   "uCenterOffset","uZoom","uColor1","uColor2","uColor3"
  ].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

  /* ---------- settings (client's tuned values, see design screenshot) ---------- */
  gl.uniform1f(U.uTimeSpeed,      0.25);
  gl.uniform1f(U.uColorBalance,   0.0);
  gl.uniform1f(U.uWarpStrength,   0.25);
  gl.uniform1f(U.uWarpFrequency,  5.0);
  gl.uniform1f(U.uWarpSpeed,      2.8);
  gl.uniform1f(U.uWarpAmplitude,  5.0);
  gl.uniform1f(U.uBlendAngle,     -97.0);
  gl.uniform1f(U.uBlendSoftness,  0.22);
  gl.uniform1f(U.uRotationAmount, 330.0);
  gl.uniform1f(U.uNoiseScale,     1.5);
  gl.uniform1f(U.uGrainAmount,    0.06);
  gl.uniform1f(U.uGrainScale,     1.5);
  gl.uniform1f(U.uGrainAnimated,  1.0);
  gl.uniform1f(U.uContrast,       1.5);
  gl.uniform1f(U.uGamma,          1.0);
  gl.uniform1f(U.uSaturation,     1.0);
  gl.uniform2f(U.uCenterOffset,   0.09, 0.25);
  gl.uniform1f(U.uZoom,           0.6);

  function hexToRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return [1, 1, 1];
    return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
  }

  /* Palettes keyed to each theme's --brand accent: him hues sit around the
     teal-cyan #2fb8c7, her around the coral pink #f2607a (flipped light,
     because html.theme-her turns the whole site's --bg/--fg light — a dark
     backdrop would break black body text in every transparent section). */
  var PALETTES = {
    him: { c1: "#5ed3e4", c2: "#020f14", c3: "#2c626c" },
    her: { c1: "#ff8fa0", c2: "#fff1ee", c3: "#f0879a" }
  };

  function applyPalette(isHer) {
    var p = isHer ? PALETTES.her : PALETTES.him;
    gl.uniform3fv(U.uColor1, hexToRgb(p.c1));
    gl.uniform3fv(U.uColor2, hexToRgb(p.c2));
    gl.uniform3fv(U.uColor3, hexToRgb(p.c3));
    // her palette is light, so soften contrast a touch to avoid blowing
    // the pale tones out to pure white
    gl.uniform1f(U.uContrast, isHer ? 1.15 : 1.5);
    if (rafId === null) drawFrame(elapsed); // repaint while paused
  }

  /* ---------- sizing ---------- */
  // DPR capped low on purpose: the gradient is smooth by nature and the
  // grain reads fine at lower density — this is a background, not artwork
  // you inspect up close. Coarse-pointer (mobile) renders at 1x.
  var DPR = Math.min(window.devicePixelRatio || 1, isCoarse ? 1 : 1.5);
  function resize() {
    var w = Math.max(1, Math.floor(window.innerWidth * DPR));
    var h = Math.max(1, Math.floor(window.innerHeight * DPR));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(U.iResolution, w, h);
    if (rafId === null) drawFrame(elapsed);
  }
  window.addEventListener("resize", resize);

  /* ---------- render loop with pause/resume ---------- */
  var rafId = null;
  var elapsed = 0;       // seconds of animation shown so far
  var lastTick = 0;

  function drawFrame(tSec) {
    gl.uniform1f(U.iTime, tSec);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    if (lastTick) elapsed += Math.min((now - lastTick) * 0.001, 0.1);
    lastTick = now;
    drawFrame(elapsed);
  }

  /* run-state flags — the loop runs only when ALL of these allow it */
  var userDisabledBg = false;
  try { userDisabledBg = localStorage.getItem("pepzBgParticlesOff") === "1"; } catch (e) {}

  function syncRunState() {
    var shouldRun = !userDisabledBg && !document.hidden && !reduceMotion;
    if (shouldRun && rafId === null) {
      canvas.classList.remove("hidden");
      lastTick = 0;
      rafId = requestAnimationFrame(frame);
    } else if (!shouldRun && rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
      // hide only for the explicit off-switch; other pauses (tab hidden,
      // molecules section covering it) just freeze the current frame
      canvas.classList.toggle("hidden", userDisabledBg);
    } else {
      canvas.classList.toggle("hidden", userDisabledBg);
    }
  }

  document.addEventListener("visibilitychange", syncRunState);

  /* (No pause while Explore the Molecules is in view anymore: that section
     is frosted glass now, so this layer must keep animating behind it.) */

  /* Footer "Animated background" switch (same persisted key as the old
     particle layer, so an existing visitor preference carries over). */
  var particlesToggle = document.getElementById("particlesToggle");
  if (particlesToggle) {
    particlesToggle.checked = !userDisabledBg;
    particlesToggle.addEventListener("change", function () {
      userDisabledBg = !particlesToggle.checked;
      try { localStorage.setItem("pepzBgParticlesOff", userDisabledBg ? "1" : "0"); } catch (e) {}
      syncRunState();
    });
  }

  /* Same hook name the old particle layer exposed — setGender() calls it. */
  window.__pepzApplyBgParticleTheme = applyPalette;

  /* Repaint whenever the Him/Her theme flips — watches the <html> class so
     every page's gradient re-tints on toggle, without each page's setGender
     needing to call us explicitly. */
  new MutationObserver(function () {
    applyPalette(document.documentElement.classList.contains("theme-her"));
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  /* ---------- boot ---------- */
  applyPalette(document.documentElement.classList.contains("theme-her"));
  resize();
  drawFrame(0);   // static first frame (this is all reduced-motion ever shows)
  syncRunState();
})();
