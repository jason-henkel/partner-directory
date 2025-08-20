$ErrorActionPreference = "Stop"

if (-Not (Test-Path ".venv")) {
	python -m venv .venv
}
. .\.venv\Scripts\Activate.ps1

pip install --disable-pip-version-check -q "litellm[proxy]"

if (-Not $env:OPENAI_API_KEY) {
	Write-Host "Set OPENAI_API_KEY before starting the proxy: `$env:OPENAI_API_KEY='sk-...'" -ForegroundColor Yellow
}

litellm --host 127.0.0.1 --port 8000 --config config.yaml --num-workers 2
