#!/usr/bin/env bash
set -euo pipefail

APP=ivys
REPO="JustinLeoni/ivys"

MUTED='\033[0;2m'
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

usage() {
    cat <<EOF
IvysCode Installer

Usage: install.sh [options]

Options:
    -h, --help              Display this help message
    -v, --version <tag>     Install a specific release tag (e.g., v2.0.31)
    -b, --binary <path>     Install from a local binary instead of downloading
        --no-modify-path    Don't modify shell config files (.zshrc, .bashrc, etc.)

Examples:
    curl -fsSL https://raw.githubusercontent.com/${REPO}/main/install | bash
    curl -fsSL https://raw.githubusercontent.com/${REPO}/main/install | bash -s -- --version v2.0.31
    ./install --binary /path/to/ivys
EOF
}

requested_version=${VERSION:-}
no_modify_path=false
binary_path=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help) usage; exit 0 ;;
        -v|--version)
            if [[ -n "${2:-}" ]]; then requested_version="$2"; shift 2; else echo -e "${RED}Error: --version requires a version argument${NC}"; exit 1; fi ;;
        -b|--binary)
            if [[ -n "${2:-}" ]]; then binary_path="$2"; shift 2; else echo -e "${RED}Error: --binary requires a path argument${NC}"; exit 1; fi ;;
        --no-modify-path) no_modify_path=true; shift ;;
        *) echo -e "${RED}Warning: Unknown option '$1'${NC}" >&2; shift ;;
    esac
done

INSTALL_DIR="$HOME/.ivys/bin"
mkdir -p "$INSTALL_DIR"

if [ -n "$binary_path" ]; then
    if [ ! -f "$binary_path" ]; then echo -e "${RED}Error: Binary not found at ${binary_path}${NC}"; exit 1; fi
    cp "$binary_path" "$INSTALL_DIR/$APP"
    chmod +x "$INSTALL_DIR/$APP"
    echo -e "${GREEN}Installed ${APP} from ${binary_path}${NC}"
else
    raw_os=$(uname -s)
    os=$(echo "$raw_os" | tr '[:upper:]' '[:lower:]')
    case "$raw_os" in
      Darwin*) os="darwin" ;;
      Linux*) os="linux" ;;
      MINGW*|MSYS*|CYGWIN*) os="windows" ;;
    esac

    arch=$(uname -m)
    [[ "$arch" == "aarch64" ]] && arch="arm64"
    [[ "$arch" == "x86_64" ]] && arch="x64"

    if [ "$os" = "darwin" ] && [ "$arch" = "x64" ]; then
      rosetta_flag=$(sysctl -n sysctl.proc_translated 2>/dev/null || echo 0)
      [[ "$rosetta_flag" == "1" ]] && arch="arm64"
    fi

    combo="$os-$arch"
    case "$combo" in
      linux-x64|linux-arm64|darwin-x64|darwin-arm64|windows-x64|windows-arm64) ;;
      *) echo -e "${RED}Unsupported OS/Arch: $os/$arch${NC}"; exit 1 ;;
    esac

    if [ -z "$requested_version" ]; then
        metadata=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest")
        requested_version=$(echo "$metadata" | sed -n 's/.*"tag_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
        if [ -z "$requested_version" ]; then echo -e "${RED}Failed to fetch latest release${NC}"; exit 1; fi
    fi

    requested_version="${requested_version#v}"
    tag="v${requested_version}"

    asset="ivys-${os}-${arch}.tar.gz"
    url="https://github.com/${REPO}/releases/download/${tag}/${asset}"

    tmpdir=$(mktemp -d)
    trap 'rm -rf "$tmpdir"' EXIT
    echo -e "${MUTED}Downloading ${APP} ${tag} (${combo})...${NC}"
    if ! curl -fL --progress-bar "$url" -o "$tmpdir/$asset"; then
        echo -e "${RED}Failed to download ${url}${NC}"; exit 1
    fi

    tar -xzf "$tmpdir/$asset" -C "$tmpdir"
    bin_path=$(find "$tmpdir" -type f -name "$APP" | head -n1)
    if [ -z "$bin_path" ]; then echo -e "${RED}Binary not found in archive${NC}"; exit 1; fi
    cp "$bin_path" "$INSTALL_DIR/$APP"
    chmod +x "$INSTALL_DIR/$APP"
    echo -e "${GREEN}Installed ${APP} ${tag}${NC}"
fi

# Modify PATH
if [ "$no_modify_path" = false ]; then
    case ":$PATH:" in
        *":$INSTALL_DIR:"*) ;;
        *)
            shell_config=""
            if [ -n "${ZSH_VERSION:-}" ] || [ "$(basename "${SHELL:-}")" = "zsh" ]; then shell_config="$HOME/.zshrc"
            elif [ -n "${BASH_VERSION:-}" ] || [ "$(basename "${SHELL:-}")" = "bash" ]; then shell_config="$HOME/.bashrc"
            fi
            if [ -n "$shell_config" ]; then
                if ! grep -q "$INSTALL_DIR" "$shell_config" 2>/dev/null; then
                    echo "export PATH=\"$INSTALL_DIR:\$PATH\"" >> "$shell_config"
                    echo -e "${MUTED}Added ${INSTALL_DIR} to PATH in ${shell_config}${NC}"
                fi
            fi
            ;;
    esac
fi

echo -e "${MUTED}Run '${APP} --version' to verify.${NC}"
