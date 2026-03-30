use anyhow::Result;
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use clap::Parser;
use sea_orm::{ConnectOptions, Database, DatabaseConnection};
use tower_http::trace::TraceLayer;
use tracing::*;
use utoipa::OpenApi;
use utoipa_axum::router::OpenApiRouter;
use utoipa_swagger_ui::SwaggerUi;

use crate::routes::paste::router as paste_router;

mod entity;
mod handlers;
mod routes;
mod types;

#[derive(Parser)]
/// RustBin API server
struct Args {
    #[clap(flatten)]
    listener: tokio_listener::ListenerAddressPositional,

    #[clap(long, default_value = "sqlite::memory:")]
    db_url: String,
}

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    #[derive(OpenApi)]
    #[openapi(info(title = "RustBin", description = "A modern and private pastebin"))]
    struct ApiDoc;

    let args = Args::parse();

    let listener: tokio_listener::Listener = args.listener.bind().await?;

    info!("Server listening on {}", listener.local_addr()?);

    // Database setup
    let mut opt = ConnectOptions::new(args.db_url);
    opt.sqlx_logging(false);

    let db = Database::connect(opt)
        .await
        .expect("Failed to connect to the database");

    // Run the migrations
    db.get_schema_registry("rustbin::entity::*")
        .sync(&db)
        .await?;

    let state = AppState { db };

    let (router, api) = OpenApiRouter::with_openapi(ApiDoc::openapi())
        .nest("/api/v1/paste", paste_router())
        .with_state(state)
        .split_for_parts();

    let router = router
        .merge(SwaggerUi::new("/api/swagger-ui").url("/api/docs/openapi.json", api.clone()))
        .layer(TraceLayer::new_for_http());

    axum::serve(listener, router.into_make_service()).await?;

    Ok(())
}

#[derive(Clone)]
struct AppState {
    db: DatabaseConnection,
}

// SPDX-SnippetBegin
// SPDX-License-Identifier: MIT
// SPDX-SnippetCopyrightText: axum Contributors

// Make our own error that wraps `anyhow::Error`.
struct AppError(anyhow::Error);

// Tell axum how to convert `AppError` into a response.
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        warn!("{}", self.0);

        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Something went wrong: {}", self.0),
        )
            .into_response()
    }
}

// This enables using `?` on functions that return `Result<_, anyhow::Error>` to turn them into
// `Result<_, AppError>`. That way you don't need to do that manually.
impl<E> From<E> for AppError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        Self(err.into())
    }
}

// SPDX-SnippetEnd
