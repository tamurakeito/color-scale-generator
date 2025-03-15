import * as fs from "fs";
import * as path from "path";

function hexToRgb(hex: string): [number, number, number] {
  let hexCode = hex.startsWith("#") ? hex : `#${hex}`;
  if (hexCode.length === 7 || hexCode.length === 9) {
    let hexValue = hexCode.length === 9 ? hexCode.substring(0, 7) : hexCode;
    return [
      parseInt(hexValue.substring(1, 3), 16),
      parseInt(hexValue.substring(3, 5), 16),
      parseInt(hexValue.substring(5, 7), 16),
    ];
  } else {
    console.error("Invalid HEX code format:", hexCode);
    return [0, 0, 0];
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  const rHex = Math.max(0, Math.round(r)).toString(16).padStart(2, "0");
  const gHex = Math.max(0, Math.round(g)).toString(16).padStart(2, "0");
  const bHex = Math.max(0, Math.round(b)).toString(16).padStart(2, "0");
  return `#${rHex}${gHex}${bHex}`;
}

function generateColorScale(
  centerLevel: string,
  centerColor: string
): { [key: string]: string } {
  const color000: [number, number, number] = [255, 255, 255];
  const centerRGB: [number, number, number] = hexToRgb(centerColor);

  // スケールレベルに 050 を追加
  const levels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  const center = parseInt(centerLevel);

  // centerより小さいレベルの変化量を計算
  const diff: [number, number, number] = [
    (centerRGB[0] - color000[0]) / (center / 100),
    (centerRGB[1] - color000[1]) / (center / 100),
    (centerRGB[2] - color000[2]) / (center / 100),
  ];

  const result: { [key: string]: string } = {};

  levels.forEach((level) => {
    let newRgb: [number, number, number];

    if (level < center) {
      // centerより小さいレベル
      newRgb = [
        Math.round(color000[0] + diff[0] * (level / 100)),
        Math.round(color000[1] + diff[1] * (level / 100)),
        Math.round(color000[2] + diff[2] * (level / 100)),
      ];
    } else if (level > center) {
      // centerより大きいレベル
      newRgb = [
        Math.max(
          0,
          Math.round(centerRGB[0] + diff[0] * ((level - center) / 100))
        ),
        Math.max(
          0,
          Math.round(centerRGB[1] + diff[1] * ((level - center) / 100))
        ),
        Math.max(
          0,
          Math.round(centerRGB[2] + diff[2] * ((level - center) / 100))
        ),
      ];
    } else {
      // levelがcenterと等しい場合
      newRgb = centerRGB;
    }

    result[level.toString()] = rgbToHex(newRgb[0], newRgb[1], newRgb[2]);
  });

  return result;
}

// 入力処理
if (typeof process !== "undefined" && process.stdin) {
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    "HEXカラーコードを入力してください（例: #036A8B）: ",
    (userInput: string) => {
      const originalColor = userInput.trim();
      rl.question(
        "基準とするスケールレベルを入力してください (100～900): ",
        (levelInput: string) => {
          const level = levelInput.trim();

          if (
            ![
              "100",
              "200",
              "300",
              "400",
              "500",
              "600",
              "700",
              "800",
              "900",
            ].includes(level)
          ) {
            console.error(
              "無効なスケールレベルです。100～900の範囲で入力してください。"
            );
            rl.close();
            return;
          }

          const scaleColors = generateColorScale(level, originalColor);

          console.log(`Original: ${originalColor}`);
          console.log(`基準レベル: ${level}`);

          // ソートされたキーの配列を作成
          const sortedKeys = Object.keys(scaleColors).sort((a, b) => {
            if (a === "50") return -1;
            if (b === "50") return 1;
            return parseInt(a) - parseInt(b);
          });

          // `console.table` に渡すための配列を作成
          const tableData = sortedKeys.map((key) => ({
            key: key === "50" ? "050" : key,
            value: scaleColors[key],
          }));

          // console.tableで出力
          console.table(tableData);

          // HTML生成
          let html = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Color Scale</title>
              <style>
                .color-sample {
                  display: inline-block;
                  margin-right: 12px;
                }
                .color-square {
                  width: 60px;
                  height: 60px;
                  border: 1px solid #ccc;
                  cursor: pointer;
                }
              </style>
            </head>
            <body>
              <h1>Color Scale</h1>
              <p>Original Color (${level}): ${originalColor}</p>
              <div>
                ${Object.keys(scaleColors)
                  .sort((a, b) => {
                    if (a === "50") return -1;
                    if (b === "50") return 1;
                    return parseInt(a) - parseInt(b);
                  })
                  .map(
                    (level) => `
                  <div class="color-sample"><div>${
                    level === "50" ? "050" : level
                  }</div>
                      <div class="color-square"
                          style="background-color: ${scaleColors[level]};"
                          title="${level === "50" ? "050" : level}"
                          onclick="copyToClipboard('${
                            scaleColors[level]
                          }')"></div></div>
                `
                  )
                  .join("")}
              </div>

              <script>
                function copyToClipboard(colorCode) {
                  navigator.clipboard.writeText(colorCode)
                    .then(() => {
                      // alert('Copied color code: ' + colorCode);
                    })
                    .catch(err => {
                      console.error('Error in copying text: ', err);
                    });
                }
              </script>
            </body>
            </html>
          `;

          // HTMLファイル出力
          const outputDir = "./output";
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
          }
          const outputPath = path.join(outputDir, "color_scale.html");
          fs.writeFile(outputPath, html, (err) => {
            if (err) {
              console.error("Error writing HTML file:", err);
            } else {
              console.log(`HTML file saved to ${outputPath}`);
            }
            rl.close();
          });
        }
      );
    }
  );
}
