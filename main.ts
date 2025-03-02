function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.substring(1, 3), 16),
    parseInt(hex.substring(3, 5), 16),
    parseInt(hex.substring(5, 7), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function interpolateColor(
  start: [number, number, number],
  end: [number, number, number],
  factor: number
): [number, number, number] {
  return [
    Math.round(start[0] + (end[0] - start[0]) * factor),
    Math.round(start[1] + (end[1] - start[1]) * factor),
    Math.round(start[2] + (end[2] - start[2]) * factor),
  ];
}

function getGrayscaleColor(hex: string): string {
  let [r, g, b] = hexToRgb(hex);
  let gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  return rgbToHex(gray, gray, gray);
}

function getClosestGrayLevel(grayHex: string): string {
  const grayscaleScale: { [key: string]: number } = {
    "000": 255,
    "100": 230,
    "200": 204,
    "300": 179,
    "400": 153,
    "500": 128,
    "600": 102,
    "700": 77,
    "800": 51,
    "900": 26,
    "1000": 0,
  };

  let gray = hexToRgb(grayHex)[0]; // 無彩色なのでR=G=B
  return Object.keys(grayscaleScale).reduce((closest, level) => {
    return Math.abs(grayscaleScale[level] - gray) <
      Math.abs(grayscaleScale[closest] - gray)
      ? level
      : closest;
  }, "000");
}

function generateColorScale(
  centerLevel: string,
  centerColor: string
): { [key: string]: string } {
  const minColor: [number, number, number] = [255, 255, 255]; // 000 = #FFFFFF
  const maxColor: [number, number, number] = [0, 0, 0]; // 1000 = #000000
  const centerRGB: [number, number, number] = hexToRgb(centerColor);

  const scaleLevels = [
    "000",
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
    "1000",
  ];
  let centerIndex = scaleLevels.indexOf(centerLevel);

  let result: { [key: string]: string } = {};

  for (let i = 1; i < scaleLevels.length - 1; i++) {
    // 000と1000をスキップ
    let factor: number;

    if (i < centerIndex) {
      // 明るい側（白寄り）
      factor = i / centerIndex;
    } else if (i > centerIndex) {
      // 暗い側（黒寄り）
      factor = (i - centerIndex) / (scaleLevels.length - centerIndex - 1);
    } else {
      factor = 0; // 中心の色は変化なし
    }

    let interpolatedRGB: [number, number, number] = interpolateColor(
      i < centerIndex ? minColor : centerRGB, // 明るい側は白から補間
      i > centerIndex ? maxColor : centerRGB, // 暗い側は黒から補間
      factor
    );

    result[scaleLevels[i]] = rgbToHex(
      interpolatedRGB[0],
      interpolatedRGB[1],
      interpolatedRGB[2]
    );
  }

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
      const grayscaleColor = getGrayscaleColor(originalColor);
      const closestLevel = getClosestGrayLevel(grayscaleColor);
      const scaleColors = generateColorScale(closestLevel, originalColor); // originalColorを渡す

      console.log(`Original: ${originalColor}`);
      console.log(`Grayscale: ${grayscaleColor} (Closest: ${closestLevel})`);
      console.log("Generated Color Scale:");
      console.table(scaleColors);

      rl.close();
    }
  );
}
