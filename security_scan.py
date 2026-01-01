import sys
import re

# Các mẫu Regex nhạy cảm
PATTERNS = {
    "AWS Key": r"AKIA[0-9A-Z]{16}",
    "Private Key": r"-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----",
    "Generic Secret": r"(password|secret|api_key|token)\s*=\s*['\"][a-zA-Z0-9_~\-]{10,}['\"]"
}

def scan_file(filename):
    try:
        # Dùng errors='ignore' để tránh crash khi đọc file binary
        with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            for name, pattern in PATTERNS.items():
                if re.search(pattern, content):
                    # DUNG TIENG ANH DE TRANH LOI WINDOWS
                    print(f"[SECURITY BLOCK] Found {name} in file: {filename}")
                    return True
    except Exception as e:
        print(f"[WARNING] Could not read file {filename}: {e}")
    return False

if __name__ == "__main__":
    files_to_check = sys.argv[1:]
    found_issues = False

    for filename in files_to_check:
        if filename in ["security_scan.py", ".pre-commit-config.yaml"]:
            continue
            
        if scan_file(filename):
            found_issues = True

    if found_issues:
        print(">>> COMMITTEE REJECTED: Secrets detected in code.")
        sys.exit(1) 
    
    sys.exit(0)