import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import GUI from "lil-gui";
import { useProjectCovers } from "@/context/ProjectCoversContext";

const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uIntensity;
  uniform float uFrequency;
  uniform float uSpeed;
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
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform vec2 uSize;
  uniform vec2 uTextureSize;
  uniform float uRadius;
  uniform float uBrightness;
  uniform float uContrast;
  uniform float uGamma;
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

    gl_FragColor = vec4(rgb, color.a * alpha);
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
      });
    };
    window.addEventListener("resize", onResize);

    const tick = () => {
      const state = sceneState.current;
      if (!state.active) return;

      const t = performance.now() / 1000 - state.startTime;

      state.planes.forEach((entry) => {
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

        const u = entry.mesh.material.uniforms;
        u.uSize.value.set(w, h);
        u.uTime.value = t;
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
        planes.get(cover.id).element = cover.element;
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
            uTime: { value: 0 },
            uIntensity: { value: settings.intensity },
            uFrequency: { value: settings.frequency },
            uSpeed: { value: settings.speed },
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
        scene.remove(entry.mesh);
        entry.mesh.geometry.dispose();
        entry.mesh.material.dispose();
        entry.texture.dispose();
        planes.delete(id);
      }
    });
  }, [covers]);

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
