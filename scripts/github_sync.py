#!/usr/bin/env python3
"""
ECOFARM CIRCULAR — GitHub Direct Integration & Synchronization Script
---------------------------------------------------------------------
Autonomous Python script (zero external dependencies, standard library only).

Features:
1. Automatic verification and initialization of the local Git repository.
2. Automatic remote GitHub repository creation via GitHub REST API if not yet existing.
3. Configures default branch 'main' and 'origin' remote.
4. Adheres strictly to .gitignore exclusions.
5. Indexing (git add) and structured commits.
6. Secure push to GitHub with Personal Access Token (PAT) authentication.

Usage:
    # Interactive mode:
    python scripts/github_sync.py

    # Command-line mode:
    python scripts/github_sync.py --repo ecofarm-circular --token ghp_your_token

    # Options:
    --private       Create GitHub repository in private mode (default: public)
    --message       Custom commit message
    --org           GitHub organization name (optional)
"""

import os
import sys
import json
import shutil
import argparse
import subprocess
import urllib.request
import urllib.error
from datetime import datetime

# ANSI Terminal Colors
GREEN = "\033[92m"
BLUE = "\033[94m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"


def log_info(msg: str):
    print(f"{BLUE}[INFO]{RESET} {msg}")


def log_success(msg: str):
    print(f"{GREEN}[SUCCESS]{RESET} {msg}")


def log_warning(msg: str):
    print(f"{YELLOW}[WARNING]{RESET} {msg}")


def log_error(msg: str):
    print(f"{RED}[ERROR]{RESET} {msg}")


