#!/bin/bash
# ============================================================
# OPERIS IA — DigitalOcean Droplet Bootstrap
# Ubuntu 22.04 LTS | 4 vCPU / 8GB RAM (s-4vcpu-8gb)
# Região: NYC3 (ou GRU1 quando disponível)
# ============================================================
set -euo pipefail

APP_DIR="/opt/operis"
APP_USER="operis"
REPO_URL="https://github.com/rebecadwg/co2-contra-incendio.git"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# ─── 1. System update ─────────────────────────────────────────────────────────
log "Updating system packages..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git unzip ufw fail2ban htop

# ─── 2. Docker ────────────────────────────────────────────────────────────────
log "Installing Docker..."
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker

# ─── 3. Docker Compose ────────────────────────────────────────────────────────
log "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# ─── 4. App user ──────────────────────────────────────────────────────────────
log "Creating app user..."
useradd -m -s /bin/bash "$APP_USER" || true
usermod -aG docker "$APP_USER"

# ─── 5. App directory ─────────────────────────────────────────────────────────
log "Setting up app directory..."
mkdir -p "$APP_DIR"
chown "$APP_USER:$APP_USER" "$APP_DIR"

# ─── 6. Firewall ──────────────────────────────────────────────────────────────
log "Configuring UFW firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ─── 7. Fail2ban ──────────────────────────────────────────────────────────────
log "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF
systemctl enable fail2ban && systemctl restart fail2ban

# ─── 8. Swap (2GB) ────────────────────────────────────────────────────────────
log "Creating swap file..."
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# ─── 9. Systemd service ───────────────────────────────────────────────────────
log "Creating systemd service..."
cat > /etc/systemd/system/operis.service << EOF
[Unit]
Description=OPERIS IA Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.yml down
User=$APP_USER

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable operis

# ─── 10. Certbot (Let's Encrypt) ──────────────────────────────────────────────
log "Installing Certbot..."
apt-get install -y certbot python3-certbot-nginx

log "Bootstrap complete. Run: cd $APP_DIR && docker-compose up -d"
