import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import * as THREE from "three";
import { gsap } from "gsap";
import GUI from "lil-gui";
import { useProjectCovers } from "@/context/ProjectCoversContext";
import { useTransition } from "@/context/TransitionContext";
import { projectMorph, EASING_OPTIONS } from "@/lib/transitionConfig";

const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uIntensity;
  uniform float uFrequency;
  uniform float uSpeed;
  uniform float uExpand;
  uniform vec2 uTargetMin;
  uniform vec2 uTargetMax;
  uniform float uCornerLead; // 0..2 how much corners lead over center
  uniform float uTwistAngle; // radians — twist applied to local plane space
  varying vec2 vUv;

  // Ashima Arts 2D simplex noise (MIT)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                   + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    vec2 noiseCoord = pos.xy * uFrequency + vec2(uTime * uSpeed);
    float nx = snoise(noiseCoord);
    float ny = snoise(noiseCoord + vec2(5.123, 7.456));
    pos.x += nx * uIntensity;
    pos.y += ny * uIntensity;

    // Twist around plane center (PIXI TwistFilter analog): strongest at
    // center, fades to 0 at corners.
    float r = length(pos.xy) * 2.0; // 0 at center → ~1.41 at corners
    float twistFalloff = max(0.0, 1.0 - r);
    float theta = uTwistAngle * twistFalloff;
    float ct = cos(theta);
    float st = sin(theta);
    pos.xy = vec2(pos.x * ct - pos.y * st, pos.x * st + pos.y * ct);

    // Source world position from the standard mesh transform.
    vec4 src = modelMatrix * vec4(pos, 1.0);
    vec2 srcWorld = src.xy;

    // Target world position: each uv corner maps to viewport corner.
    vec2 targetWorld = mix(uTargetMin, uTargetMax, uv);

    // Per-vertex eased progress; corners lead, center lags.
    float distFromCenter = length(uv - 0.5) * 2.0; // 0..sqrt(2)
    float prog = clamp(uExpand * (1.0 + distFromCenter * uCornerLead), 0.0, 1.0);
    prog = 1.0 - pow(1.0 - prog, 3.0); // cubic out

    vec2 finalWorld = mix(srcWorld, targetWorld, prog);

    gl_Position = projectionMatrix * viewMatrix * vec4(finalWorld, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform vec2 uSize;          // effective plane size (tweened cover -> viewport)
  uniform vec2 uTextureSize;
  uniform float uRadius;
  uniform float uBrightness;
  uniform float uContrast;
  uniform float uGamma;
  uniform float uOpacity;
  varying vec2 vUv;

  float sdRoundedRect(vec2 p, vec2 halfSize, float r) {
    vec2 q = abs(p) - halfSize + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  vec2 coverUV(vec2 uv, vec2 planeSize, vec2 textureSize) {
    vec2 ratio = planeSize / textureSize;
    float maxRatio = max(ratio.x, ratio.y);
    vec2 cover = ratio / maxRatio;
    vec2 offset = (1.0 - cover) * 0.5;
    return uv * cover + offset;
  }

  void main() {
    vec2 uv = coverUV(vUv, uSize, uTextureSize);
    vec4 color = texture2D(uTexture, uv);
    vec3 rgb = color.rgb;
    rgb = pow(rgb, vec3(1.0 / uGamma));
    rgb *= uBrightness;
    rgb = (rgb - 0.5) * uContrast + 0.5;

    vec2 pixelPos = (vUv - 0.5) * uSize;
    vec2 halfSize = uSize * 0.5;
    float dist = sdRoundedRect(pixelPos, halfSize, uRadius);
    float alpha = 1.0 - smoothstep(-1.0, 1.0, dist);

    gl_FragColor = vec4(rgb, color.a * alpha * uOpacity);
  }
`;

const BASE_VIEWPORT_WIDTH = 1920;
const BASE_RADIUS_PX = 24;

function getRotationFromTransform(el) {
  const cs = getComputedStyle(el);
  if (!cs.transform || cs.transform === "none") return 0;
  try {
    const matrix = new DOMMatrixReadOnly(cs.transform);
    return -Math.atan2(matrix.b, matrix.a);
  } catch {
    return 0;
  }
}

const DEFAULTS = {
  brightness: 1.1,
  contrast: 1.0,
  gamma: 2.0,
  radius: BASE_RADIUS_PX,
  intensity: 0.016,
  frequency: 2.0,
  speed: 0.3,
};

export default function ProjectCoversCanvas() {
  const canvasRef = useRef(null);
  const { covers } = useProjectCovers();
  const router = useRouter();
  const { transition, phase, setPhase } = useTransition();
  const sceneState = useRef({
    scene: null,
    camera: null,
    renderer: null,
    planes: new Map(),
    active: false,
    radiusPx: BASE_RADIUS_PX,
    settings: { ...DEFAULTS },
    startTime: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 768px)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(
      -window.innerWidth / 2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      -window.innerHeight / 2,
      0.1,
      1000
    );
    camera.position.z = 10;

    const radiusPx = (window.innerWidth / BASE_VIEWPORT_WIDTH) * BASE_RADIUS_PX;

    sceneState.current = {
      scene,
      camera,
      renderer,
      planes: new Map(),
      active: true,
      radiusPx,
      settings: { ...DEFAULTS },
      startTime: performance.now() / 1000,
    };

    const gui = new GUI({ title: "Project Covers" });
    gui.close();

    const colorFolder = gui.addFolder("Color");
    colorFolder
      .add(sceneState.current.settings, "brightness", 0, 3, 0.01)
      .onChange(updateAllUniforms);
    colorFolder
      .add(sceneState.current.settings, "contrast", 0, 3, 0.01)
      .onChange(updateAllUniforms);
    colorFolder
      .add(sceneState.current.settings, "gamma", 0.1, 3, 0.01)
      .onChange(updateAllUniforms);

    const shapeFolder = gui.addFolder("Shape");
    shapeFolder
      .add(sceneState.current.settings, "radius", 0, 100, 1)
      .onChange((v) => {
        sceneState.current.planes.forEach((entry) => {
          entry.mesh.material.uniforms.uRadius.value =
            (window.innerWidth / BASE_VIEWPORT_WIDTH) * v;
        });
      });

    const wobbleFolder = gui.addFolder("Wobble");
    wobbleFolder
      .add(sceneState.current.settings, "intensity", 0, 0.3, 0.001)
      .onChange(updateAllUniforms);
    wobbleFolder
      .add(sceneState.current.settings, "frequency", 0.5, 10, 0.1)
      .onChange(updateAllUniforms);
    wobbleFolder
      .add(sceneState.current.settings, "speed", 0, 2, 0.05)
      .onChange(updateAllUniforms);

    const morphFolder = gui.addFolder("Project Morph");
    morphFolder.add(projectMorph, "shaderDuration", 0.3, 3, 0.05);
    morphFolder.add(projectMorph, "shaderEase", EASING_OPTIONS);
    morphFolder.add(projectMorph, "wobblePeak", 0, 0.3, 0.005);
    morphFolder.add(projectMorph, "cornerLead", 0, 2, 0.05).onChange((v) => {
      sceneState.current.planes.forEach((entry) => {
        entry.mesh.material.uniforms.uCornerLead.value = v;
      });
    });
    morphFolder.add(projectMorph, "twistPeak", -3, 3, 0.05);
    morphFolder.add(projectMorph, "pageDuration", 0.3, 2.5, 0.05);
    morphFolder.add(projectMorph, "pageEase", EASING_OPTIONS);
    morphFolder.add(projectMorph, "overlap", 0, 1, 0.01);

    function updateAllUniforms() {
      const s = sceneState.current.settings;
      sceneState.current.planes.forEach((entry) => {
        const u = entry.mesh.material.uniforms;
        u.uBrightness.value = s.brightness;
        u.uContrast.value = s.contrast;
        u.uGamma.value = s.gamma;
        u.uIntensity.value = s.intensity;
        u.uFrequency.value = s.frequency;
        u.uSpeed.value = s.speed;
      });
    }

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.left = -w / 2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = -h / 2;
      camera.updateProjectionMatrix();
      sceneState.current.radiusPx =
        (w / BASE_VIEWPORT_WIDTH) * sceneState.current.settings.radius;
      sceneState.current.planes.forEach((entry) => {
        entry.mesh.material.uniforms.uRadius.value =
          sceneState.current.radiusPx;
        entry.mesh.material.uniforms.uTargetMin.value.set(-w / 2, -h / 2);
        entry.mesh.material.uniforms.uTargetMax.value.set(w / 2, h / 2);
      });
    };
    window.addEventListener("resize", onResize);

    const tick = () => {
      const state = sceneState.current;
      if (!state.active) return;

      const t = performance.now() / 1000 - state.startTime;

      state.planes.forEach((entry) => {
        const u = entry.mesh.material.uniforms;
        u.uTime.value = t;

        if (entry.frozen) {
          // uSize / uSource* were snapshotted at click; do not update.
          return;
        }

        const el = entry.element;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const x = cx - window.innerWidth / 2;
        const y = -(cy - window.innerHeight / 2);

        const w = el.offsetWidth;
        const h = el.offsetHeight;

        entry.mesh.position.set(x, y, 0);
        entry.mesh.scale.set(w, h, 1);
        entry.mesh.rotation.z = getRotationFromTransform(el);

        u.uSize.value.set(w, h);
      });

      renderer.render(scene, camera);
    };

    gsap.ticker.add(tick);

    return () => {
      sceneState.current.active = false;
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(tick);
      gui.destroy();

      sceneState.current.planes.forEach((entry) => {
        scene.remove(entry.mesh);
        entry.mesh.geometry.dispose();
        entry.mesh.material.dispose();
        entry.texture.dispose();
      });
      sceneState.current.planes.clear();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const state = sceneState.current;
    if (!state.active || !state.scene) return;

    const { scene, planes, radiusPx, settings } = state;
    const loader = new THREE.TextureLoader();

    covers.forEach((cover) => {
      if (planes.has(cover.id)) {
        const existing = planes.get(cover.id);
        existing.element = cover.element;
        existing.mesh.material.uniforms.uOpacity.value = 1;
        return;
      }

      loader.load(cover.src, (texture) => {
        if (!sceneState.current.active) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        const geometry = new THREE.PlaneGeometry(1, 1, 64, 64);
        const material = new THREE.ShaderMaterial({
          uniforms: {
            uTexture: { value: texture },
            uSize: { value: new THREE.Vector2(1, 1) },
            uTextureSize: {
              value: new THREE.Vector2(
                texture.image.width,
                texture.image.height
              ),
            },
            uRadius: { value: radiusPx },
            uBrightness: { value: settings.brightness },
            uContrast: { value: settings.contrast },
            uGamma: { value: settings.gamma },
            uOpacity: { value: 1 },
            uTime: { value: 0 },
            uIntensity: { value: settings.intensity },
            uFrequency: { value: settings.frequency },
            uSpeed: { value: settings.speed },
            uExpand: { value: 0 },
            uTargetMin: {
              value: new THREE.Vector2(
                -window.innerWidth / 2,
                -window.innerHeight / 2
              ),
            },
            uTargetMax: {
              value: new THREE.Vector2(
                window.innerWidth / 2,
                window.innerHeight / 2
              ),
            },
            uCornerLead: { value: projectMorph.cornerLead },
            uTwistAngle: { value: 0 },
          },
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
          transparent: true,
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        planes.set(cover.id, {
          mesh,
          texture,
          element: cover.element,
        });
      });
    });

    const coverIds = new Set(covers.map((c) => c.id));
    Array.from(planes.keys()).forEach((id) => {
      if (!coverIds.has(id)) {
        const entry = planes.get(id);
        if (entry.frozen) {
          // keep mesh alive for transition; element gone is fine
          entry.element = null;
          return;
        }
        scene.remove(entry.mesh);
        entry.mesh.geometry.dispose();
        entry.mesh.material.dispose();
        entry.texture.dispose();
        planes.delete(id);
      }
    });
  }, [covers]);

  // Expand active cover to fullscreen + wobble peak on projectMorph transition
  useEffect(() => {
    const state = sceneState.current;
    if (!state.active) return;
    if (!transition || transition.kind !== "projectMorph") return;
    if (phase !== "expanding") return;

    const { modifier, href } = transition.payload;
    const entry = state.planes.get(modifier);

    if (!entry) {
      // shader plane not available (e.g. mobile or not yet loaded) — fallback
      router.push(href);
      setPhase("entering");
      return;
    }

    entry.frozen = true;
    entry.mesh.position.z = 1; // bring active above others
    const u = entry.mesh.material.uniforms;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Snapshot at click — uSize will tween to viewport during expand.
    u.uSize.value.set(entry.mesh.scale.x, entry.mesh.scale.y);
    u.uTargetMin.value.set(-w / 2, -h / 2);
    u.uTargetMax.value.set(w / 2, h / 2);

    // snapshot config at trigger time so live edits don't desync this run
    const dur = projectMorph.shaderDuration;
    const ease = projectMorph.shaderEase;
    const peak = projectMorph.wobblePeak;
    const twistPeak = projectMorph.twistPeak;
    const wobbleSpan = dur * (5 / 6); // wobble ends slightly before fullscreen
    const overlapAt = dur * projectMorph.overlap;

    // ensure twist starts at 0
    u.uTwistAngle.value = 0;

    const tweens = [];

    // Expand timeline runs to completion even after phase moves to "entering" —
    // intentionally not added to cleanup-killed tweens.
    const tl = gsap.timeline();

    tl.to(u.uExpand, { value: 1, duration: dur, ease }, 0)
      .to(u.uSize.value, { x: w, y: h, duration: dur, ease }, 0)
      .to(u.uRadius, { value: 0, duration: dur, ease }, 0)
      .to(
        u.uIntensity,
        { value: peak, duration: wobbleSpan / 2, ease: "power2.out" },
        0
      )
      .to(
        u.uIntensity,
        { value: 0, duration: wobbleSpan / 2, ease: "power2.in" },
        wobbleSpan / 2
      )
      // Twist: 0 → peak (at ~30% of expand) → 0 (decays with Power4.easeOut)
      .to(
        u.uTwistAngle,
        { value: twistPeak, duration: dur * 0.3, ease: "power2.out" },
        0
      )
      .to(
        u.uTwistAngle,
        { value: 0, duration: dur * 0.7, ease: "power4.out" },
        dur * 0.3
      )
      // Trigger navigation + page slide-up at overlap point of expand
      .call(
        () => {
          setPhase("entering");
          router.push(href);
        },
        null,
        overlapAt
      );
    // NOTE: do not push tl into tweens — it must keep running past phase change

    state.planes.forEach((other, id) => {
      if (id === modifier) return;
      const t = gsap.to(other.mesh.material.uniforms.uOpacity, {
        value: 0,
        duration: 0.2,
        ease: "power2.out",
      });
      tweens.push(t);
    });

    return () => {
      tweens.forEach((t) => t.kill());
    };
  }, [phase, transition, router, setPhase]);

  // Hide frozen mesh on signal (fires before z-index drop on enter complete)
  useEffect(() => {
    const handler = () => {
      const state = sceneState.current;
      if (!state.active) return;
      state.planes.forEach((entry) => {
        if (entry.frozen) entry.mesh.visible = false;
      });
    };
    window.addEventListener("projectMorph:hideMesh", handler);
    return () => window.removeEventListener("projectMorph:hideMesh", handler);
  }, []);

  // Cleanup frozen mesh + reset opacities on transition complete
  useEffect(() => {
    const state = sceneState.current;
    if (!state.active) return;
    if (phase !== null) return;

    const toDelete = [];
    state.planes.forEach((entry, id) => {
      if (entry.frozen) {
        state.scene.remove(entry.mesh);
        entry.mesh.geometry.dispose();
        entry.mesh.material.dispose();
        entry.texture.dispose();
        toDelete.push(id);
      } else {
        const u = entry.mesh.material.uniforms;
        u.uOpacity.value = 1;
        u.uRadius.value = state.radiusPx;
        u.uExpand.value = 0;
        u.uTwistAngle.value = 0;
      }
    });
    toDelete.forEach((id) => state.planes.delete(id));
  }, [phase]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 60,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
