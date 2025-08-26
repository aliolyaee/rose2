To set up a CI/CD pipeline for your NestJS project (shirazidev/blog-nestjs) that deploys to your Ubuntu server using pm2, here’s a step-by-step guide. This is based on common best practices for GitHub Actions + pm2 deployments:

---

### 1. Prerequisites
- Your Ubuntu server must have:
  - Node.js, npm, and pm2 installed.
  - SSH access set up (ideally with SSH keys).
- Your GitHub repository should have access to your server’s SSH key (add as a GitHub Actions secret, e.g., `HOST`, `USER`, `SSH_KEY`).

---

### 2. GitHub Actions Workflow Example

Add a workflow file in `.github/workflows/deploy.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      - name: Build Project
        run: npm run build

      - name: Copy files to server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USER }}
          key: ${{ secrets.SSH_KEY }}
          source: "dist/*"
          target: "/home/${{ secrets.USER }}/blog-nestjs/dist"

      - name: SSH & Restart pm2
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /home/${{ secrets.USER }}/blog-nestjs
            npm install --production
            pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js
```

---

### 3. On Your Ubuntu Server
- Place an `ecosystem.config.js` in your repo root, e.g.:
```js
module.exports = {
  apps: [
    {
      name: 'blog-nestjs',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```
- Make sure the `/home/youruser/blog-nestjs` directory exists and is accessible.

---

### 4. Secrets to Add in GitHub
- `HOST` (your server IP or hostname)
- `USER` (your SSH username)
- `SSH_KEY` (private key for SSH, in PEM format)

---

Would you like a full example `ecosystem.config.js` or help with the GitHub secrets setup? If you want, I can generate the workflow file and ecosystem config file for you!