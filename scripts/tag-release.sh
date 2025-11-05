#!/usr/bin/env bash

set -euo pipefail

SKIP_CONFIRM=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -y|--yes)
            SKIP_CONFIRM=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [-y|--yes]"
            echo "  -y, --yes    Skip confirmation prompt"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

CURRENT=$(cat manifest.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[", ]//g')

echo "Current version: $CURRENT"

IFS='.' read -r -a version_parts <<< "$CURRENT"
MAJOR="${version_parts[0]}"
MINOR="${version_parts[1]}"
PATCH="${version_parts[2]}"

if command -v fzf &> /dev/null; then
    BUMP_TYPE=$(echo -e "patch\nminor\nmajor" | fzf --prompt="Select version bump type: " --height=10 --border --header="Current: $CURRENT")
else
    echo "Select version bump type (default: patch):"
    options=("patch" "minor" "major")
    PS3="Enter selection (1-3, default 1): "
    select BUMP_TYPE in "${options[@]}"; do
        if [[ -n "$BUMP_TYPE" ]]; then
            break
        elif [[ -z "$REPLY" ]]; then
            BUMP_TYPE="patch"
            break
        else
            echo "Invalid selection. Please try again."
        fi
    done
fi

case "$BUMP_TYPE" in
    major)
        NEW_VERSION="$((MAJOR + 1)).0.0"
        ;;
    minor)
        NEW_VERSION="$MAJOR.$((MINOR + 1)).0"
        ;;
    patch)
        NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))"
        ;;
    *)
        echo "Error: Invalid bump type '$BUMP_TYPE'"
        exit 1
        ;;
esac

echo "Bumping version from $CURRENT to $NEW_VERSION"

npm run version

# Confirmation before git operations
if [ "$SKIP_CONFIRM" = false ]; then
    echo ""
    echo "Ready to commit and tag version $NEW_VERSION"
    read -p "Continue? [Y/n] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]] && [[ -n $REPLY ]]; then
        echo "Aborted. Files have been updated but not committed or tagged."
        exit 0
    fi
fi

git commit -m "Update version to $NEW_VERSION"
git tag "$NEW_VERSION"

git push
git push origin tag "$NEW_VERSION"


echo "Version $NEW_VERSION tagged and pushed successfully."
