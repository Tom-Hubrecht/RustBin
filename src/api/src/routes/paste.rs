// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

use axum::extract::DefaultBodyLimit;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::AppState;

pub fn router(max_body_size: usize) -> OpenApiRouter<AppState> {
    OpenApiRouter::new()
        .routes(routes!(crate::handlers::paste::create))
        .layer(DefaultBodyLimit::max(max_body_size))
        .routes(routes!(
            crate::handlers::paste::read,
            crate::handlers::paste::delete,
        ))
}
