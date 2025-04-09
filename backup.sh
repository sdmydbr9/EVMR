#!/bin/bash

# VetSphere Database Backup Script
# This script creates a backup of the PostgreSQL database used by the VetSphere system

# Set variables
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/home/$(whoami)/vetsphere_backups"
BACKUP_FILE="vetsphere_db_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

echo "Starting database backup at $(date)"

# Perform the backup using docker compose
docker compose exec -T vetsphere-db pg_dump -U vetsphere_user vetsphere_database > "${BACKUP_DIR}/${BACKUP_FILE}"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup successful: ${BACKUP_DIR}/${BACKUP_FILE}"
  echo "Backup size: $(du -h ${BACKUP_DIR}/${BACKUP_FILE} | cut -f1)"
  
  # Compress the backup
  gzip "${BACKUP_DIR}/${BACKUP_FILE}"
  echo "Compressed backup: ${BACKUP_DIR}/${BACKUP_FILE}.gz"
  
  # Remove backups older than 30 days
  find ${BACKUP_DIR} -name "vetsphere_db_backup_*.gz" -type f -mtime +30 -delete
  echo "Removed backups older than 30 days"
else
  echo "Backup failed!"
  exit 1
fi

echo "Backup process completed at $(date)"

# To schedule this script as a daily cron job, run:
# crontab -e
# Add the line (for a daily backup at 2 AM):
# 0 2 * * * /path/to/backup.sh >> /home/$(whoami)/vetsphere_backups/backup.log 2>&1 