def run_cmd(cmd: list, cwd: str = None) -> tuple[int, str, str]:
    """Execute shell command and return returncode, stdout, and stderr."""
    try:
        proc = subprocess.Popen(
            cmd,
            cwd=cwd or os.getcwd(),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = proc.communicate()
        return proc.returncode, stdout.strip(), stderr.strip()
    except Exception as e:
        return 1, "", str(e)


def check_git_installed() -> bool:
    """Verify Git is installed and available in PATH."""
    code, out, _ = run_cmd(["git", "--version"])
    if code != 0:
        log_error("Git is not installed or not found in PATH.")
        log_info("Please install Git: https://git-scm.com/downloads")
        return False
    log_info(f"Detected Git version: {out}")
    return True


def get_current_user(token: str) -> dict | None:
    """Retrieve the authenticated GitHub user profile using the token."""
    req = urllib.request.Request(
        "https://api.github.com/user",
        headers={
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Ecofarm-Circular-Integration"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        if e.code == 401:
            log_error("GitHub Token is invalid or expired (HTTP 401 Unauthorized).")
        elif e.code == 403:
            log_error("API rate limit exceeded or insufficient token scopes (HTTP 403 Forbidden).")
        else:
            log_error(f"GitHub API Error: {e.code} - {e.reason}")
        return None
    except Exception as e:
        log_error(f"Connection error to GitHub API: {e}")
        return None


def create_remote_repo(token: str, repo_name: str, private: bool = False, org: str = None) -> str | None:
    """Create a new GitHub repository via the REST API."""
    url = f"https://api.github.com/orgs/{org}/repos" if org else "https://api.github.com/user/repos"
    payload = {
        "name": repo_name,
        "description": "ECOFARM CIRCULAR — 3D Industrial Engineering Digital Twin & Biomass Valorization Plant",
        "private": private,
        "auto_init": False
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            "User-Agent": "Ecofarm-Circular-Integration"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            res_data = json.loads(resp.read().decode("utf-8"))
            log_success(f"GitHub repository created successfully: {res_data.get('html_url')}")
            return res_data.get("clone_url")
    except urllib.error.HTTPError as e:
        if e.code == 422:
            log_info(f"Repository '{repo_name}' already exists on GitHub. Proceeding with sync.")
            user_info = get_current_user(token)
            owner = org if org else (user_info.get("login") if user_info else "")
            return f"https://github.com/{owner}/{repo_name}.git"
        else:
            log_error(f"Failed to create repository: HTTP {e.code} - {e.reason}")
            try:
                body = e.read().decode("utf-8")
                log_error(f"Details: {body}")
            except Exception:
                pass
            return None
    except Exception as e:
        log_error(f"Unexpected error while creating repository: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(
        description="Automated synchronization of ECOFARM CIRCULAR to GitHub."
    )
    parser.add_argument("--token", "-t", help="GitHub Personal Access Token (classic with 'repo' scope)")
    parser.add_argument("--repo", "-r", default="ecofarm-circular", help="Target repository name (default: ecofarm-circular)")
    parser.add_argument("--private", action="store_true", help="Create repository in private mode (default: public)")
    parser.add_argument("--org", help="Target GitHub organization name (optional)")
    parser.add_argument("--message", "-m", help="Custom commit message")

    args = parser.parse_args()

    print(f"\n{BOLD}{GREEN}======================================================{RESET}")
    print(f"{BOLD}{GREEN}   ECOFARM CIRCULAR — GitHub Automated Deployment    {RESET}")
    print(f"{BOLD}{GREEN}======================================================{RESET}\n")

    # 1. Verify Git installation
    if not check_git_installed():
        sys.exit(1)

    # 2. Retrieve GitHub Token
    token = args.token or os.environ.get("GITHUB_TOKEN")

    # Check Streamlit secrets if available
    if not token:
        try:
            import toml
            secrets_path = os.path.expanduser("~/.streamlit/secrets.toml")
            if os.path.exists(secrets_path):
                secrets = toml.load(secrets_path)
                token = secrets.get("GITHUB_TOKEN")
        except Exception:
            pass

    if not token:
        try:
            print("To push to GitHub, a Personal Access Token (classic) with 'repo' scope is required.")
            print("Generate one here: https://github.com/settings/tokens/new?scopes=repo&description=ECOFARM-Sync\n")
            token = input(f"{BOLD}Enter your GitHub Token (ghp_...): {RESET}").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nAborted.")
            sys.exit(1)

    if not token:
        log_error("No GitHub Token provided. Aborting synchronization.")
        sys.exit(1)

    # 3. Validate Token
    log_info("Validating GitHub credentials...")
    user_info = get_current_user(token)
    if not user_info:
        log_error("Failed to authenticate with GitHub. Check your token and permissions.")
        sys.exit(1)

    username = user_info.get("login")
    name = user_info.get("name") or username
    log_success(f"Authenticated as: {BOLD}{name}{RESET} (@{username})")

    repo_name = args.repo
    owner = args.org if args.org else username

    # 4. Check/Create Remote Repository
    log_info(f"Target repository: '{owner}/{repo_name}' (Visibility: {'Private' if args.private else 'Public'})...")
    remote_url = create_remote_repo(token, repo_name, private=args.private, org=args.org)

    if not remote_url:
        log_error("Failed to configure remote repository URL.")
        sys.exit(1)

    # 5. Git Repository Initialization
    git_dir = os.path.join(os.getcwd(), ".git")
    if not os.path.exists(git_dir):
        log_info("Initializing local Git repository (git init)...")
        code, out, err = run_cmd(["git", "init"])
        if code != 0:
            log_error(f"git init failed: {err}")
            sys.exit(1)
        run_cmd(["git", "branch", "-M", "main"])
    else:
        log_info("Local Git repository already initialized.")

    # Configure user name and email if not set
    _, git_name, _ = run_cmd(["git", "config", "user.name"])
    if not git_name:
        run_cmd(["git", "config", "user.name", name])
        run_cmd(["git", "config", "user.email", f"{username}@users.noreply.github.com"])

    # 6. Configure Remote with authenticated token
    remote_url_with_auth = f"https://{token}@github.com/{owner}/{repo_name}.git"
    public_remote_url = f"https://github.com/{owner}/{repo_name}.git"

    code, remotes, _ = run_cmd(["git", "remote"])
    if "origin" in remotes.split():
        run_cmd(["git", "remote", "set-url", "origin", remote_url_with_auth])
    else:
        run_cmd(["git", "remote", "add", "origin", remote_url_with_auth])

    # 7. Index and Commit
    log_info("Staging project files (respecting .gitignore)...")
    run_cmd(["git", "add", "."])

    commit_msg = args.message or f"feat: ECOFARM CIRCULAR industrial 3D digital twin release ({datetime.now().strftime('%Y-%m-%d %H:%M')})"
    log_info(f"Committing changes: '{commit_msg}'")
    code, out, err = run_cmd(["git", "commit", "-m", commit_msg])
    if code != 0:
        if "nothing to commit" in out or "nothing to commit" in err:
            log_info("No new local modifications to commit.")
        else:
            log_warning(f"Commit output: {err or out}")

    # 8. Push to GitHub
    log_info("Pushing files to GitHub ('main' branch)...")
    code, out, err = run_cmd(["git", "push", "-u", "origin", "main"])

    if code == 0:
        log_success("\n======================================================")
        log_success("PROJECT PUSHED TO GITHUB SUCCESSFULLY!")
        log_success(f"Repository URL: {BOLD}{public_remote_url}{RESET}")
        log_success("======================================================\n")

        # Sanitize token from local origin URL
        run_cmd(["git", "remote", "set-url", "origin", public_remote_url])
        log_info("Local origin remote sanitized back to clean public URL.")
    else:
        log_error(f"Failed to push to GitHub: {err or out}")
        if "fetch first" in err or "rejected" in err:
            log_warning("Remote repository contains commits not present locally.")
            try:
                retry = input("Force push and overwrite remote (git push --force)? [y/N]: ").strip().lower()
                if retry in ["y", "yes"]:
                    log_info("Force pushing...")
                    c_force, out_f, err_f = run_cmd(["git", "push", "-u", "origin", "main", "--force"])
                    if c_force == 0:
                        log_success(f"\nForce push successful: {BOLD}{public_remote_url}{RESET}\n")
                        run_cmd(["git", "remote", "set-url", "origin", public_remote_url])
                        return
                    else:
                        log_error(f"Force push failed: {err_f or out_f}")
            except (KeyboardInterrupt, EOFError):
                pass
        sys.exit(1)


if __name__ == "__main__":
    main()
