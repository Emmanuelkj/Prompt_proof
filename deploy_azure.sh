#!/usr/bin/env bash
set -e

# ==============================================================================
# PromptProof - Automated Azure Linux VM Deployment Script
# Tested on: Ubuntu 22.04 LTS / 24.04 LTS, Debian 12
# ==============================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

CURRENT_USER=$(whoami)
echo "=== Deploying PromptProof on Azure VM ==="
echo "Working directory: $DIR"
echo "Running as user: $CURRENT_USER"

# 1. Update system packages
echo "--> [1/6] Updating system packages and installing prerequisites..."
sudo apt-get update -y
sudo apt-get install -y --no-install-recommends \
    curl \
    git \
    python3 \
    python3-venv \
    python3-pip \
    build-essential \
    nginx \
    ufw

# 2. Install Node.js 20 LTS if missing or outdated
echo "--> [2/6] Verifying Node.js runtime..."
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d'.' -f1 | tr -d 'v')" -lt 18 ]; then
    echo "Installing Node.js 20 LTS via NodeSource..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 3. Setup Python Backend Environment
echo "--> [3/6] Setting up Python virtual environment..."
if [ ! -d "backend/venv" ]; then
    python3 -m venv backend/venv
fi
backend/venv/bin/pip install --upgrade pip
backend/venv/bin/pip install -r backend/requirements.txt

# 4. Build Production Frontend
echo "--> [4/6] Building frontend production bundle..."
cd frontend
npm ci || npm install
npm run build
cd ..

# 5. Configure systemd Service
echo "--> [5/6] Creating systemd service (promptproof.service)..."
SERVICE_FILE="/etc/systemd/system/promptproof.service"

sudo bash -c "cat <<EOF > $SERVICE_FILE
[Unit]
Description=PromptProof Cybernetic Prompt Defense Instrument
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$DIR
Environment=PYTHONPATH=$DIR/backend
Environment=PORT=8000
ExecStart=$DIR/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF"

sudo systemctl daemon-reload
sudo systemctl enable promptproof
sudo systemctl restart promptproof

# 6. Configure Nginx Reverse Proxy (Port 80 -> 8000)
echo "--> [6/6] Configuring Nginx reverse proxy..."
NGINX_CONF="/etc/nginx/sites-available/promptproof"

sudo bash -c "cat <<EOF > $NGINX_CONF
server {
    listen 80;
    server_name _;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;

        # Disable buffering for Server-Sent Events (SSE)
        proxy_buffering off;
        proxy_read_timeout 86400s;
    }
}
EOF"

# Enable site and reload Nginx
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/promptproof
sudo nginx -t
sudo systemctl reload nginx

# Allow traffic in local UFW if enabled
sudo ufw allow 80/tcp >/dev/null 2>&1 || true
sudo ufw allow 443/tcp >/dev/null 2>&1 || true
sudo ufw allow 8000/tcp >/dev/null 2>&1 || true

PUBLIC_IP=$(curl -s ifconfig.me || echo "<YOUR_AZURE_PUBLIC_IP>")

echo ""
echo "=========================================================================="
echo " [SUCCESS] PromptProof is deployed and active on your Azure server!"
echo "=========================================================================="
echo " Direct HTTP Access: http://$PUBLIC_IP"
echo " Backend Port:        http://$PUBLIC_IP:8000"
echo ""
echo " Check service status: sudo systemctl status promptproof"
echo " View real-time logs:  sudo journalctl -u promptproof -f"
echo ""
echo " [CRITICAL AZURE STEP]:"
echo " Go to Azure Portal -> Your VM -> Networking -> Inbound Port Rules"
echo " Add an Inbound Rule to allow Port 80 (HTTP) and Port 8000 (Custom)."
echo "=========================================================================="
