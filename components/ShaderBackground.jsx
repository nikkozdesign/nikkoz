"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import * as THREE from "three";
import { useShaderPalette } from "../context/ShaderPaletteContext";

function makeSeamlessNoiseTexture(size = 256, scale = 6, octaves = 4) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d");
  const img = ctx.createImageData(size, size);
  const smooth = (t) => t * t * (3 - 2 * t);
  const makeGrid = (g) => {
    const a = new Float32Array(g * g);
    for (let i = 0; i < a.length; i++) a[i] = Math.random();
    return a;
  };
  const sample = (x, y, g, grid) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const x0 = ((xi % g) + g) % g, y0 = ((yi % g) + g) % g;
    const x1 = (x0 + 1) % g, y1 = (y0 + 1) % g;
    const a = grid[y0 * g + x0], b = grid[y0 * g + x1];
    const c = grid[y1 * g + x0], d = grid[y1 * g + x1];
    const u = smooth(xf), v = smooth(yf);
    return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
  };
  const grids = [];
  for (let o = 0; o < octaves; o++) grids.push(makeGrid(scale * (1 << o)));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let n = 0, amp = 0.5, sum = 0;
      for (let o = 0; o < octaves; o++) {
        const g = scale * (1 << o);
        n += sample((x / size) * g, (y / size) * g, g, grids[o]) * amp;
        sum += amp; amp *= 0.5;
      }
      n /= sum;
      const v = Math.floor(n * 255);
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.minFilter = t.magFilter = THREE.LinearFilter;
  return t;
}

const KERNEL_PRESETS = [
  [0, 0],
  [0, 1, 1],
  [0, 1, 2, 2, 3],
  [0, 1, 2, 3, 4, 4, 5],
  [0, 1, 2, 3, 4, 4, 5, 7, 8],
  [0, 1, 2, 3, 4, 5, 7, 8, 9, 10],
];

