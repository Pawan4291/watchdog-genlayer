# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json

class WatchdogContract(gl.Contract):
    watches: TreeMap[u256, str]
    triggers: TreeMap[u256, str]
    watch_count: u256
    trigger_count: u256

    def __init__(self):
        self.watch_count = u256(0)
        self.trigger_count = u256(0)

    @gl.public.write
    def create_watch(self, url: str, condition: str, discord_webhook: str) -> u256:
        watch_id = self.watch_count
        self.watches[watch_id] = json.dumps({
            "id": int(watch_id),
            "owner": str(gl.message.sender_address),
            "url": url,
            "condition": condition,
            "discord_webhook": discord_webhook,
            "active": True,
            "trigger_count": 0
        })
        self.watch_count = self.watch_count + u256(1)
        return watch_id

    @gl.public.write
    def run_check(self, watch_id: u256) -> str:
        assert watch_id < self.watch_count, "Watch not found"
        watch = json.loads(self.watches[watch_id])
        assert watch["active"], "Watch is not active"

        url = watch["url"]
        condition = watch["condition"]

        def check_condition() -> str:
            response = gl.nondet.web.get(url)
            page_content = response.body.decode("utf-8")
            prompt = f"""You are analyzing a webpage to determine if a specific condition is true.

URL checked: {url}
Condition to evaluate: {condition}

Webpage content:
---
{page_content[:4000]}
---

Respond ONLY in this exact JSON format, no extra text:
{{
  "verdict": true,
  "confidence": "high",
  "evidence": "exact text from page",
  "reasoning": "brief explanation"
}}"""
            return gl.nondet.exec_prompt(prompt)

        raw_result = gl.eq_principle.prompt_comparative(
            check_condition,
            "The output must be a valid JSON object with verdict (bool), confidence (str), evidence (str), and reasoning (str) fields"
        )

        try:
            parsed = json.loads(raw_result)
            verdict = bool(parsed.get("verdict", False))
            confidence = str(parsed.get("confidence", "low"))
            evidence = str(parsed.get("evidence", ""))
            reasoning = str(parsed.get("reasoning", ""))
        except Exception:
            verdict = False
            confidence = "low"
            evidence = ""
            reasoning = str(raw_result)

        if verdict:
            trigger_id = self.trigger_count
            self.triggers[trigger_id] = json.dumps({
                "id": int(trigger_id),
                "watch_id": int(watch_id),
                "verdict": True,
                "confidence": confidence,
                "reasoning": reasoning,
                "evidence": evidence
            })
            self.trigger_count = self.trigger_count + u256(1)
            watch["trigger_count"] = watch["trigger_count"] + 1
            self.watches[watch_id] = json.dumps(watch)

        return json.dumps({
            "verdict": verdict,
            "confidence": confidence,
            "evidence": evidence,
            "reasoning": reasoning,
            "triggered": verdict,
            "watch_id": int(watch_id)
        })

    @gl.public.write
    def deactivate_watch(self, watch_id: u256) -> None:
        assert watch_id < self.watch_count, "Watch not found"
        watch = json.loads(self.watches[watch_id])
        assert watch["owner"] == str(gl.message.sender_address), "Not the owner"
        watch["active"] = False
        self.watches[watch_id] = json.dumps(watch)

    @gl.public.view
    def get_watches(self) -> str:
        result = []
        for i in range(int(self.watch_count)):
            w = json.loads(self.watches[u256(i)])
            result.append({
                "id": w["id"],
                "owner": w["owner"],
                "url": w["url"],
                "condition": w["condition"],
                "active": w["active"],
                "trigger_count": w["trigger_count"],
                "discord_webhook": w.get("discord_webhook", "")
            })
        return json.dumps(result)

    @gl.public.view
    def get_feed(self) -> str:
        result = []
        for i in range(int(self.trigger_count)):
            t = json.loads(self.triggers[u256(i)])
            result.append(t)
        return json.dumps(result)

    @gl.public.view
    def get_trigger(self, trigger_id: u256) -> str:
        assert trigger_id < self.trigger_count, "Trigger not found"
        return self.triggers[trigger_id]

    @gl.public.view
    def get_owner_watches(self, owner: str) -> str:
        result = []
        for i in range(int(self.watch_count)):
            w = json.loads(self.watches[u256(i)])
            if w["owner"].lower() == owner.lower():
                result.append({
                    "id": w["id"],
                    "owner": w["owner"],
                    "url": w["url"],
                    "condition": w["condition"],
                    "active": w["active"],
                    "trigger_count": w["trigger_count"],
                    "discord_webhook": w.get("discord_webhook", "")
                })
        return json.dumps(result)