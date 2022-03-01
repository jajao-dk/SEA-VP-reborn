build-Layer:
	mkdir -p "$(ARTIFACTS_DIR)/python"
	python -m pip install -r requirements.txt --no-dependencies -t "$(ARTIFACTS_DIR)/python"
	find "$(ARTIFACTS_DIR)/python" -name "__pycache__" | xargs rm -r
