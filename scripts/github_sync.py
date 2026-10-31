#!/usr/bin/env python3
"""
ECOFARM CIRCULAR — GitHub Direct Integration & Synchronization Script
---------------------------------------------------------------------
Script Python autonome (zéro dépendance externe requise, utilise uniquement la bibliothèque standard Python 3).

Fonctionnalités :
1. Vérification et initialisation automatique du dépôt Git local.
2. Création automatique du dépôt distant sur GitHub via l'API REST GitHub (si le dépôt n'existe pas encore).
3. Configuration de la branche principale 'main' et du remote 'origin'.
4. Détection et respect du fichier .gitignore (exclusion de node_modules, .next, etc.).
5. Indexation (git add), commit avec horodatage et message structuré.
6. Push sécurisé vers GitHub avec authentification par Token d'accès personnel (PAT).

Utilisation :
    # Mode interactif :
    python scripts/github_sync.py

    # Mode ligne de commande avec arguments :
    python scripts/github_sync.py --repo ecofarm-circular --token ghp_votre_token

    # Options :
    --private       Créer le dépôt GitHub en mode privé (par défaut : public)
    --message       Message de commit personnalisé
    --org           Nom d'une organisation GitHub (optionnel)
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

# Couleurs ANSI pour terminal
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
    print(f"{YELLOW}[AVERTISSEMENT]{RESET} {msg}")


def log_error(msg: str):
    print(f"{RED}[ERREUR]{RESET} {msg}")


def run_cmd(cmd: list, cwd: str = None) -> tuple[int, str, str]:
    """Exécute une commande shell et retourne le code de retour, stdout et stderr."""
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
    """Vérifie si Git est disponible sur la machine."""
    code, out, _ = run_cmd(["git", "--version"])
    if code != 0:
        log_error("Git n'est pas installé ou n'est pas présent dans le PATH.")
        log_info("Veuillez installer Git : https://git-scm.com/downloads")
        return False
    log_info(f"Version de Git détectée : {out}")
    return True


def get_current_user(token: str) -> dict | None:
    """Récupère le profil de l'utilisateur GitHub connecté via le Token."""
    req = urllib.request.Request(
        "https://api.github.com/user",
        headers={
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Ecofarm-Circular-Integration"
        }
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            return data
    except urllib.error.HTTPError as e:
        log_error(f"Échec d'authentification GitHub (HTTP {e.code}) : {e.reason}")
        if e.code == 401:
            log_error("Votre Token GitHub est invalide ou expiré.")
        return None
    except Exception as e:
        log_error(f"Erreur de connexion à l'API GitHub : {e}")
        return None


def repo_exists(owner: str, repo_name: str, token: str) -> bool:
    """Vérifie si le dépôt distant existe déjà sur GitHub."""
    req = urllib.request.Request(
        f"https://api.github.com/repos/{owner}/{repo_name}",
        headers={
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Ecofarm-Circular-Integration"
        }
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status == 200
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return False
        return False
    except Exception:
        return False


def create_github_repo(repo_name: str, description: str, is_private: bool, token: str, org: str = None) -> str | None:
    """Crée un nouveau dépôt sur GitHub via l'API REST."""
    payload = {
        "name": repo_name,
        "description": description,
        "private": is_private,
        "has_issues": True,
        "has_projects": True,
        "has_wiki": False,
        "auto_init": False
    }

    url = f"https://api.github.com/orgs/{org}/repos" if org else "https://api.github.com/user/repos"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"token {token}",
            "Content-Type": "application/json",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Ecofarm-Circular-Integration"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            clone_url = data.get("clone_url")
            log_success(f"Dépôt créé avec succès sur GitHub : {data.get('html_url')}")
            return clone_url
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode()
        log_error(f"Impossible de créer le dépôt (HTTP {e.code}) : {err_msg}")
        return None
    except Exception as e:
        log_error(f"Erreur inattendue lors de la création : {e}")
        return None


def load_dotenv_file(root_dir: str):
    """Charge automatiquement les variables d'environnement depuis .env.local ou .env."""
    for filename in [".env.local", ".env"]:
        env_path = os.path.join(root_dir, filename)
        if os.path.isfile(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip('"').strip("'")
                            if k not in os.environ and v:
                                os.environ[k] = v
                log_info(f"Fichier de configuration d'environnement chargé : {filename}")
                break
            except Exception:
                pass


def main():
    print(f"\n{BOLD}{GREEN}======================================================{RESET}")
    print(f"{BOLD}{GREEN}  ECOFARM CIRCULAR — INTÉGRATION DIRECTE DANS GITHUB  {RESET}")
    print(f"{BOLD}{GREEN}======================================================{RESET}\n")

    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    os.chdir(project_root)
    load_dotenv_file(project_root)

    parser = argparse.ArgumentParser(description="Synchronisation directe du projet ECOFARM CIRCULAR avec GitHub")
    parser.add_argument("--repo", type=str, help="Nom du dépôt GitHub (ex: ecofarm-circular)")
    parser.add_argument("--token", type=str, help="GitHub Personal Access Token (PAT)")
    parser.add_argument("--message", type=str, default=None, help="Message du commit Git")
    parser.add_argument("--private", action="store_true", help="Rendre le dépôt privé sur GitHub")
    parser.add_argument("--org", type=str, default=None, help="Nom de l'organisation GitHub cible (optionnel)")

    args = parser.parse_args()

    # 1. Vérification de Git
    if not check_git_installed():
        sys.exit(1)

    # 2. Récupération du Token GitHub (priorité : argument > variable d'environnement / .env > saisie interactive)
    token = args.token or os.environ.get("GITHUB_TOKEN")
    if not token or token == "ghp_YOUR_GITHUB_PERSONAL_ACCESS_TOKEN":
        print(f"{YELLOW}Pour vous connecter à GitHub, vous devez utiliser un Personal Access Token (PAT).{RESET}")
        print("Pour générer un token en 1 minute : Rendez-vous sur https://github.com/settings/tokens")
        print("Cochez la permission 'repo' (Full control of private repositories).\n")
        try:
            token = input(f"{BOLD}Entrez votre GitHub Token (PAT) : {RESET}").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nOpération annulée.")
            sys.exit(0)

    if not token:
        log_error("Aucun Token GitHub fourni. Arrêt du script.")
        sys.exit(1)

    # 3. Test de validité du token et identification de l'utilisateur
    log_info("Vérification de l'authentification GitHub...")
    user_info = get_current_user(token)
    if not user_info:
        sys.exit(1)

    username = user_info.get("login")
    log_success(f"Authentifié en tant que : {BOLD}@{username}{RESET} ({user_info.get('name') or username})")

    # Configuration automatique de l'auteur Git si manquant
    _, user_name_val, _ = run_cmd(["git", "config", "user.name"])
    _, user_email_val, _ = run_cmd(["git", "config", "user.email"])
    if not user_name_val:
        git_author_name = user_info.get("name") or username
        run_cmd(["git", "config", "user.name", git_author_name])
        log_info(f"Configuration automatique de git user.name : '{git_author_name}'")
    if not user_email_val:
        git_author_email = user_info.get("email") or f"{username}@users.noreply.github.com"
        run_cmd(["git", "config", "user.email", git_author_email])
        log_info(f"Configuration automatique de git user.email : '{git_author_email}'")

    # 4. Nom du dépôt (priorité : argument > GITHUB_REPO dans .env > défaut)
    repo_name = args.repo or os.environ.get("GITHUB_REPO")
    if not repo_name:
        default_name = "ecofarm-circular"
        try:
            input_name = input(f"Nom du dépôt GitHub [{default_name}] : ").strip()
            repo_name = input_name if input_name else default_name
        except (KeyboardInterrupt, EOFError):
            print("\nOpération annulée.")
            sys.exit(0)

    owner = args.org if args.org else username
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    os.chdir(project_root)
    log_info(f"Répertoire du projet : {project_root}")

    # 5. Vérifier ou créer le dépôt distant
    log_info(f"Vérification de l'existence du dépôt '{owner}/{repo_name}' sur GitHub...")
    if repo_exists(owner, repo_name, token):
        log_info(f"Le dépôt distant 'https://github.com/{owner}/{repo_name}' existe déjà.")
    else:
        log_info(f"Le dépôt n'existe pas encore. Création automatique sur GitHub...")
        desc = "ECOFARM CIRCULAR — 3D Industrial Engineering Visualization and Digital Twin pilot plant."
        created_url = create_github_repo(repo_name, desc, args.private, token, args.org)
        if not created_url:
            log_error("Impossible de poursuivre sans dépôt distant.")
            sys.exit(1)

    # 6. Initialisation et configuration Git locale
    log_info("Préparation du dépôt Git local...")
    code, _, _ = run_cmd(["git", "status"])
    if code != 0:
        log_info("Initialisation de Git (git init)...")
        run_cmd(["git", "init"])

    # Configuration de la branche 'main'
    run_cmd(["git", "branch", "-M", "main"])

    # Configuration du remote origin avec token sécurisé pour le push
    remote_url_with_auth = f"https://{token}@github.com/{owner}/{repo_name}.git"
    public_remote_url = f"https://github.com/{owner}/{repo_name}.git"

    # Vérifier les remotes existants
    code, remotes, _ = run_cmd(["git", "remote"])
    if "origin" in remotes.split():
        run_cmd(["git", "remote", "set-url", "origin", remote_url_with_auth])
    else:
        run_cmd(["git", "remote", "add", "origin", remote_url_with_auth])

    # 7. Indexation (git add) et Commit
    log_info("Indexation des fichiers du projet (respect de .gitignore)...")
    run_cmd(["git", "add", "."])

    commit_msg = args.message or f"feat: ECOFARM CIRCULAR industrial 3D digital twin release ({datetime.now().strftime('%Y-%m-%d %H:%M')})"
    log_info(f"Commit des modifications avec le message : '{commit_msg}'")
    code, out, err = run_cmd(["git", "commit", "-m", commit_msg])
    if code != 0:
        if "nothing to commit" in out or "nothing to commit" in err:
            log_info("Aucune nouvelle modification locale à commiter.")
        else:
            log_warning(f"Sortie commit : {err or out}")

    # 8. Push vers GitHub
    log_info(f"Envoi des fichiers vers GitHub (branche 'main')...")
    code, out, err = run_cmd(["git", "push", "-u", "origin", "main"])

    if code == 0:
        log_success("\n======================================================")
        log_success(f"PROJET ENVOYÉ SUR GITHUB AVEC SUCCÈS !")
        log_success(f"URL de votre dépôt : {BOLD}{public_remote_url}{RESET}")
        log_success("======================================================\n")

        # Nettoyage du token dans la configuration locale pour éviter de laisser le secret en clair
        run_cmd(["git", "remote", "set-url", "origin", public_remote_url])
        log_info("Le remote local a été réinitialisé vers l'URL publique propre (sans token en clair).")
    else:
        # En cas de conflit (dépôt distant non vide), proposer le push forcé
        log_error(f"Échec de l'envoi vers GitHub : {err or out}")
        if "fetch first" in err or "rejected" in err:
            log_warning("Le dépôt distant contient des fichiers qui n'existent pas en local.")
            try:
                retry = input("Voulez-vous forcer la synchronisation (git push --force) ? [o/N] : ").strip().lower()
                if retry in ["o", "oui", "y", "yes"]:
                    log_info("Envoi forcé en cours...")
                    c_force, out_f, err_f = run_cmd(["git", "push", "-u", "origin", "main", "--force"])
                    if c_force == 0:
                        log_success(f"\nSynchronisation forcée réussie : {BOLD}{public_remote_url}{RESET}\n")
                        run_cmd(["git", "remote", "set-url", "origin", public_remote_url])
                        return
                    else:
                        log_error(f"Échec du push forcé : {err_f or out_f}")
            except (KeyboardInterrupt, EOFError):
                pass
        sys.exit(1)


if __name__ == "__main__":
    main()
