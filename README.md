# 🎮 1A2B 數字大決戰 (Bulls and Cows)

一個現代化、精緻且流暢的 1A2B 猜數字遊戲網頁版。本專案包含：
1. **單機模式**：離線練習，挑戰最少時間與步數。
2. **連線多人對戰模式**：利用 WebSocket (Socket.io) 進行即時對戰，支援**隨機配對**與**房間代碼連線**。

---

## 🚀 本地開發與執行

要在您的電腦上運行此專案，您需要先安裝 [Node.js](https://nodejs.org/)。

### 1. 安裝依賴項目
在專案根目錄下開啟終端機（Terminal）並執行：
```bash
npm install
```

### 2. 啟動開發伺服器
執行以下指令，系統會同時啟動**前端 Vite 開發伺服器** (連接埠 5173) 與**後端 Socket.io 伺服器** (連接埠 3001)：
```bash
npm run dev
```
打開瀏覽器訪問 `http://localhost:5173` 即可開始遊玩！

---

## 🌐 部署至 Render (連線多人對戰版)

您可以將此專案免費部署到 [Render](https://render.com/) 雲端平台，讓您與好友可以隨時線上連線對戰。

### 步驟 1：將程式碼推送到 GitHub
1. 在您的 GitHub 帳號上建立一個新的 Repository。
2. 將此專案的所有檔案推送到該 GitHub Repository。

### 步驟 2：在 Render 建立 Web Service
1. 登入 [Render](https://render.com/) 控制台。
2. 點擊 **New +** 按鈕，選擇 **Web Service**。
3. 連結您的 GitHub 帳號並選取剛才建立的 1A2B 專案 Repository。

### 步驟 3：配置 Render 部署設定
在設定頁面中輸入以下參數：
* **Name**: `1a2b-game` (或您喜好的名稱)
* **Region**: 選擇距離您最近的區域 (例如 Singapore)
* **Branch**: `main` (或您推送的分支名稱)
* **Runtime**: `Node`
* **Build Command**:
  ```bash
  npm install && npm run build
  ```
* **Start Command**:
  ```bash
  node server.js
  ```
* **Instance Type**: 選擇 **Free** (免費方案)

### 步驟 4：開始部署
點擊底部的 **Create Web Service**。Render 會自動下載相依套件、編譯 React 前端，並啟動 Node.js 伺服器。
部署完成後，您會獲得一個 `https://xxx.onrender.com` 的網址，分享給好友即可開始連線遊玩！

---

## 📝 1A2B 遊戲規則

系統或玩家雙方會各自設定一個由 **4 個不重複數字 (0-9)** 組成的密碼。
每次猜測後，系統會給予類似 `1A2B` 的判定提示：
* **A** 代表：數值正確且**位置正確**的數字數量。
* **B** 代表：數值正確但**位置錯誤**的數字數量。

**獲勝條件**：率先猜出對手的密碼得到 `4A0B` 即為勝利！
