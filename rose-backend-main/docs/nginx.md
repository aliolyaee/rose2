# Nginx Configuration for Multi-Service Deployment

This documentation describes how to configure Nginx to serve three separate services on different subdomains and ports on an Ubuntu server.

## Services Overview

- **Backend API**  
  - **Port:** 3000  
  - **Domain:** `api-youtaab.shirazidev.ir`
- **Frontend (Main App)**  
  - **Port:** 3001  
  - **Domain:** `youtaab.shirazidev.ir`
- **Admin Panel**  
  - **Port:** 3002  
  - **Domain:** `admin-youtaab.shirazidev.ir`

---

## Step 1: Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

---

## Step 2: Create Nginx Server Blocks

Create a new configuration file for your sites:

```bash
sudo nano /etc/nginx/sites-available/youtaab
```

Paste the following configuration:

```nginx
server {
    listen 80;
    server_name api-youtaab.shirazidev.ir;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name youtaab.shirazidev.ir;

    location / {
        proxy_pass         http://localhost:3001;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name admin-youtaab.shirazidev.ir;

    location / {
        proxy_pass         http://localhost:3002;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

Save and exit.

---

## Step 3: Enable the Configuration

Symlink your new configuration file to `sites-enabled`:

```bash
sudo ln -s /etc/nginx/sites-available/youtaab /etc/nginx/sites-enabled/
```

---

## Step 4: Test and Reload Nginx

Test your configuration:

```bash
sudo nginx -t
```

If successful, reload Nginx:

```bash
sudo systemctl reload nginx
```

---

## Step 5: DNS Configuration

Ensure your DNS provider has `A` records for:

- `api-youtaab.shirazidev.ir`
- `youtaab.shirazidev.ir`
- `admin-youtaab.shirazidev.ir`

Each should point to your server's public IP address.

---

## Step 6: (Recommended) Enable SSL

For production, it is highly recommended to serve your sites over HTTPS. Use Let's Encrypt and Certbot:

```bash
sudo apt install python3-certbot-nginx
sudo certbot --nginx
```

Follow the prompts to select your domains and automatically configure SSL.

---

## Additional Tips

- To force HTTP to HTTPS, add this to each server block:
  ```nginx
  if ($scheme != "https") {
      return 301 https://$host$request_uri;
  }
  ```
- To restart Nginx if needed:
  ```bash
  sudo systemctl restart nginx
  ```

---

## Troubleshooting

- Check Nginx status: `sudo systemctl status nginx`
- Check logs: `sudo tail -f /var/log/nginx/error.log`
- Restart if you make changes: `sudo systemctl reload nginx`

---

**Your multi-service setup is now accessible via the configured subdomains!**