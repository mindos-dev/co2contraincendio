#!/bin/bash
# ─── OPERIS CO₂ — EC2 User Data Script ───────────────────────────────────────
# Instância: t3.medium (2 vCPU, 4GB RAM) | AMI: Amazon Linux 2023
# Região: sa-east-1 (São Paulo)
# Uso: colar no campo "User Data" ao criar a instância EC2

set -euo pipefail
exec > >(tee /var/log/operis-init.log | logger -t operis-init) 2>&1

echo "=== OPERIS CO₂ — Inicialização EC2 $(date) ==="

# ── Atualizar sistema ─────────────────────────────────────────────────────────
dnf update -y
dnf install -y git curl wget unzip

# ── Instalar Docker ───────────────────────────────────────────────────────────
dnf install -y docker
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

# ── Instalar Docker Compose ───────────────────────────────────────────────────
COMPOSE_VERSION="2.24.5"
curl -SL "https://github.com/docker/compose/releases/download/v${COMPOSE_VERSION}/docker-compose-linux-x86_64" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# ── Instalar AWS CLI v2 ───────────────────────────────────────────────────────
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp/
/tmp/aws/install
rm -rf /tmp/awscliv2.zip /tmp/aws/

# ── Configurar diretório da aplicação ────────────────────────────────────────
mkdir -p /opt/operis
chown ec2-user:ec2-user /opt/operis

# ── Buscar secrets do AWS Secrets Manager ────────────────────────────────────
# Requer IAM Role com permissão secretsmanager:GetSecretValue
SECRET_NAME="operis/co2/production"
REGION="sa-east-1"

echo "Buscando secrets do AWS Secrets Manager..."
SECRET_JSON=$(aws secretsmanager get-secret-value \
  --secret-id "$SECRET_NAME" \
  --region "$REGION" \
  --query SecretString \
  --output text 2>/dev/null || echo "{}")

if [ "$SECRET_JSON" != "{}" ]; then
  # Extrair e exportar variáveis de ambiente
  echo "$SECRET_JSON" | python3 -c "
import json, sys
data = json.load(sys.stdin)
with open('/opt/operis/.env', 'w') as f:
    for k, v in data.items():
        f.write(f'{k}={v}\n')
print('Secrets carregados com sucesso')
"
  chmod 600 /opt/operis/.env
else
  echo "AVISO: Secrets não encontrados. Configure manualmente /opt/operis/.env"
fi

# ── Pull da imagem Docker do ECR ─────────────────────────────────────────────
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "ACCOUNT_ID")
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
IMAGE_NAME="operis-co2"
IMAGE_TAG="latest"

echo "Autenticando no ECR..."
aws ecr get-login-password --region "$REGION" | \
  docker login --username AWS --password-stdin "$ECR_REGISTRY" 2>/dev/null || \
  echo "AVISO: ECR não configurado. Use docker-compose build localmente."

# ── Configurar systemd para auto-start ───────────────────────────────────────
cat > /etc/systemd/system/operis.service << 'EOF'
[Unit]
Description=OPERIS CO2 Contra Incendio Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/operis
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=300
User=ec2-user

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable operis

# ── Configurar rotação de logs ────────────────────────────────────────────────
cat > /etc/logrotate.d/operis << 'EOF'
/var/log/operis-*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 ec2-user ec2-user
}
EOF

# ── Instalar CloudWatch Agent ─────────────────────────────────────────────────
dnf install -y amazon-cloudwatch-agent

cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << 'EOF'
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/operis-init.log",
            "log_group_name": "/operis/ec2/init",
            "log_stream_name": "{instance_id}"
          },
          {
            "file_path": "/opt/operis/logs/app.log",
            "log_group_name": "/operis/app",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "OPERIS/EC2",
    "metrics_collected": {
      "cpu": { "measurement": ["cpu_usage_active"], "metrics_collection_interval": 60 },
      "mem": { "measurement": ["mem_used_percent"], "metrics_collection_interval": 60 },
      "disk": { "measurement": ["disk_used_percent"], "metrics_collection_interval": 300 }
    }
  }
}
EOF

systemctl enable amazon-cloudwatch-agent
systemctl start amazon-cloudwatch-agent

echo "=== OPERIS CO₂ — Inicialização concluída $(date) ==="
echo "Próximos passos:"
echo "  1. Copiar docker-compose.yml para /opt/operis/"
echo "  2. Verificar /opt/operis/.env"
echo "  3. systemctl start operis"
echo "  4. Verificar: docker ps && curl http://localhost:3000/api/health"
