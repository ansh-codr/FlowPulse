const fs = require('fs');
let code = fs.readFileSync('dashboard/src/landing/immersive/hero/HeroScene.tsx', 'utf8');
code = code.replace(
    /<motion\.img\s+key=\{heroFrameIndex\}\s+src=\{heroCurrentFrame\}\s+alt=""\s+className="h-full w-full object-cover"\s+initial=\{\{ opacity: 0, scale: 1\.05 \}\}\s+animate=\{\{ opacity: 1, scale: 1\.02 \}\}\s+transition=\{\{ duration: 0\.45, ease: "easeOut" \}\}\s+\/>/,
    `<img
                    src={heroCurrentFrame}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ scale: 1.02, display: "block", minWidth: "100%", minHeight: "100%", objectPosition: "center" }}
                />`
);
fs.writeFileSync('dashboard/src/landing/immersive/hero/HeroScene.tsx', code);
