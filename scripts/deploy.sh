#!/usr/bin/env bash
# Build locally and ship only the compiled app to be-jogja.com (server3).
#
# The server keeps no source and never builds: it runs build/index.js under
# systemd (deploy/beacon-prod.service). Each deploy uploads build/ into a new
# app/releases/<stamp>-<sha>, repoints app/current, restarts the service and
# rolls back to the previous release if the site does not come up.
#
# Usage: npm run deploy   (needs `ssh server3` access)
set -euo pipefail

HOST=${DEPLOY_HOST:-server3}
APP=/var/www/vhosts/be-jogja.com/app
OWNER=be-jogja.com_irhvuw5z3o:psacln
KEEP=3

cd "$(dirname "$0")/.."

# Every release maps to a commit, so refuse to ship uncommitted changes.
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
	echo "Uncommitted changes. Commit or stash them before deploying." >&2
	exit 1
fi

REL=$(date +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)

npm run build

echo "Uploading $REL ..."
COPYFILE_DISABLE=1 tar --no-xattrs -czf - build |
	ssh "$HOST" "mkdir -p $APP/releases/$REL && tar -xzf - -C $APP/releases/$REL"

ssh "$HOST" bash -s -- "$APP" "$REL" "$OWNER" "$KEEP" <<'REMOTE'
set -euo pipefail
APP=$1 REL=$2 OWNER=$3 KEEP=$4
cd "$APP"

# build/ is self-contained; Node only needs to know it is ESM.
printf '{"type":"module"}\n' >"releases/$REL/package.json"
chown -R "$OWNER" "releases/$REL"

PREV=$(readlink current || true)
ln -sfn "releases/$REL" current.tmp && mv -Tf current.tmp current
systemctl restart beacon-prod

healthy() {
	for _ in $(seq 1 20); do
		sleep 1
		[ "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4173/)" = 200 ] && return 0
	done
	return 1
}

if ! healthy; then
	echo "Release $REL did not come up; rolling back to ${PREV:-nothing}." >&2
	journalctl -u beacon-prod -n 20 --no-pager >&2 || true
	if [ -n "$PREV" ]; then
		ln -sfn "$PREV" current.tmp && mv -Tf current.tmp current
		systemctl restart beacon-prod
	fi
	exit 1
fi

# Release names start with a timestamp, so a reverse sort is newest first.
ls -1d releases/* | sort -r | tail -n +$((KEEP + 1)) | xargs -r rm -rf
echo "Live: $REL"
REMOTE
