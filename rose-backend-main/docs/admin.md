W# Deploying the Admin Panel on Port 3002 with PM2

This guide describes how to deploy and run the Next.js Admin Panel on port 3002 using pm2 on an Ubuntu server.

---

## 1. Clone the Repository

```bash
git clone https://github.com/aliolyaee/admin-panel.git
cd admin-panel
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Build the Application

```bash
npm run build
```

---

## 4. Start the Application on Port 3002 with PM2

You must set the `PORT` environment variable so that the Next.js app listens on port 3002.

```bash
PORT=3002 pm2 start npm --name "admin-panel" -- run start
```

- `PORT=3002` sets the environment variable so the app runs on port 3002.
- `--name "admin-panel"` gives your process a recognizable name in pm2.
- `-- run start` tells pm2 to run `npm run start`.

---

## 5. Ensure the App Restarts on Server Reboot

Save the current pm2 process list:

```bash
pm2 save
```

Set pm2 to launch on startup:

```bash
pm2 startup
```

Follow the additional instruction pm2 outputs (usually a command to run as sudo).

---

## 6. Managing the Admin Panel with PM2

- **View logs:**  
  ```bash
  pm2 logs admin-panel
  ```
- **Restart:**  
  ```bash
  pm2 restart admin-panel
  ```
- **Stop:**  
  ```bash
  pm2 stop admin-panel
  ```
- **Show running processes:**  
  ```bash
  pm2 list
  ```

---

Start with:

```bash
pm2 start ecosystem.config.js
pm2 save
```

---

**Your admin panel will now always run on port 3002 and pm2 will keep it alive and auto-restart it after server reboots.**