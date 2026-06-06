use log::{error, info};
use redis::AsyncCommands;
use tokio::time::{sleep, Duration};
use rand::Rng;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init();
    info!("Starting Banana AI Trading Rust Execution Engine (Mock Indian Market Mode)...");

    let redis_client = redis::Client::open("redis://127.0.0.1:6379/")?;
    let mut redis_conn = redis_client.get_async_connection().await?;
    info!("Connected to Redis.");

    let mut stocks = vec![
        ("RELIANCE.NSE", 2850.50),
        ("TCS.NSE", 3980.00),
        ("INFY.NSE", 1450.25),
        ("HDFCBANK.NSE", 1520.10),
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
