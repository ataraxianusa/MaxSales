# Rencana Rollback
**Versi:** v01 | **Tanggal:** 2025-06-23 | **Klasifikasi:** Internal

---

## 1. Rollback Triggers

| Trigger | Threshold | Action |
|---------|:---------:|--------|
| Error rate spike | > 1% of requests | Auto-rollback |
| Response time degradation | p95 > 3 seconds | Auto-rollback |
| 5xx errors | > 0.5% of requests | Auto-rollback |
| Data integrity issue | Any | Manual rollback |
| WAF false positive | User complaint | Manual rollback |

---

## 2. Rollback Procedures

### 2.1 Immediate Rollback (Slot Swap)

```bash
# Step 1: Swap production back to previous staging slot
az webapp deployment slot swap \
  --resource-group rg-maxsales-prod \
  --name func-maxsales-api \
  --slot staging \
  --target-slot production

# Step 2: Verify rollback
curl -f https://api.maxsales.qzz.io/status
# Expected: {"status":"ok","version":"v1.0.0-previous"}

# Step 3: Disable canary in Front Door
az afd endpoint update \
  --resource-group rg-maxsales-prod \
  --profile-name afd-maxsales \
  --endpoint-name maxsales-api \
  --disabled true

# Step 4: Notify team
az monitor action-group notification \
  --action-group ag-ops \
  --short-text "ROLLBACK: Production reverted to v1.0.0-previous"
```

### 2.2 DNS Rollback (Alternate)

Jika slot swap gagal, fallback ke DNS-level rollback:

```bash
# Point Cloudflare CNAME back to old infrastructure
# Cloudflare Workers URL: voxia-api.maxsales.workers.dev

# Update DNS record
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${RECORD_ID}" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"content":"voxia-api.maxsales.workers.dev","ttl":60}'
```

---

## 3. Rollback Decision Tree

```
Production Incident Detected
    │
    ├── Error rate > 1%?
    │   ├── YES → AUTO ROLLBACK
    │   └── NO
    │
    ├── p95 > 3 seconds?
    │   ├── YES → AUTO ROLLBACK
    │   └── NO
    │
    ├── 5xx > 0.5%?
    │   ├── YES → AUTO ROLLBACK
    │   └── NO
    │
    └── Data integrity issue?
        ├── YES → MANUAL ROLLBACK (PM approval)
        └── NO → Continue monitoring
```

---

## 4. Post-Rollback Tasks

### Immediate (within 30 min)

| Task | Owner |
|------|-------|
| Confirm rollback successful via status endpoint | DevOps |
| Disable canary routing (100% → 0% new) | DevOps |
| Notify stakeholders (Slack #ops channel) | DevOps |
| Tag rollback commit in Git | DevOps |

### Short-term (within 24 hours)

| Task | Owner |
|------|-------|
| Root cause analysis | BE |
| Fix identified issue | BE |
| Deploy hotfix to staging | DevOps |
| Full regression test | QA |
| Schedule re-deployment | PM |

---

## 5. Git Rollback Workflow

```yaml
# GitHub Actions: rollback.yml
name: Rollback Deployment

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to (commit hash)'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.inputs.version }}
      
      - name: Azure Login
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Deploy Previous Version
        run: |
          func azure functionapp publish func-maxsales-api --build
      
      - name: Swap to Production
        run: |
          az webapp deployment slot swap \
            --resource-group rg-maxsales-prod \
            --name func-maxsales-api \
            --slot staging \
            --target-slot production
      
      - name: Verify Deployment
        run: |
          sleep 30
          curl -f https://api.maxsales.qzz.io/status
```

---

## 6. Rollback Test

Rollback procedure harus diuji **sebelum** go-live:

```bash
# Test rollback flow
az webapp deployment slot swap \
  --resource-group rg-maxsales-test \
  --name func-maxsales-test \
  --slot staging \
  --target-slot production

# Verify old version is running
curl https://func-maxsales-test.azurewebsites.net/status
```

**Frekuensi test:** Setiap deployment minor (setidaknya 1x per sprint)

---

*Dokumen rencana rollback — prosedur rollback untuk migrasi MaxSales*
