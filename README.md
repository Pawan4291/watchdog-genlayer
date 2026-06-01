# 🐕 WATCHDOG

> Monitor any website condition in plain English. AI validators on GenLayer judge it on-chain. Get Discord alerts with tamper-proof blockchain proof.

**Built with:** GenLayer Intelligent Contracts · Next.js · Vercel · MetaMask  
**Cost to build and run:** $0

---

## What It Does

WATCHDOG lets anyone type a plain-English condition like:

> "Bitcoin price is above $100,000"  
> "This job listing has been removed"  
> "The repo has more than 1000 stars"

...and get alerted with **on-chain proof** when it happens.

No crypto knowledge needed. No code. Just describe what you want watched.

---

## Architecture

```
User types condition + Discord webhook
→ Signs with MetaMask
→ Stored in GenLayer Intelligent Contract (Bradbury Testnet)

Vercel Cron (every 30 min):
→ Reads all active watches
→ Calls run_check() for each
→ AI reads the URL live with gl.nondet.web.get()
→ 5 validators reach consensus: TRUE / FALSE
→ Result stored permanently on-chain

If triggered:
→ Discord alert sent with proof link
→ /proof/[id] shows verifiable on-chain data
```

---

## Quick Start

### 1. Deploy the Contract

Open [GenLayer Studio](https://studio.genlayer.com) and paste `contract/watchdog.py`.

Click **Deploy** on Bradbury Testnet. Copy the contract address.

### 2. Clone & Configure

```bash
git clone https://github.com/YOUR_USERNAME/watchdog-genlayer
cd watchdog-genlayer
npm install
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
NEXT_PUBLIC_GENLAYER_RPC=https://rpc-bradbury.genlayer.com
NEXT_PUBLIC_CHAIN_ID=4221
CRON_SECRET=generate-a-random-long-string
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add the same environment variables in Vercel dashboard.

The cron job in `vercel.json` runs automatically every 30 minutes — free on Vercel.

---

## Setting Up MetaMask for GenLayer Bradbury

Add this network to MetaMask:
- **Network Name:** GenLayer Bradbury Testnet
- **RPC URL:** `https://rpc-bradbury.genlayer.com`
- **Chain ID:** `4221`
- **Currency:** GEN

Get testnet tokens from the GenLayer Discord faucet.

---

## File Structure

```
watchdog/
├── contract/
│   └── watchdog.py          ← GenLayer Intelligent Contract
├── pages/
│   ├── index.js             ← Home: create watch + live feed
│   ├── dashboard.js         ← Your active watches
│   ├── proof/[id].js        ← Shareable proof page
│   └── api/
│       ├── create-watch.js  
│       ├── get-feed.js      
│       ├── deactivate.js    
│       └── cron/
│           └── run-checks.js ← Vercel cron
├── components/
│   ├── Navbar.jsx
│   ├── WatchForm.jsx        ← Create new watch
│   ├── TriggerCard.jsx      ← Feed items
│   ├── ValidatorVotes.jsx   ← Shows 5 AI validators
│   └── ProofBlock.jsx       ← On-chain proof display
├── lib/
│   ├── genlayer.js          ← SDK + RPC calls
│   └── notify.js            ← Discord webhook sender
├── styles/globals.css
└── vercel.json              ← Cron schedule
```

---

## GenLayer Builder Program

This project was built for the [GenLayer Builders Program](https://portal.genlayer.foundation/#/builders).

GenLayer's Intelligent Contracts are unique because they:
- Read live web data with `gl.nondet.web.get()`  
- Use AI to judge subjective conditions
- Reach consensus via 5 independent validators (Optimistic Democracy)
- Store verifiable results permanently on-chain

WATCHDOG uses all of these capabilities to create something no other blockchain can do.

---

## Resources

- [GenLayer Docs](https://docs.genlayer.com)
- [GenLayer Studio](https://studio.genlayer.com)
- [GenLayer Discord](https://discord.gg/8Jm4v89VAu)
- [Builders Program](https://portal.genlayer.foundation/#/builders)

---

Built with ❤️ and $0 by a solo dev.
.
