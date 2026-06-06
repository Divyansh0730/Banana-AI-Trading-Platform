use log::{error, info};
use redis::AsyncCommands;
use tokio::time::{sleep, Duration};
use rand::Rng;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init();
    info!("Starting Banana AI Trading Rust Execution Engine (Mock Indian Market Mode)...");

    let redis_url = std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://redis:6379/".to_string());
    let redis_client = redis::Client::open(redis_url)?;
    let mut redis_conn = redis_client.get_async_connection().await?;
    info!("Connected to Redis.");

    let mut stocks = vec![
        ("BTC/USDT", 65000.00),
        ("ETH/USDT", 3500.00),
        ("SOL/USDT", 140.00),
    ];

    let mut rng = rand::thread_rng();

    loop {
        for (symbol, price) in stocks.iter_mut() {
            // Random walk: change price by -0.1% to +0.1%
            let change_pct = rng.gen_range(-0.001..0.001);
            *price = *price * (1.0 + change_pct);
            
            let tick = serde_json::json!({
                "symbol": symbol,
                "price": *price,
                "volume": rng.gen_range(100..5000),
                "timestamp": chrono::Utc::now().to_rfc3339()
            });

            match redis_conn.publish::<&str, String, ()>("market_ticks", tick.to_string()).await {
                Ok(_) => info!("Published tick for {}: {}", symbol, *price),
                Err(e) => error!("Redis Publish Error: {}", e),
            }
        }
        sleep(Duration::from_millis(500)).await;
    }
}
