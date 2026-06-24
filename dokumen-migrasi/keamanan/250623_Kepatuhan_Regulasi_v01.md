# Kepatuhan Regulasi
**Versi:** v01 | **Tanggal:** 2025-06-23 | **Klasifikasi:** CONFIDENTIAL

---

## 1. Framework Compliance

### 1.1 ISO 27001:2022

| Control | Implementasi | Status |
|---------|-------------|--------|
| A.8.2 Information classification | Semua data bisnis = Internal | ✅ |
| A.8.3 Access control | RBAC + Managed Identity | ✅ |
| A.8.24 Cryptographic controls | TLS 1.2+, AES-256 | ✅ |
| A.12.4 Logging & monitoring | App Insights + Azure Monitor | ✅ |
| A.12.6 Technical vulnerability mgmt | WAF + Dependency scanning (Dependabot) | ✅ |
| A.14.2 Secure development | CI/CD with security gates | ✅ |
| A.18.1 Compliance with legal | Data residency (Southeast Asia) | ✅ |

### 1.2 GDPR Compliance

| Requirement | Implementasi |
|-------------|-------------|
| Data Processing Agreement | Azure DPA (Microsoft) |
| Data Residency | Southeast Asia region |
| Right to Erasure | Cosmos DB TTL + Delete API |
| Data Breach Notification | 72-hour alert via Azure Monitor |
| Consent Management | User consent prompt (frontend) |
| Data Portability | Cosmos DB export (JSON) |

### 1.3 SOC 2

| Trust Principle | Coverage |
|----------------|----------|
| Security | WAF + Private Endpoints + RBAC |
| Availability | Front Door HA + Multi-region DR |
| Confidentiality | Encryption at rest + transit |
| Privacy | Data minimization + GDPR compliance |

---

## 2. Data Classification

| Level | Examples | Storage | Encryption | Retention |
|-------|----------|---------|------------|-----------|
| Public | Business name, industry | Browser cache | None | N/A |
| Internal | Canvas data, strategies | Cosmos DB | AES-256 | 7 years |
| Confidential | API keys, credentials | Key Vault | HSM-backed | Until rotated |
| Restricted | Customer segment PII | Cosmos DB (restricted) | AES-256 + RBAC | 90 days |

---

## 3. Audit Logging

| Resource | Log Type | Retention | Destination |
|----------|----------|-----------|-------------|
| Azure Functions | Function execution logs | 90 days | Log Analytics |
| Cosmos DB | Data plane operations | 90 days | Log Analytics |
| API Management | All requests | 90 days | Log Analytics |
| Key Vault | Read/Write operations | 90 days | Log Analytics |
| Front Door | WAF + Request logs | 90 days | Log Analytics |

---

## 4. Penetration Testing

| Frequency | Scope | Method |
|-----------|-------|--------|
| Annual | Full external + internal | Third-party pentest |
| Quarterly | API endpoints only | Automated (OWASP ZAP) |
| Per release | CI/CD security scan | Dependabot + CodeQL |

---

*Dokumen kepatuhan regulasi — framework compliance untuk MaxSales di Azure*
