# Color Scale Generator

任意の色から 9 色のカラースケールを生成するツールです！

## 🔧 使い方

1. `% yarn dev`を実行する
2. 任意のカラーコードをコンソールから入力
3. 次のような形式で結果が出力！

```
Original: #036A8B
Grayscale: #464646 (Closest: 700)
Generated Color Scale:
┌───────┬─────────┐
│ Level │ Color │
├───────┼─────────┤
│ 100 │ #E3F1F8 │
│ 200 │ #C7E3F1 │
│ 300 │ #A4D0E6 │
│ 400 │ #82BDDB │
│ 500 │ #5CA4CD │
│ 600 │ #3E8FBE │
│ 700 │ #036A8B │ ← originalColor（変化なし）
│ 800 │ #024F69 │
│ 900 │ #013547 │
└───────┴─────────┘
```
