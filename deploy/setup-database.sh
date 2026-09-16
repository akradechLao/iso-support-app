#!/bin/bash
# ===========================================
# ISO Support App - Database Setup Script
# ===========================================
#
# วิธีใช้:
#   ./setup-database.sh              # Setup SQLite (default)
#   ./setup-database.sh --postgresql # Setup PostgreSQL
#   ./setup-database.sh --reset      # Reset database
#

set -e

# Configuration
DB_DIR="/www/wwwroot/iso-support-app/data"
DB_FILE="${DB_DIR}/iso_progress.db"
BACKUP_DIR="/www/wwwbackups/iso-support-app/database"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# ===========================================
# SQLite Setup
# ===========================================

setup_sqlite() {
    log "Setting up SQLite database..."

    # Create directories
    mkdir -p "$DB_DIR"
    mkdir -p "$BACKUP_DIR"

    # Check if SQLite is installed
    if ! command -v sqlite3 &> /dev/null; then
        log "Installing SQLite..."
        apt-get install -y sqlite3
    fi

    success "SQLite installed: $(sqlite3 --version)"

    # Create database
    if [ ! -f "$DB_FILE" ]; then
        log "Creating database: $DB_FILE"
        sqlite3 "$DB_FILE" << 'EOF'

-- ===========================================
-- ISO Progress System - Database Schema
-- ===========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department_id TEXT,
    role TEXT DEFAULT 'viewer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_th TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ISO Standards table
CREATE TABLE IF NOT EXISTS iso_standards (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ISO Clauses table
CREATE TABLE IF NOT EXISTS iso_clauses (
    id TEXT PRIMARY KEY,
    standard_id TEXT NOT NULL,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    parent_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (standard_id) REFERENCES iso_standards(id),
    FOREIGN KEY (parent_id) REFERENCES iso_clauses(id)
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    department_id TEXT NOT NULL,
    revision TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    owner_id TEXT NOT NULL,
    review_date TEXT,
    approval_status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Document Clauses (junction table)
CREATE TABLE IF NOT EXISTS document_clauses (
    document_id TEXT NOT NULL,
    clause_id TEXT NOT NULL,
    PRIMARY KEY (document_id, clause_id),
    FOREIGN KEY (document_id) REFERENCES documents(id),
    FOREIGN KEY (clause_id) REFERENCES iso_clauses(id)
);

-- Audits table
CREATE TABLE IF NOT EXISTS audits (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    standard_id TEXT NOT NULL,
    department_id TEXT NOT NULL,
    auditor_id TEXT NOT NULL,
    planned_date TEXT NOT NULL,
    completed_date TEXT,
    status TEXT DEFAULT 'planned',
    finding_count INTEGER DEFAULT 0,
    scope TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (standard_id) REFERENCES iso_standards(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (auditor_id) REFERENCES users(id)
);

-- Findings table
CREATE TABLE IF NOT EXISTS findings (
    id TEXT PRIMARY KEY,
    audit_id TEXT NOT NULL,
    clause_id TEXT,
    department_id TEXT NOT NULL,
    severity TEXT DEFAULT 'medium',
    title TEXT NOT NULL,
    description TEXT,
    root_cause TEXT,
    status TEXT DEFAULT 'open',
    owner_id TEXT NOT NULL,
    due_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (audit_id) REFERENCES audits(id),
    FOREIGN KEY (clause_id) REFERENCES iso_clauses(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Corrective Actions (NCR/CAR) table
CREATE TABLE IF NOT EXISTS corrective_actions (
    id TEXT PRIMARY KEY,
    finding_id TEXT,
    reference_no TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    owner_id TEXT NOT NULL,
    department_id TEXT NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    source TEXT,
    evidence TEXT,
    verification TEXT,
    closed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (finding_id) REFERENCES findings(id),
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Legal Requirements table
CREATE TABLE IF NOT EXISTS legal_requirements (
    id TEXT PRIMARY KEY,
    law TEXT NOT NULL,
    type TEXT NOT NULL,
    publication_date TEXT,
    effective_date TEXT,
    department_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    assessment_date TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Risks table
CREATE TABLE IF NOT EXISTS risks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    department_id TEXT NOT NULL,
    likelihood INTEGER DEFAULT 1,
    impact INTEGER DEFAULT 1,
    inherent_score INTEGER DEFAULT 1,
    residual_score INTEGER DEFAULT 1,
    owner_id TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Training table
CREATE TABLE IF NOT EXISTS trainings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    department_id TEXT NOT NULL,
    trainer_id TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'planned',
    attendees INTEGER DEFAULT 0,
    competency_required BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (trainer_id) REFERENCES users(id)
);

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    user_id TEXT,
    related_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_department ON documents(department_id);
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
CREATE INDEX IF NOT EXISTS idx_audits_standard ON audits(standard_id);
CREATE INDEX IF NOT EXISTS idx_findings_audit ON findings(audit_id);
CREATE INDEX IF NOT EXISTS idx_findings_status ON findings(status);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_status ON corrective_actions(status);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_department ON corrective_actions(department_id);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_due_date ON corrective_actions(due_date);
CREATE INDEX IF NOT EXISTS idx_legal_requirements_status ON legal_requirements(status);
CREATE INDEX IF NOT EXISTS idx_risks_department ON risks(department_id);
CREATE INDEX IF NOT EXISTS idx_risks_status ON risks(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);

EOF

        success "Database created: $DB_FILE"
    else
        warning "Database already exists: $DB_FILE"
    fi

    # Show tables
    log "Database tables:"
    sqlite3 "$DB_FILE" ".tables"
}

# ===========================================
# Seed Data
# ===========================================

seed_data() {
    log "Seeding initial data..."

    # Insert ISO Standards
    sqlite3 "$DB_FILE" << 'EOF'
INSERT OR IGNORE INTO iso_standards (id, code, name) VALUES
('9001', 'ISO 9001', 'Quality Management System'),
('14001', 'ISO 14001', 'Environmental Management System'),
('45001', 'ISO 45001', 'Occupational Health & Safety Management System');
EOF

    # Insert Departments
    sqlite3 "$DB_FILE" << 'EOF'
INSERT OR IGNORE INTO departments (id, name, name_th) VALUES
('RD', 'Research & Development', 'ฝ่ายวิจัยและพัฒนา'),
('LAB', 'Laboratory', 'ฝ่ายปฏิบัติการภาคสนาม'),
('SAF', 'Safety', 'ฝ่ายความปลอดภัย'),
('MK', 'Marketing', 'ฝ่ายการตลาด'),
('TEC', 'Technical', 'ฝ่ายเทคนิค'),
('ETEC', 'Electrical Technical', 'ฝ่ายไฟฟ้าเทคนิค'),
('OFF', 'Office', 'ฝ่ายสำนักงาน'),
('HR', 'Human Resources', 'ฝ่ายทรัพยากรบุคคล'),
('LAW', 'Legal', 'ฝ่ายกฎหมาย'),
('ACC', 'Accounting', 'ฝ่ายบัญชี'),
('PUR', 'Purchasing', 'ฝ่ายจัดซื้อ'),
('IT', 'Information Technology', 'ฝ่ายเทคโนโลยีสารสนเทศ'),
('QA', 'Quality Assurance', 'ฝ่ายรับประกันคุณภาพ'),
('PROD', 'Production', 'ฝ่ายผลิต');
EOF

    # Insert Users
    sqlite3 "$DB_FILE" << 'EOF'
INSERT OR IGNORE INTO users (id, name, email, department_id, role) VALUES
('U001', 'สมชาย ใจดี', 'somchai@company.com', 'QA', 'manager'),
('U002', 'สมหญิง รักงาน', 'somying@company.com', 'HR', 'admin'),
('U003', 'วิชัย เก่งมาก', 'wichai@company.com', 'SAF', 'auditor'),
('U004', 'พิมพ์ใจ สดใส', 'pimjai@company.com', 'RD', 'owner'),
('U005', 'ธนวัฒน์ มั่นคง', 'thanawat@company.com', 'TEC', 'owner'),
('U006', 'วรรณา 优美', 'warana@company.com', 'LAB', 'owner'),
('U007', 'ประเสริฐ ดีเลิศ', 'prasert@company.com', 'PROD', 'manager'),
('U008', 'จินดา ระเบียบ', 'jinda@company.com', 'OFF', 'admin'),
('U009', 'นิพนธ์ ถูกต้อง', 'nipon@company.com', 'LAW', 'owner'),
('U010', 'สุภาพร ตรวจสอบ', 'supaporn@company.com', 'ACC', 'auditor'),
('U011', 'กมล ซื้อมา', 'kamol@company.com', 'PUR', 'owner'),
('U012', 'รัตนา ข้อมูล', 'rattana@company.com', 'IT', 'owner'),
('U013', 'อภิชาติ ตลาด', 'apichat@company.com', 'MK', 'owner'),
('U014', 'สุทธิพงศ์ ไฟฟ้า', 'suthipong@company.com', 'ETEC', 'owner'),
('U015', 'มณี ไฟเขียว', 'manee@company.com', 'QA', 'auditor');
EOF

    success "Initial data seeded"
}

# ===========================================
# PostgreSQL Setup
# ===========================================

setup_postgresql() {
    log "Setting up PostgreSQL..."

    # Check if PostgreSQL is installed
    if ! command -v psql &> /dev/null; then
        log "Installing PostgreSQL..."
        apt-get install -y postgresql postgresql-client
    fi

    # Start PostgreSQL
    systemctl enable postgresql
    systemctl start postgresql

    success "PostgreSQL installed"

    # Create database and user
    sudo -u postgres psql << 'EOF'
-- Create user
CREATE USER iso_app WITH PASSWORD 'iso_secure_password_2024';

-- Create database
CREATE DATABASE iso_progress OWNER iso_app;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE iso_progress TO iso_app;
EOF

    success "PostgreSQL database created"

    echo ""
    echo "Database connection string:"
    echo "postgresql://iso_app:iso_secure_password_2024@localhost:5432/iso_progress"
    echo ""
    echo "Add this to your .env.local:"
    echo "DATABASE_URL=postgresql://iso_app:iso_secure_password_2024@localhost:5432/iso_progress"
}

# ===========================================
# Reset Database
# ===========================================

reset_database() {
    log "Resetting database..."

    if [ -f "$DB_FILE" ]; then
        # Backup before reset
        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S).db"
        cp "$DB_FILE" "$BACKUP_DIR/$BACKUP_NAME"
        warning "Backup created: $BACKUP_DIR/$BACKUP_NAME"

        # Reset
        rm -f "$DB_FILE"
        success "Database removed"
    fi

    # Recreate
    setup_sqlite
    seed_data
}

# ===========================================
# Show Status
# ===========================================

show_status() {
    log "Database Status:"

    if [ -f "$DB_FILE" ]; then
        success "Database exists: $DB_FILE"

        # Show table counts
        echo ""
        log "Table record counts:"
        for table in users departments iso_standards iso_clauses documents audits findings corrective_actions legal_requirements risks trainings activity_logs; do
            COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM $table;" 2>/dev/null || echo "0")
            printf "  %-25s %s\n" "$table" "$COUNT"
        done

        # Show database size
        DB_SIZE=$(du -h "$DB_FILE" | cut -f1)
        echo ""
        log "Database size: $DB_SIZE"
    else
        warning "Database not found: $DB_FILE"
    fi

    # Show backups
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
        echo ""
        log "Available backups:"
        ls -lh "$BACKUP_DIR"/*.db 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
    fi
}

# ===========================================
# Main
# ===========================================

main() {
    case "${1}" in
        --postgresql)
            setup_postgresql
            ;;
        --reset)
            reset_database
            ;;
        --status)
            show_status
            ;;
        --seed)
            seed_data
            ;;
        *)
            setup_sqlite
            seed_data
            show_status
            ;;
    esac
}

main "$@"
