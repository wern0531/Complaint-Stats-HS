# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

---

## Firebase 讀取限制與統計

- **免費方案**：Firestore 約每日 5 萬次讀取。為控制用量，本專案採以下方式：
  - **統計（儀表板/分析/地圖）**：只讀一份彙總文件 `statistics/dashboard`，每次約 1 次讀取；並有 **2 分鐘伺服器快取**，同一條件重複請求不重打 Firestore。
  - **搜尋列表**：單次查詢最多 1000 筆；**相同篩選條件在 2 分鐘內**（含換頁）會命中快取，不重複讀取。
  - **寫入後**：新增/匯入/編輯/刪除成功後會清除快取，下次讀取為最新資料。
- **預設行為**：第一次開啟儀表板、分析或地圖時，若彙總檔不存在或為空，API 會自動從 `complaints` 重算並寫入。之後新增/匯入客訴會自動更新統計。
- **手動重建**（可選）：若需強制重算，可呼叫 `POST /api/complaints/rebuild-stats`。
