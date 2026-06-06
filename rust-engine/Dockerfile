# Stage 1: Build
FROM rust:slim as builder

WORKDIR /usr/src/app

# Install build dependencies (required for some Rust crates like OpenSSL)
RUN apt-get update && apt-get install -y pkg-config libssl-dev

COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN cargo build --release

# Stage 2: Runtime
FROM debian:bookworm-slim

# Install runtime dependencies (OpenSSL is needed for HTTPS/WSS)
RUN apt-get update && apt-get install -y ca-certificates libssl3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /usr/src/app/target/release/rust-engine /app/rust-engine

CMD ["./rust-engine"]