export default function ShaderBackground({ embed = false, debug = false }) {
  const router = useRouter();
  const [routing, setRouting] = useState(false);

  useEffect(() => {
    if (embed) return;
    const onStart = () => setRouting(true);
    const onDone = () => setRouting(false);
    router.events.on("routeChangeStart", onStart);
    router.events.on("routeChangeComplete", onDone);
    router.events.on("routeChangeError", onDone);
    return () => {
      router.events.off("routeChangeStart", onStart);
      router.events.off("routeChangeComplete", onDone);
      router.events.off("routeChangeError", onDone);
    };
  }, [router, embed]);
  const canvasRef = useRef(null);
  const handlesRef = useRef(null);
  const [showUi, setShowUi] = useState(true);
  const { palette } = useShaderPalette();

  const [ui, setUi] = useState({
    size: 0.14,
    speed: 0.0003,
    offsetX: 0.9,
    offsetY: -0.48,
    colorMixer: 0,
    color1: "#06070F",
    color2: "#000000",
    color3: "#005735",
    color4: "#1BBB93",
    blurRes: 0.55,
    blurScale: 0.8,
    blurKernel: 2,
    dispStr: 2,
    cursorCol: 1.5,
    grainInt: 0.75,
    grainMag: 0.06,
    grainCol: "#c8b8ff",
    grainBlend: 2,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const fsCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const fsGeom = new THREE.PlaneGeometry(2, 2);
    const fsScene = new THREE.Scene();
    const fsMesh = new THREE.Mesh(fsGeom, new THREE.MeshBasicMaterial());
    fsScene.add(fsMesh);

    const blit = (material, rt) => {
      fsMesh.material = material;
      renderer.setRenderTarget(rt || null);
      renderer.render(fsScene, fsCamera);
    };

    const SIM_W = Math.max(8, Math.floor(window.innerWidth / 40));
    const SIM_H = Math.max(8, Math.floor(window.innerHeight / 40));

    const makeRT = (w, h) =>
      new THREE.WebGLRenderTarget(w, h, {
        type: THREE.HalfFloatType,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        format: THREE.RGBAFormat,
        depthBuffer: false,
        stencilBuffer: false,
      });

    let simA = makeRT(SIM_W, SIM_H);
    let simB = makeRT(SIM_W, SIM_H);

    const mouseUv = new THREE.Vector2(0.5, 0.5);
    const prevMouseUv = new THREE.Vector2(0.5, 0.5);
    const uMouseFactor = { value: 0 };

    const simMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tPosition;
        uniform vec2 resolution;
        uniform vec2 uMouse;
        uniform vec2 uPrevMouse;
        uniform float uDelta;
        uniform float uMouseFactor;

        float distanceToSegment(vec2 p, vec2 s, vec2 e) {
          vec2 v = e - s;
          vec2 w = p - s;
          float l = length(v);
          vec2 dir = v / l;
          float proj = clamp(dot(w, dir), 0.0, l);
          return length(p - (s + dir * proj));
        }

        void main() {
          vec2 uv = vUv;
          vec4 data = texture2D(tPosition, uv);

          data.r = mix(data.r, .5, uDelta * .002);
          data.g = mix(data.g, .5, uDelta * .002);
          data.b = mix(data.b, 0.,  uDelta * .001);

          float dist = distance(uMouse, uPrevMouse);
          dist *= 1. - step(.2, dist);
          vec2 direction = normalize(uMouse - uPrevMouse + 1e-5);

          float distanceToLine = distanceToSegment(uv, uPrevMouse, uMouse);
          float lineInfluence = clamp(1. - smoothstep(0., .2, distanceToLine), 0., 1.);
          lineInfluence = pow(lineInfluence, .5);

          float influence = lineInfluence * dist * uMouseFactor;
          data.r += direction.x * 2. * influence;
          data.g += direction.y * 2. * influence;
          data.b += influence;

          data.rgb = clamp(data.rgb, 0., 1.);
          gl_FragColor = data;
        }
      `,
      uniforms: {
        tPosition: { value: simA.texture },
        resolution: { value: new THREE.Vector2(SIM_W, SIM_H) },
        uMouse: { value: mouseUv },
        uPrevMouse: { value: prevMouseUv },
        uDelta: { value: 16.6 },
        uMouseFactor,
      },
    });

    const seedMat = new THREE.ShaderMaterial({
      vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
      fragmentShader: `void main() { gl_FragColor = vec4(.5, .5, 0., 1.); }`,
    });
    blit(seedMat, simA);
    blit(seedMat, simB);
    seedMat.dispose();

    const stepSim = (dtMs) => {
      simMat.uniforms.tPosition.value = simA.texture;
      simMat.uniforms.uDelta.value = dtMs;
      blit(simMat, simB);
      const t = simA;
      simA = simB;
      simB = t;
    };

    let mfTo;
    const onPointerMove = (e) => {
      prevMouseUv.copy(mouseUv);
      mouseUv.x = e.clientX / window.innerWidth;
      mouseUv.y = 1 - e.clientY / window.innerHeight;
      uMouseFactor.value = 1;
      clearTimeout(mfTo);
      mfTo = setTimeout(() => (uMouseFactor.value = 0), 100);
    };
    window.addEventListener("pointermove", onPointerMove);

    const noiseTex = makeSeamlessNoiseTexture(256, 6, 4);

    const gradUniforms = {
      uTime: { value: 0 },
      uSize: { value: 0.14 },
      uOffset: { value: new THREE.Vector2(0.9, -0.48) },
      uSpeed: { value: 0.0003 },
      uColor1: { value: new THREE.Color("#06070F") },
      uColor2: { value: new THREE.Color("#000000") },
      uColor3: { value: new THREE.Color("#005735") },
      uColor4: { value: new THREE.Color("#1BBB93") },
      uNoiseTexture: { value: noiseTex },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uColorMixer: { value: 0 },
      uMenuMode: { value: 0 },
      uAdditionalZoom: { value: 0 },
      uAdditionalOffset: { value: new THREE.Vector2(0, 0) },
      uScrollOffset: { value: 0 },
    };

    const gradMat = new THREE.ShaderMaterial({
      uniforms: gradUniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform vec3 uColor1, uColor2, uColor3, uColor4;
        uniform float uSize, uSpeed, uColorMixer, uMenuMode, uAdditionalZoom, uScrollOffset;
        uniform vec2 uOffset, uAdditionalOffset, uResolution;
        uniform sampler2D uNoiseTexture;

        void main() {
          vec2 nUv = (-.5 + vUv) * 2.;
          if (uResolution.x < uResolution.y) nUv.x *= uResolution.x / uResolution.y;
          else                               nUv.y *= uResolution.y / uResolution.x;
          nUv = nUv / 2. + .5;

          float additionalZoom = uAdditionalZoom * (1. - uMenuMode);
          vec2 offset = uOffset + uAdditionalOffset * (1. - uMenuMode);
          offset.y -= uScrollOffset;

          vec2 bUv = nUv * (uSize * 2. + additionalZoom) + offset * uMenuMode;
          vec2 nUv1 = bUv + offset * (1. - uMenuMode) + uTime * uSpeed;
          bUv.y -= .5;
          vec2 nUv2 = bUv + offset * (1. - uMenuMode) - uTime * uSpeed;

          float n1 = texture2D(uNoiseTexture, nUv1).r;
          float n2 = texture2D(uNoiseTexture, nUv2).r;
          float noise = clamp((n1 + n2) / 2., 0., 1.);
          vec2 nUv3 = bUv + noise * .5;
          noise = texture2D(uNoiseTexture, nUv3).r;

          vec3 color = vec3(0.);
          noise = mix(noise, noise * 1.25 + .15, uMenuMode);
          if (noise < 0.25)      color = mix(uColor1, uColor2, noise / 0.25);
          else if (noise < 0.5)  color = mix(uColor2, uColor3, (noise - 0.25) / 0.25);
          else if (noise < 0.75) color = mix(uColor3, uColor4, (noise - 0.5)  / 0.25);
          else                   color = uColor4;

          vec3 alt = pow(color, vec3(2.));
          alt = alt * 1. - step(.01, color);
          color = mix(color, alt, uColorMixer);

          gl_FragColor = vec4(color, 1.);
          #include <colorspace_fragment>
        }
      `,
    });

    let rtScene = new THREE.WebGLRenderTarget(1, 1);
    let blurA = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });
    let blurB = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });

    const kawaseMat = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        texelSize: { value: new THREE.Vector2() },
        kernel: { value: 0 },
        scale: { value: 0.8 },
      },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position,1.); }`,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform vec2 texelSize;
        uniform float kernel, scale;
        void main() {
          vec2 dUv = (kernel + 0.5) * texelSize * scale;
          vec4 c = vec4(0.);
          c += texture2D(tDiffuse, vUv + vec2( dUv.x,  dUv.y));
          c += texture2D(tDiffuse, vUv + vec2(-dUv.x,  dUv.y));
          c += texture2D(tDiffuse, vUv + vec2( dUv.x, -dUv.y));
          c += texture2D(tDiffuse, vUv + vec2(-dUv.x, -dUv.y));
          gl_FragColor = c * 0.25;
        }
      `,
    });

    const blurState = { resScale: 0.55, kernelId: 2 };

    const fxMat = new THREE.ShaderMaterial({
      uniforms: {
        inputBuffer: { value: null },
        uSimulationTexture: { value: simA.texture },
        uDisplacementStrength: { value: new THREE.Vector2(2, 2) },
        uCursorColoring: { value: 1.5 },
        uXCount: { value: 1 },
        uYCount: { value: 1 },
        uIntensity: { value: 0.75 },
        uGrainMag: { value: 0.06 },
        uGrainColor: { value: new THREE.Color("#c8b8ff") },
        uGrainBlend: { value: 2 },
        time: { value: 0 },
      },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position,1.); }`,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D inputBuffer;
        uniform sampler2D uSimulationTexture;
        uniform vec2 uDisplacementStrength;
        uniform float uCursorColoring;
        uniform float uXCount, uYCount, uIntensity, time;
        uniform float uGrainMag;
        uniform vec3 uGrainColor;
        uniform int uGrainBlend;

        float random2d(vec2 c) {
          return fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453);
        }
        float blendSoftLight(float b, float s) {
          return (s < 0.5)
            ? (2. * b * s + b * b * (1. - 2. * s))
            : (sqrt(b) * (2. * s - 1.) + 2. * b * (1. - s));
        }
        vec3 blendSoftLight(vec3 b, vec3 s) {
          return vec3(blendSoftLight(b.r,s.r), blendSoftLight(b.g,s.g), blendSoftLight(b.b,s.b));
        }
        vec3 blendSoftLight(vec3 b, vec3 s, float opacity) {
          return blendSoftLight(b,s) * opacity + b * (1. - opacity);
        }

        void main() {
          vec4 g = texture2D(uSimulationTexture, vUv);
          vec2 dUv = vec2(
            vUv.x - (-0.5 + g.r) * uDisplacementStrength.x * g.b,
            vUv.y - (-0.5 + g.g) * uDisplacementStrength.y * g.b
          );
          vec4 col = texture2D(inputBuffer, dUv);
          col.rgb += col.rgb * g.b * uCursorColoring;

          float gridX = floor(vUv.x * uXCount) / uXCount;
          float gridY = 1.0 - floor(vUv.y * uYCount) / uYCount;
          float t  = mod(time, 1.);
          float ts = floor(t * 8.);
          float n  = random2d(vec2(gridX + ts, gridY));
          float signedN = n * 2.0 - 1.0;
          vec3 grain = signedN * uGrainMag * uGrainColor;

          vec3 result;
          if (uGrainBlend == 0) {
            result = blendSoftLight(col.rgb, clamp(col.rgb + grain, 0., 1.), uIntensity);
          } else if (uGrainBlend == 1) {
            result = col.rgb + grain * uIntensity;
          } else {
            vec3 s = grain * uIntensity;
            result = 1.0 - (1.0 - col.rgb) * (1.0 - clamp(s, 0., 1.));
          }
          result = clamp(result, 0., 1.);

          gl_FragColor = vec4(result, 1.);
        }
      `,
    });

    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const dpr = renderer.getPixelRatio();
      const pw = Math.floor(w * dpr), ph = Math.floor(h * dpr);
      renderer.setSize(w, h, false);
      rtScene.setSize(pw, ph);
      const bw = Math.max(2, Math.floor(pw * blurState.resScale));
      const bh = Math.max(2, Math.floor(ph * blurState.resScale));
      blurA.setSize(bw, bh);
      blurB.setSize(bw, bh);
      gradUniforms.uResolution.value.set(w, h);
      fxMat.uniforms.uXCount.value = w;
      fxMat.uniforms.uYCount.value = h;
      kawaseMat.uniforms.texelSize.value.set(1 / bw, 1 / bh);
    };
    window.addEventListener("resize", resize);
    resize();

    let last = performance.now();
    const start = last;
    let raf;
    const tick = (now) => {
      const dt = now - last;
      last = now;

      stepSim(dt);

      gradUniforms.uTime.value = (now - start) / 16.6667;
      blit(gradMat, rtScene);

      const seq = KERNEL_PRESETS[blurState.kernelId];
      let src = rtScene, dst = blurA;
      for (let i = 0; i < seq.length; i++) {
        kawaseMat.uniforms.tDiffuse.value = src.texture;
        kawaseMat.uniforms.kernel.value = seq[i];
        blit(kawaseMat, dst);
        if (i === 0) {
          src = blurA;
          dst = blurB;
        } else {
          const t = src;
          src = dst;
          dst = t;
        }
      }
      const blurOut = seq.length === 0 ? rtScene : src;

      fxMat.uniforms.inputBuffer.value = blurOut.texture;
      fxMat.uniforms.uSimulationTexture.value = simA.texture;
      fxMat.uniforms.time.value = (now - start) / 1000;
      blit(fxMat, null);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    handlesRef.current = {
      gradU: gradUniforms,
      fxU: fxMat.uniforms,
      kawaseU: kawaseMat.uniforms,
      blurState,
      resize,
    };

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      clearTimeout(mfTo);
      simMat.dispose();
      gradMat.dispose();
      kawaseMat.dispose();
      fxMat.dispose();
      fsGeom.dispose();
      noiseTex.dispose();
      simA.dispose();
      simB.dispose();
      rtScene.dispose();
      blurA.dispose();
      blurB.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const h = handlesRef.current;
    if (!h) return;
    h.gradU.uColor1.value.set(palette.color1);
    h.gradU.uColor2.value.set(palette.color2);
    h.gradU.uColor3.value.set(palette.color3);
    h.gradU.uColor4.value.set(palette.color4);
    setUi((s) => ({
      ...s,
      color1: palette.color1,
      color2: palette.color2,
      color3: palette.color3,
      color4: palette.color4,
    }));
  }, [palette]);

  const set = (patch) => setUi((s) => ({ ...s, ...patch }));
  const apply = (key, value) => {
    const h = handlesRef.current;
    if (!h) return;
    switch (key) {
      case "size": h.gradU.uSize.value = value; break;
      case "speed": h.gradU.uSpeed.value = value; break;
      case "offsetX": h.gradU.uOffset.value.x = value; break;
      case "offsetY": h.gradU.uOffset.value.y = value; break;
      case "colorMixer": h.gradU.uColorMixer.value = value; break;
      case "color1": h.gradU.uColor1.value.set(value); break;
      case "color2": h.gradU.uColor2.value.set(value); break;
      case "color3": h.gradU.uColor3.value.set(value); break;
      case "color4": h.gradU.uColor4.value.set(value); break;
      case "blurRes": h.blurState.resScale = value; h.resize(); break;
      case "blurScale": h.kawaseU.scale.value = value; break;
      case "blurKernel": h.blurState.kernelId = value; break;
      case "dispStr": h.fxU.uDisplacementStrength.value.set(value, value); break;
      case "cursorCol": h.fxU.uCursorColoring.value = value; break;
      case "grainInt": h.fxU.uIntensity.value = value; break;
      case "grainMag": h.fxU.uGrainMag.value = value; break;
      case "grainCol": h.fxU.uGrainColor.value.set(value); break;
      case "grainBlend": h.fxU.uGrainBlend.value = value; break;
    }
  };
  const onNum = (key) => (e) => {
    const v = +e.target.value;
    set({ [key]: v });
    apply(key, v);
  };
  const onStr = (key) => (e) => {
    const v = e.target.value;
    set({ [key]: v });
    apply(key, v);
  };
  const onInt = (key) => (e) => {
    const v = parseInt(e.target.value, 10);
    set({ [key]: v });
    apply(key, v);
  };

  const panelStyle = {
    position: "fixed", top: 12, left: 12, zIndex: 1000,
    background: "rgba(0,0,0,.55)", padding: "12px 14px", borderRadius: 8,
    fontFamily: "ui-monospace, monospace", fontSize: 12, color: "#ddd",
    minWidth: 260, maxHeight: "92vh", overflow: "auto",
    backdropFilter: "blur(6px)", pointerEvents: "auto",
  };
  const rowStyle = { display: "grid", gridTemplateColumns: "70px 1fr 52px", gap: 8, margin: "4px 0", alignItems: "center" };
  const h3Style = { margin: "10px 0 6px", fontSize: 11, opacity: 0.7, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" };
  const valStyle = { fontVariantNumeric: "tabular-nums", fontSize: 11, opacity: 0.85, textAlign: "right", color: "#8fd0ff" };
  const colorStyle = { width: 40, height: 22, border: 0, background: "transparent", padding: 0, justifySelf: "end" };
  const fmt = (v, step) => {
    const decimals = step >= 1 ? 0 : Math.min(4, (String(step).split(".")[1] || "").length);
    return v.toFixed(decimals);
  };
  const Range = ({ label, k, min, max, step }) => (
    <label style={rowStyle}>
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={ui[k]} onChange={onNum(k)} style={{ width: "100%" }} />
      <span style={valStyle}>{fmt(ui[k], step)}</span>
    </label>
  );

  return (
    <>
      <canvas
        ref={canvasRef}
        style={
          embed
            ? {
                position: "absolute", top: 0, left: 0,
                width: "100%", height: "100%",
                pointerEvents: "none",
              }
            : {
                position: "fixed", top: 0, left: 0,
                width: "100vw", height: "100vh",
                zIndex: -1, pointerEvents: "none",
                opacity: routing ? 0 : 1,
                transition: "opacity 0.2s ease",
              }
        }
      />
      {!embed && debug && (
        <button
          onClick={() => setShowUi((v) => !v)}
          style={{
            position: "fixed", top: 12, right: 12, zIndex: 1001,
            background: "rgba(0,0,0,.55)", color: "#ddd", border: "1px solid #444",
            padding: "6px 10px", borderRadius: 6, fontFamily: "ui-monospace, monospace",
            fontSize: 11, cursor: "pointer",
          }}
        >
          {showUi ? "hide" : "shader"}
        </button>
      )}
      {!embed && debug && showUi && (
        <div style={panelStyle}>
          <h3 style={{ ...h3Style, marginTop: 0 }}>gradient</h3>
          <Range label="size"       k="size"       min={0.05} max={2}    step={0.01} />
          <Range label="speed"      k="speed"      min={0}    max={0.01} step={0.0001} />
          <Range label="offset.x"   k="offsetX"    min={-2}   max={2}    step={0.01} />
          <Range label="offset.y"   k="offsetY"    min={-2}   max={2}    step={0.01} />
          <Range label="colorMixer" k="colorMixer" min={0}    max={1}    step={0.01} />

          <h3 style={h3Style}>colors</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["color1", "color2", "color3", "color4"].map((k, i) => (
              <label key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {i + 1}
                <input type="color" value={ui[k]} onChange={onStr(k)} style={colorStyle} />
              </label>
            ))}
          </div>

          <h3 style={h3Style}>blur (kawase)</h3>
          <Range label="res scale"   k="blurRes"    min={0.1} max={1} step={0.05} />
          <Range label="scale"       k="blurScale"  min={0}   max={6} step={0.1} />
          <Range label="kernel size" k="blurKernel" min={0}   max={5} step={1} />

          <h3 style={h3Style}>displacement (cursor)</h3>
          <Range label="strength" k="dispStr"   min={0} max={6} step={0.05} />
          <Range label="colorize" k="cursorCol" min={0} max={3} step={0.05} />

          <h3 style={h3Style}>grain</h3>
          <Range label="intensity" k="grainInt" min={0} max={4}   step={0.01} />
          <Range label="magnitude" k="grainMag" min={0} max={0.6} step={0.01} />
          <label style={rowStyle}>
            <span>color</span>
            <input type="color" value={ui.grainCol} onChange={onStr("grainCol")} style={colorStyle} />
            <span />
          </label>
          <label style={rowStyle}>
            <span>blend</span>
            <select
              value={ui.grainBlend}
              onChange={onInt("grainBlend")}
              style={{ width: "100%", background: "#222", color: "#ddd", border: "1px solid #444", padding: 2 }}
            >
              <option value={0}>soft-light</option>
              <option value={1}>add</option>
              <option value={2}>screen</option>
            </select>
            <span />
          </label>
        </div>
      )}
    </>
  );
}
