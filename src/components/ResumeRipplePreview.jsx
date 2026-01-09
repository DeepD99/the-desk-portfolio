import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

const FRAG = `
precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float uTime;
uniform vec2 uMouse;   // normalized 0..1
uniform float uAmp;    // ripple strength 0..~0.02

void main() {
  vec2 uv = vTextureCoord;

  // vector from mouse to current pixel
  vec2 d = uv - uMouse;
  float dist = length(d);

  // ripple wave (frequency + speed)
  float wave = sin(28.0 * dist - uTime * 6.0);

  // exponential falloff so it’s localized
  float falloff = exp(-dist * 9.0);

  // displace along radial direction
  vec2 offset = normalize(d + 1e-6) * wave * falloff * uAmp;

  gl_FragColor = texture2D(uSampler, uv + offset);
}
`;

export default function ResumeRipplePreview({
    src = "/resume-preview.webp",
    amp = 0.012, // tasteful default
}) {
    const hostRef = useRef(null);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;

        const app = new PIXI.Application({
            resizeTo: host,
            backgroundAlpha: 0,
            antialias: true,
            autoDensity: true,
            resolution: Math.min(window.devicePixelRatio || 1, 2),
        });

        host.appendChild(app.view);

        let sprite = null;
        let filter = null;

        const mouse = { x: 0.5, y: 0.5 };
        let hovering = false;

        const clamp01 = (v) => Math.max(0, Math.min(1, v));

        const onMove = (e) => {
            const rect = app.view.getBoundingClientRect();
            mouse.x = clamp01((e.clientX - rect.left) / rect.width);
            mouse.y = clamp01((e.clientY - rect.top) / rect.height);
        };

        const onEnter = () => (hovering = true);
        const onLeave = () => (hovering = false);

        app.view.addEventListener("mousemove", onMove);
        app.view.addEventListener("mouseenter", onEnter);
        app.view.addEventListener("mouseleave", onLeave);

        let cleanupFit = () => { };

        (async () => {
            const texture = await PIXI.Assets.load(src);
            sprite = new PIXI.Sprite(texture);

            // Fit image to container (contain) while keeping aspect ratio
            const fit = () => {
                if (!sprite) return;
                const w = app.renderer.width / app.renderer.resolution;
                const h = app.renderer.height / app.renderer.resolution;

                const sx = w / sprite.texture.width;
                const sy = h / sprite.texture.height;
                const s = Math.min(sx, sy);

                sprite.scale.set(s);
                sprite.x = (w - sprite.width) / 2;
                sprite.y = (h - sprite.height) / 2;
            };

            fit();
            window.addEventListener("resize", fit);
            cleanupFit = () => window.removeEventListener("resize", fit);

            filter = new PIXI.Filter(undefined, FRAG, {
                uTime: 0,
                uMouse: new Float32Array([mouse.x, mouse.y]),
                uAmp: 0,
            });

            sprite.filters = [filter];
            app.stage.addChild(sprite);

            app.ticker.add((delta) => {
                if (!filter) return;

                // time in seconds-ish
                filter.uniforms.uTime += delta / 60;

                // ✅ smooth ramp in/out so it never snaps
                const target = hovering ? amp : 0.0;
                filter.uniforms.uAmp += (target - filter.uniforms.uAmp) * 0.12;

                filter.resources.uMouse[0] = mouse.x;
                filter.resources.uMouse[1] = mouse.y;
            });
        })();

        return () => {
            cleanupFit();
            app.view.removeEventListener("mousemove", onMove);
            app.view.removeEventListener("mouseenter", onEnter);
            app.view.removeEventListener("mouseleave", onLeave);
            app.destroy(true, { children: true, texture: true, baseTexture: true });
            host.innerHTML = "";
        };
    }, [src, amp]);

    return (
        <div
            ref={hostRef}
            style={{
                width: "100%",
                height: "100%",
                borderRadius: 16,
                overflow: "hidden",
            }}
        />
    );
}
