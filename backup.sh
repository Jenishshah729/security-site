#!/bin/bash

# Configuration variables
# Change these paths if your setup uses different locations
DB_DIR="/opt/myapp/data"
BACKUP_DIR="/opt/myapp/backups"
DB_NAME="dev.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate a timestamp for the backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sqlite"
TAR_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.tar.gz"

echo "[$(date)] Starting backup of $DB_NAME to $BACKUP_FILE..."

# 1. Safe SQLite backup using the built-in online backup API.
# This is safe to run while the Node.js application is actively writing to the database.
sqlite3 "$DB_DIR/$DB_NAME" ".backup '$BACKUP_FILE'"

if [ $? -eq 0 ]; then
    echo "[$(date)] SQLite backup successful. Compressing..."
    
    # 2. Compress the backup to save disk space
    tar -czf "$TAR_FILE" -C "$BACKUP_DIR" "$(basename "$BACKUP_FILE")"
    
    # Remove the uncompressed backup file
    rm "$BACKUP_FILE"
    echo "[$(date)] Backup compressed to $TAR_FILE"
else
    echo "[$(date)] Error: SQLite backup failed!"
    exit 1
fi

# 3. Prune backups older than 30 days
echo "[$(date)] Pruning backups older than 30 days..."
find "$BACKUP_DIR" -type f -name "db_backup_*.tar.gz" -mtime +30 -exec rm {} \;

# 4. Remote Sync (Uncomment and configure your preferred provider)

# Option A: AWS S3 (Requires aws-cli configured on the server)
# echo "[$(date)] Syncing to AWS S3..."
# aws s3 sync "$BACKUP_DIR" s3://YOUR-BUCKET-NAME/db-backups/ --delete

# Option B: Google Drive / Dropbox via rclone (Requires rclone configured on the server)
# echo "[$(date)] Syncing via rclone..."
# rclone sync "$BACKUP_DIR" gdrive:MyAppBackups/

echo "[$(date)] Backup process complete."
