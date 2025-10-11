#!/bin/bash
# Insight Hunter Onboarding Boilerplate Setup Script
# Usage: bash setup.sh

echo "Initializing Insight Hunter Onboarding repo..."

# Repo root
mkdir -p insighthunter-onboarding
cd insighthunter-onboarding || exit

# ------------------------
# FRONTEND
# ------------------------
mkdir -p frontend/src/pages frontend/public

# index.html
cat > frontend/public/index.html <<EOL
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Insight Hunter Onboarding</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/index.tsx"></script>
</body>
</html>
EOL

# index.tsx
cat > frontend/src/index.tsx <<EOL
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
EOL

# App.tsx
cat > frontend/src/App.tsx <<EOL
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import CompanyInfoPage from "./pages/CompanyInfoPage";
import UserInfoPage from "./pages/UserInfoPage";
import ReviewPage from "./pages/ReviewPage";
import ThankYouPage from "./pages/ThankYouPage";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/company" element={<CompanyInfoPage />} />
      <Route path="/user" element={<UserInfoPage />} />
      <Route path="/review" element={<ReviewPage />} />
      <Route path="/thank-you" element={<ThankYouPage />} />
    </Routes>
  </Router>
);

export default App;
EOL

# API helper
cat > frontend/src/api.ts <<EOL
export const getOnboarding = async () => {
  const res = await fetch("/api/onboarding/hello");
  const data = await res.json();
  return data.message;
};

export const submitOnboarding = async (payload) => {
  const res = await fetch("/api/onboarding/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
};
EOL

# Pages
declare -A pages=(
  ["WelcomePage.tsx"]='import React from "react"; import { useNavigate } from "react-router-dom"; const WelcomePage=()=>{ const navigate=useNavigate(); return (<div style={{padding:"2rem"}}><h1>Welcome to Insight Hunter</h1><p>Let'"'"'s get started setting up your account.</p><button onClick={()=>navigate("/company")}>Start</button></div>); }; export default WelcomePage;'
  ["CompanyInfoPage.tsx"]='import React,{useState} from "react"; import { useNavigate } from "react-router-dom"; const CompanyInfoPage=()=>{ const navigate=useNavigate(); const [companyName,setCompanyName]=useState(localStorage.getItem("companyName")||""); const [industry,setIndustry]=useState(localStorage.getItem("industry")||""); const handleNext=()=>{ localStorage.setItem("companyName",companyName); localStorage.setItem("industry",industry); navigate("/user"); }; return (<div style={{padding:"2rem"}}><h1>Company Info</h1><input placeholder="Company Name" value={companyName} onChange={e=>setCompanyName(e.target.value)}/><input placeholder="Industry" value={industry} onChange={e=>setIndustry(e.target.value)}/><button onClick={handleNext}>Next</button></div>); }; export default CompanyInfoPage;'
  ["UserInfoPage.tsx"]='import React,{useState} from "react"; import { useNavigate } from "react-router-dom"; const UserInfoPage=()=>{ const navigate=useNavigate(); const [name,setName]=useState(localStorage.getItem("userName")||""); const [email,setEmail]=useState(localStorage.getItem("userEmail")||""); const handleNext=()=>{ localStorage.setItem("userName",name); localStorage.setItem("userEmail",email); navigate("/review"); }; return (<div style={{padding:"2rem"}}><h1>User Info</h1><input placeholder="Name" value={name} onChange={e=>setName(e.target.value)}/><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><button onClick={handleNext}>Next</button></div>); }; export default UserInfoPage;'
  ["ReviewPage.tsx"]='import React,{useState} from "react"; import { useNavigate } from "react-router-dom"; import { submitOnboarding } from "../api"; const ReviewPage=()=>{ const navigate=useNavigate(); const [loading,setLoading]=useState(false); const data={ companyName:localStorage.getItem("companyName"), industry:localStorage.getItem("industry"), userName:localStorage.getItem("userName"), userEmail:localStorage.getItem("userEmail") }; const handleSubmit=async()=>{ setLoading(true); await submitOnboarding(data); setLoading(false); navigate("/thank-you"); }; return (<div style={{padding:"2rem"}}><h1>Review Your Info</h1><pre>{JSON.stringify(data,null,2)}</pre><button onClick={handleSubmit} disabled={loading}>{loading?"Submitting...":"Submit"}</button></div>); }; export default ReviewPage;'
  ["ThankYouPage.tsx"]='import React from "react"; const ThankYouPage=()=> (<div style={{padding:"2rem"}}><h1>Thank You!</h1><p>Your onboarding is complete.</p></div>); export default ThankYouPage;'
)

for file in "${!pages[@]}"; do
  echo "${pages[$file]}" > frontend/src/pages/$file
done

# Frontend package.json
cat > frontend/package.json <<EOL
{
  "name": "insighthunter-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.15.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.1.0"
  }
}
EOL

cat > frontend/tsconfig.json <<EOL
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "jsx": "react-jsx",
    "moduleResolution": "Node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
EOL

# ------------------------
# BACKEND
# ------------------------
mkdir -p backend/api

cat > backend/api/onboarding.ts <<EOL
import { Router } from "itty-router";

const router = Router();

router.get("/hello", () => {
  return new Response(JSON.stringify({ message: "Welcome to Insight Hunter Onboarding API!" }), {
    headers: { "Content-Type": "application/json" },
  });
});

router.post("/submit", async (req) => {
  const data = await req.json();
  console.log("Onboarding submitted:", data);
  return new Response(JSON.stringify({ status: "success" }), {
    headers: { "Content-Type": "application/json" },
  });
});

router.all("*", () => new Response("Not Found", { status: 404 }));

export default router;
EOL

cat > backend/package.json <<EOL
{
  "name": "insighthunter-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "api/onboarding.ts",
  "scripts": {
    "dev": "wrangler dev",
    "build": "echo 'No build step needed for backend'"
  },
  "dependencies": {
    "itty-router": "^2.6.2"
  }
}
EOL

cat > backend/tsconfig.json <<EOL
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["api"]
}
EOL

# ------------------------
# WRANGLER CONFIG
# ------------------------
cat > wrangler.toml <<EOL
name = "insighthunter-onboarding"
main = "backend/api/onboarding.ts"
compatibility_date = "2025-10-03"
type = "javascript"

[build]
command = "npm install && npm run build --workspace frontend"

[dev]
local_protocol = "http"
port = 8787

[site]
bucket = "frontend/dist"
entry-point = "frontend"
EOL

# ------------------------
# README
# ------------------------
cat > README.md <<EOL
# Insight Hunter Onboarding (Cloudflare Worker + React)

✅ Multi-step onboarding (Welcome → Company → User → Review → Thank You)  
✅ Frontend: React + React Router  
✅ Backend: Cloudflare Worker API endpoints (/hello, /submit)  
✅ Deployment-ready: drop into GitHub and deploy

## Development
npm install
npm run dev --workspace frontend
wrangler dev

## Deployment
wrangler publish
EOL

# ------------------------
# INSTALL DEPENDENCIES
# ------------------------
echo "Installing frontend and backend dependencies..."
(cd frontend && npm install)
(cd backend && npm install)

echo "✅ Setup complete! Repo is ready at $(pwd)"
echo "Run 'npm run dev --workspace frontend' and 'wrangler dev' to start locally." 
