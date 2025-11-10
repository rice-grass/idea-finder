#!/bin/bash
cd backend
node src/index.js &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

cd ../frontend  
npm run dev &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

echo ""
echo "======================================"
echo "서버가 시작되었습니다!"
echo "======================================"
echo "프론트엔드: http://localhost:5173/"
echo "백엔드: http://localhost:3000/"
echo ""
echo "종료하려면 Ctrl+C를 누르세요"
echo ""

wait
