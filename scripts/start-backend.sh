#!/bin/bash
pkill -9 -f tensonly-backend 2>/dev/null
sleep 2

cd /home/z/my-project/backend
export $(grep -v '^#' .env | xargs)
export JAVA_HOME=/home/z/my-project/tools/jdk-21.0.11+10

setsid nohup /home/z/my-project/tools/jdk-21.0.11+10/bin/java -jar target/tensonly-backend-1.0.0.jar > /tmp/backend.log 2>&1 &
disown

echo "Backend starting..."
sleep 12

if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
  echo "BACKEND UP"
  curl -s http://localhost:8080/actuator/health
else
  echo "BACKEND FAILED"
  tail -20 /tmp/backend.log
fi
