// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

use axum::extract::DefaultBodyLimit;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::AppState;

pub fn router() -> OpenApiRouter<AppState> {
    OpenApiRouter::new()
        .routes(routes!(crate::handlers::paste::create))
        // increase the limit for uploads to 16MB
        .layer(DefaultBodyLimit::max(1024 * 1024 * 16))
        .routes(routes!(
            crate::handlers::paste::read,
            crate::handlers::paste::delete,
        ))
}
