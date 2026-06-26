#!/bin/sh
set -eu

required_env() {
    name="$1"
    eval "value=\${$name:-}"
    if [ -z "$value" ]; then
        echo "missing required environment variable: $name" >&2
        exit 1
    fi
}

for key in \
    LIVEKIT_PORT \
    LIVEKIT_RTC_TCP_PORT \
    LIVEKIT_RTP_PORT_MIN \
    LIVEKIT_RTP_PORT_MAX \
    LIVEKIT_REDIS_ADDRESS \
    LIVEKIT_REDIS_PASSWORD \
    LIVEKIT_KEYS \
    LIVEKIT_WEBHOOK_URL
do
    required_env "$key"
done

cat > /tmp/livekit.yaml <<EOF
port: ${LIVEKIT_PORT}
bind_addresses:
  - 0.0.0.0
rtc:
  tcp_port: ${LIVEKIT_RTC_TCP_PORT}
  port_range_start: ${LIVEKIT_RTP_PORT_MIN}
  port_range_end: ${LIVEKIT_RTP_PORT_MAX}
redis:
  address: ${LIVEKIT_REDIS_ADDRESS}
  password: ${LIVEKIT_REDIS_PASSWORD}
keys:
  ${LIVEKIT_KEYS}
webhook:
  urls:
    - ${LIVEKIT_WEBHOOK_URL}
EOF

exec livekit-server --config /tmp/livekit.yaml
