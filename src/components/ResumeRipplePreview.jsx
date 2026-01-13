import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";

// PIXI v8 Vertex Shader
const VERT = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void) {
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}
`;

// PIXI v8 Fragment Shader
const FRAG = `
precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float uTime;
uniform vec2 uMouse;
uniform float uAmp;

void main() {
  vec2 uv = vTextureCoord;
  vec2 d = uv - uMouse;
  float dist = length(d);
  float wave = sin(28.0 * dist - uTime * 6.0);
  float falloff = exp(-dist * 9.0);
  vec2 offset = normalize(d + 1e-6) * wave * falloff * uAmp;
  gl_FragColor = texture2D(uSampler, uv + offset);
}
`;

/**
 * Solid PIXI v8 Resume Ripple
 */
export default function ResumeRipplePreview({
    src = "/resume/resume-preview.webp",
    amp = 0.012,
}) {
    const hostRef = useRef(null);
    const [isFallback, setIsFallback] = useState(false);

    useEffect(() => {
        let app = null;
        let isDead = false;

        const start = async () => {
            const host = hostRef.current;
            if (!host) return;

            try {
                // Initialize Application
                app = new PIXI.Application();
                await app.init({
                    preference: 'webgl',
                    width: host.clientWidth || 820,
                    height: host.clientHeight || 1100,
                    backgroundAlpha: 0,
                    antialias: true
                });

                if (isDead) {
                    await app.destroy(true, { children: true, texture: true });
                    return;
                }

                // Load Assets
                const texture = await PIXI.Assets.load(src);
                if (isDead) return;

                const sprite = new PIXI.Sprite(texture);
                sprite.anchor.set(0.5);

                // Uniform Group is the most stable way to update values in v8
                const group = new PIXI.UniformGroup({
                    uTime: { value: 0, type: 'f32' },
                    uMouse: { value: [0.5, 0.5], type: 'vec2<f32>' },
                    uAmp: { value: 0, type: 'f32' },
                });

                const filter = new PIXI.Filter({
                    gl: {
                        vertex: VERT,
                        fragment: FRAG,
                    },
                    resources: {
                        uGlobal: group,
                    }
                });

                sprite.filters = [filter];
                app.stage.addChild(sprite);

                // Initial layout
                const fit = () => {
                    if (isDead || !app.renderer) return;
                    const w = host.clientWidth;
                    const h = host.clientHeight;
                    app.renderer.resize(w, h);
                    sprite.position.set(w / 2, h / 2);
                    sprite.scale.set(Math.min(w / sprite.texture.width, h / sprite.texture.height));
                };
                fit();
                window.addEventListener('resize', fit);

                host.appendChild(app.canvas);

                // State
                let m = { x: 0.5, y: 0.5 };
                let h = false;

                const onMove = (e) => {
                    const rect = host.getBoundingClientRect();
                    m.x = (e.clientX - rect.left) / rect.width;
                    m.y = (e.clientY - rect.top) / rect.height;
                };
                host.addEventListener('mousemove', onMove);
                host.addEventListener('mouseenter', () => h = true);
                host.addEventListener('mouseleave', () => h = false);

                let localTime = 0;
                let localAmp = 0;

                app.ticker.add((ticker) => {
                    if (isDead) return;
                    localTime += ticker.deltaTime / 60;
                    const target = h ? amp : 0;
                    localAmp += (target - localAmp) * 0.12;

                    // Standard PIXI v8 UniformGroup update pattern
                    group.uniforms.uTime = localTime;
                    group.uniforms.uAmp = localAmp;
                    group.uniforms.uMouse = [m.x, m.y];
                });

            } catch (err) {
                console.error("PIXI v8 Build Error:", err);
                setIsFallback(true);
            }
        };

        const timer = setTimeout(start, 50);

        return () => {
            isDead = true;
            clearTimeout(timer);
            if (app) {
                try {
                    app.destroy(true, { children: true, texture: true });
                } catch (e) { }
            }
            if (hostRef.current) hostRef.current.innerHTML = "";
        };
    }, [src, amp]);

    return (
        <div
            ref={hostRef}
            style={{
                width: "100%",
                height: "100%",
                borderRadius: 12,
                overflow: "hidden",
                background: "#000",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            {isFallback && (
                <img
                    src={src}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    alt="Resume Fallback"
                />
            )}
        </div>
    );
}
