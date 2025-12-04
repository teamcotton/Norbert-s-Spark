#!/bin/bash
set -euo pipefail
# PostgreSQL Docker Best Practices Verification Script

echo "==================================="
echo "PostgreSQL Docker Health Check"
echo "==================================="
echo ""

# Check container status
echo "1. Container Status:"
docker compose ps
echo ""

# Check resource limits
echo "2. Resource Usage:"
docker stats level2gym-postgres --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
echo ""

# Check PostgreSQL version
echo "3. PostgreSQL Version:"
docker compose exec postgres psql -U postgres -d level2gym -c "SELECT version();"
echo ""

# Check installed extensions
echo "4. Installed Extensions:"
docker compose exec postgres psql -U postgres -d level2gym -c "\dx"
echo ""

# Check preloaded libraries
echo "5. Shared Preload Libraries:"
docker compose exec postgres psql -U postgres -d level2gym -c "SHOW shared_preload_libraries;"
echo ""

# Check memory configuration
echo "6. Memory Configuration:"
docker compose exec postgres psql -U postgres -d level2gym -c "
SELECT 
  name, 
  setting, 
  unit,
  short_desc
FROM pg_settings 
WHERE name IN (
  'shared_buffers',
  'effective_cache_size',
  'work_mem',
  'maintenance_work_mem',
  'max_connections'
)
ORDER BY name;
"
echo ""

# Check WAL configuration
echo "7. WAL Configuration:"
docker compose exec postgres psql -U postgres -d level2gym -c "
SELECT 
  name, 
  setting, 
  unit
FROM pg_settings 
WHERE name IN (
  'wal_level',
  'wal_compression',
  'max_wal_size',
  'min_wal_size'
)
ORDER BY name;
"
echo ""

# Check network configuration
echo "8. Docker Network:"
docker network inspect $(docker compose ps -q postgres | xargs docker inspect --format='{{range $net,$v := .NetworkSettings.Networks}}{{$net}}{{end}}')
echo ""

# Check volumes
echo "9. Docker Volumes:"
docker volume ls | grep backend_postgres
echo ""

# Check health status
echo "10. Health Check Status:"
docker inspect level2gym-postgres --format='{{.State.Health.Status}}'
echo ""

# Sample query statistics (if any queries have run)
echo "11. Query Statistics (top 5):"
docker compose exec postgres psql -U postgres -d level2gym -c "
SELECT 
  substring(query, 1, 50) as query,
  calls,
  total_exec_time::numeric(10,2) as total_ms,
  mean_exec_time::numeric(10,2) as mean_ms
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 5;
" 2>/dev/null || echo "No query statistics available yet (database just initialized)"
echo ""

echo "==================================="
echo "✅ Verification Complete"
echo "==================================="
