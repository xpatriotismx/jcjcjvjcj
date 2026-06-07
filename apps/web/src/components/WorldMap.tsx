import { Application, Assets, Container, Graphics, Sprite, Text } from "pixi.js";
import { useEffect, useRef } from "react";

const districts = [
  { name: "Eski Şehir", x: 0.48, y: 0.43, danger: true },
  { name: "Finans Hattı", x: 0.72, y: 0.3 },
  { name: "Liman", x: 0.22, y: 0.7 },
  { name: "Sanayi", x: 0.77, y: 0.72, danger: true },
  { name: "Kuzey", x: 0.35, y: 0.2 },
  { name: "Merkez Sığınak", x: 0.5, y: 0.58, shelter: true }
];

export function WorldMap() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let app: Application | null = null;

    const mount = async () => {
      const instance = new Application();
      await instance.init({
        resizeTo: host,
        antialias: true,
        backgroundAlpha: 0,
        resolution: Math.min(window.devicePixelRatio, 2),
        autoDensity: true
      });
      if (cancelled) {
        instance.destroy(true);
        return;
      }
      app = instance;
      host.appendChild(instance.canvas);

      const texture = await Assets.load("/assets/sehemistan-map.png");
      const background = new Sprite(texture);
      const scene = new Container();
      instance.stage.addChild(scene);
      scene.addChild(background);

      const shade = new Graphics().rect(0, 0, 10, 10).fill({ color: 0x080a0c, alpha: 0.18 });
      scene.addChild(shade);
      const markers: Array<{ core: Graphics; ring: Graphics; phase: number }> = [];

      for (const [index, district] of districts.entries()) {
        const marker = new Container();
        const ring = new Graphics()
          .circle(0, 0, district.shelter ? 22 : 16)
          .stroke({ color: district.danger ? 0xe14a3b : district.shelter ? 0xe5b85c : 0x33d6c5, width: 2, alpha: 0.8 });
        const core = new Graphics()
          .circle(0, 0, district.shelter ? 9 : 6)
          .fill({ color: district.danger ? 0xe14a3b : district.shelter ? 0xe5b85c : 0x33d6c5 });
        const label = new Text({
          text: district.name.toUpperCase(),
          style: {
            fill: 0xf4f1e8,
            fontFamily: "Rajdhani",
            fontSize: 13,
            fontWeight: "700",
            dropShadow: { color: 0x000000, alpha: 0.9, blur: 4, distance: 1 }
          }
        });
        label.anchor.set(0.5, 0);
        label.y = district.shelter ? 26 : 20;
        marker.addChild(ring, core, label);
        scene.addChild(marker);
        markers.push({ core, ring, phase: index * 0.7 });
        marker.label = `${district.x}:${district.y}`;
      }

      const layout = () => {
        const width = instance.screen.width;
        const height = instance.screen.height;
        const scale = Math.max(width / texture.width, height / texture.height);
        background.scale.set(scale);
        background.x = (width - texture.width * scale) / 2;
        background.y = (height - texture.height * scale) / 2;
        shade.width = width;
        shade.height = height;
        districts.forEach((district, index) => {
          const node = scene.children[index + 2];
          if (node) {
            node.x = width * district.x;
            node.y = height * district.y;
          }
        });
      };
      layout();
      instance.renderer.on("resize", layout);

      let elapsed = 0;
      instance.ticker.add((ticker) => {
        elapsed += ticker.deltaTime / 60;
        for (const marker of markers) {
          const pulse = 1 + Math.sin(elapsed * 2.4 + marker.phase) * 0.13;
          marker.ring.scale.set(pulse);
          marker.ring.alpha = 0.6 + Math.sin(elapsed * 2.4 + marker.phase) * 0.2;
          marker.core.rotation += 0.01 * ticker.deltaTime;
        }
      });
    };

    void mount();
    return () => {
      cancelled = true;
      app?.destroy(true, { children: true });
    };
  }, []);

  return <div ref={hostRef} className="world-map" aria-label="Sehemistan taktik haritası" />;
}
