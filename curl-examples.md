# Automation API Examples

## Start the automation client
1. Run `npm run dev`
2. Open http://localhost:3000 in your browser
3. Click "Active" on the automation client (bottom right corner)

## Example Commands

### 1. Scroll to Sunrise Leads card
```bash
curl -X POST http://localhost:3000/api/automate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "scroll",
    "selector": "a[href=\"/sunrise-leads\"]"
  }'
```

### 2. Click Sunrise Leads card
```bash
curl -X POST http://localhost:3000/api/automate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "click", 
    "selector": "a[href=\"/sunrise-leads\"]"
  }'
```

### 3. Wait for page load
```bash
curl -X POST http://localhost:3000/api/automate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "wait",
    "delay": 2000
  }'
```

### 4. Click Visit Website button
```bash
curl -X POST http://localhost:3000/api/automate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "click",
    "selector": "a[target=\"_blank\"]:has-text(\"Visit website\")"
  }'
```

### 5. Hover over a card
```bash
curl -X POST http://localhost:3000/api/automate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "hover",
    "selector": "a[href=\"/sunrise-leads\"] .group"
  }'
```

### 6. Click at specific coordinates
```bash
curl -X POST http://localhost:3000/api/automate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "click",
    "x": 500,
    "y": 300
  }'
```

### 7. Type in a field
```bash
curl -X POST http://localhost:3000/api/automate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "type",
    "selector": "input[type=\"email\"]",
    "text": "test@example.com"
  }'
```

### 8. Get page screenshot/info
```bash
curl -X POST http://localhost:3000/api/automate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "screenshot"
  }'
```

## Complete Sunrise Leads Workflow
Run these commands in sequence:

```bash
# 1. Scroll to card
curl -X POST http://localhost:3000/api/automate -H "Content-Type: application/json" -d '{"action": "scroll", "selector": "a[href=\"/sunrise-leads\"]"}'

# 2. Click card  
curl -X POST http://localhost:3000/api/automate -H "Content-Type: application/json" -d '{"action": "click", "selector": "a[href=\"/sunrise-leads\"]"}'

# 3. Wait for navigation
curl -X POST http://localhost:3000/api/automate -H "Content-Type: application/json" -d '{"action": "wait", "delay": 2000}'

# 4. Click visit website
curl -X POST http://localhost:3000/api/automate -H "Content-Type: application/json" -d '{"action": "click", "selector": "a[target=\"_blank\"]:has-text(\"Visit website\")"}'
```

## Check Status
```bash
# Check if automation client is running
curl http://localhost:3000/api/automate
```
