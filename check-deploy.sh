#!/bin/bash

echo "🚀 Portal Services - Deploy Check"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Run this script from the project root.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Checking project structure...${NC}"

# Check required files
required_files=(
    "render.yaml"
    "appserver/package.json"
    "appclient/package.json"
    "appserver/server.ts"
    "appserver/database/Database.ts"
    "appclient/src/App.tsx"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file (missing)${NC}"
        exit 1
    fi
done

echo -e "${YELLOW}📦 Checking dependencies...${NC}"

# Check backend dependencies
cd appserver
if npm list --depth=0 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Backend dependencies not installed${NC}"
    echo "Run: cd appserver && npm install"
    exit 1
fi

# Check frontend dependencies
cd ../appclient
if npm list --depth=0 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Frontend dependencies not installed${NC}"
    echo "Run: cd appclient && npm install"
    exit 1
fi

cd ..

echo -e "${YELLOW}🔧 Checking build process...${NC}"

# Test backend build
echo "Testing backend build..."
cd appserver
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend builds successfully${NC}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    echo "Run: cd appserver && npm run build"
    exit 1
fi

# Test frontend build
echo "Testing frontend build..."
cd ../appclient
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend builds successfully${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    echo "Run: cd appclient && npm run build"
    exit 1
fi

cd ..

echo -e "${YELLOW}🗄️ Checking database configuration...${NC}"

# Check if database files exist
if [ -f "appserver/database/init/01-create-tables.sql" ]; then
    echo -e "${GREEN}✅ Database schema found${NC}"
else
    echo -e "${RED}❌ Database schema missing${NC}"
fi

if [ -f "appserver/database/migrations.ts" ]; then
    echo -e "${GREEN}✅ Database migrations found${NC}"
else
    echo -e "${RED}❌ Database migrations missing${NC}"
fi

echo -e "${YELLOW}🌐 Checking API endpoints...${NC}"

# Check if server is running locally
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend server is running locally${NC}"
    
    # Test API endpoints
    if curl -s http://localhost:3001/api/clients > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API endpoints responding${NC}"
    else
        echo -e "${YELLOW}⚠️ API endpoints not responding (server might be starting)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Backend server not running locally${NC}"
    echo "Start with: npm run dev"
fi

echo -e "${YELLOW}📋 Checking render.yaml configuration...${NC}"

# Check render.yaml syntax
if command -v yq > /dev/null 2>&1; then
    if yq eval '.' render.yaml > /dev/null 2>&1; then
        echo -e "${GREEN}✅ render.yaml syntax is valid${NC}"
    else
        echo -e "${RED}❌ render.yaml syntax error${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ yq not installed (optional for YAML validation)${NC}"
fi

echo -e "${YELLOW}🔐 Checking environment variables...${NC}"

# Check if .env files exist
if [ -f "appserver/.env" ]; then
    echo -e "${GREEN}✅ Backend .env file found${NC}"
else
    echo -e "${YELLOW}⚠️ Backend .env file not found (will use Render env vars)${NC}"
fi

if [ -f "appclient/.env" ]; then
    echo -e "${GREEN}✅ Frontend .env file found${NC}"
else
    echo -e "${YELLOW}⚠️ Frontend .env file not found (will use Render env vars)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deploy Check Complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Push your code to GitHub"
echo "2. Connect your repository to Render"
echo "3. Render will automatically detect render.yaml"
echo "4. Configure environment variables in Render dashboard"
echo "5. Deploy!"
echo ""
echo -e "${YELLOW}🌐 Expected URLs after deploy:${NC}"
echo "• Frontend: https://portal-services-frontend.onrender.com"
echo "• Backend: https://portal-services-backend.onrender.com"
echo "• API Health: https://portal-services-backend.onrender.com/health"
echo "• Statistics: https://portal-services-backend.onrender.com/api/stats/business"
echo ""
echo -e "${GREEN}✅ Ready for deployment!${NC}"
