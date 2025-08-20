# LiteLLM Local Proxy (Windows)

Quick start

```powershell
python -m venv .venv
. .\.venv\Scripts\Activate.ps1
pip install "litellm[proxy]"
$env:OPENAI_API_KEY="sk-..."  # your OpenAI key
```

Start the proxy

```powershell
litellm --host 127.0.0.1 --port 8000 --config config.yaml --num-workers 2
```

Point your tool (Cursor/Roo Code/etc.) to:
- Provider: OpenAI
- Base URL: http://localhost:8000
- API Key: your key (or any value if you rely on the env var above)

Notes
- The proxy is free; you still pay the upstream provider (OpenAI).
- Keep logging at INFO for speed.
- To add observability later, set LANGFUSE_* env vars and enable the `langfuse` callback in config.
