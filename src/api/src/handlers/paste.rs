// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

use anyhow::Result;
use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use chrono::{TimeDelta, Utc};
use rand::distr::{Alphanumeric, SampleString};
use sea_orm::{EntityTrait, ModelTrait};
use serde_json::json;
use utoipa::IntoResponses;
use uuid::Uuid;

use crate::{
    AppError, AppState,
    entity::{Paste, PasteModel, paste::IsExpired},
    types::paste::{AdditionalData, AdditionalDataV1, BasicInfo, CreateData, DeleteData},
};

#[derive(IntoResponses)]
pub enum CreateResponses {
    #[response(status = OK)]
    Info(#[to_schema] BasicInfo),
}

impl IntoResponse for CreateResponses {
    fn into_response(self) -> axum::response::Response {
        match self {
            Self::Info(info) => (StatusCode::OK, Json(json!(info))).into_response(),
        }
    }
}

#[axum::debug_handler]
#[utoipa::path(
    post,
    path = "/",
    responses(
        CreateResponses,
        (status = INTERNAL_SERVER_ERROR, body = String)
    ),
    tag = "Paste"
)]
pub async fn create(
    state: State<AppState>,
    Json(data): Json<CreateData>,
) -> Result<CreateResponses, AppError> {
    let delta: TimeDelta = data.expiry.into();

    let expires = if delta.is_zero() {
        None
    } else {
        Some((Utc::now() + delta).naive_utc())
    };

    let id = Uuid::new_v4();
    let delete_token = Alphanumeric.sample_string(&mut rand::rng(), 64);

    let paste = PasteModel {
        id,
        expires,
        delete_token: delete_token.clone(),
        content: data.content,
        data: json!(data.additional_data),
        burn: match data.additional_data {
            AdditionalData::V1(AdditionalDataV1 { burn, .. }) => burn,
        },
    };

    let active: crate::entity::paste::ActiveModel = paste.into();

    Paste::insert(active).exec(&state.db).await?;

    Ok(CreateResponses::Info(BasicInfo {
        id,
        token: delete_token,
    }))
}

#[derive(IntoResponses)]
pub enum ReadResponses {
    #[response(status = NOT_FOUND, description = "No corresponding id found")]
    NotFound,

    #[response(status = OK)]
    Info(#[to_schema] PasteModel),
}

impl IntoResponse for ReadResponses {
    fn into_response(self) -> axum::response::Response {
        match self {
            Self::NotFound => (StatusCode::NOT_FOUND,).into_response(),
            Self::Info(model) => (StatusCode::OK, Json(json!(model))).into_response(),
        }
    }
}

#[axum::debug_handler]
#[utoipa::path(
    get,
    path = "/{id}",
    responses(
        ReadResponses,
        (status = INTERNAL_SERVER_ERROR, body = String)
    ),
    tag = "Paste"
)]
pub async fn read(state: State<AppState>, Path(id): Path<Uuid>) -> Result<ReadResponses, AppError> {
    match Paste::find_by_id(id).one(&state.db).await? {
        Some(paste) => {
            // Delete and return not found when expired
            if paste.is_expired() {
                paste.delete(&state.db).await?;

                return Ok(ReadResponses::NotFound);
            }

            // Delete after reading
            if paste.burn {
                Paste::delete_by_id(id).exec(&state.db).await?;
            }

            Ok(ReadResponses::Info(paste))
        }

        None => Ok(ReadResponses::NotFound),
    }
}

#[derive(IntoResponses)]
pub enum DeleteResponses {
    #[response(status = NOT_FOUND, description = "No corresponding id found")]
    NotFound,

    #[response(status = UNAUTHORIZED, description = "Invalid token")]
    InvalidToken,

    #[response(status = OK)]
    Deleted(Uuid),
}

impl IntoResponse for DeleteResponses {
    fn into_response(self) -> axum::response::Response {
        match self {
            Self::NotFound => (StatusCode::NOT_FOUND,).into_response(),
            Self::Deleted(id) => (StatusCode::OK, Json(id)).into_response(),
            Self::InvalidToken => (StatusCode::UNAUTHORIZED,).into_response(),
        }
    }
}

#[axum::debug_handler]
#[utoipa::path(
    delete,
    path = "/{id}",
    responses(
        DeleteResponses,
        (status = INTERNAL_SERVER_ERROR, body = String)
    ),
    tag = "Paste"
)]
pub async fn delete(
    state: State<AppState>,
    Path(id): Path<Uuid>,
    Json(data): Json<DeleteData>,
) -> Result<DeleteResponses, AppError> {
    match Paste::find_by_id(id).one(&state.db).await? {
        Some(paste) => {
            if paste.is_expired() {
                paste.delete(&state.db).await?;
                return Ok(DeleteResponses::NotFound);
            }

            if paste.delete_token == data.token {
                paste.delete(&state.db).await?;
                Ok(DeleteResponses::Deleted(id))
            } else {
                Ok(DeleteResponses::InvalidToken)
            }
        }

        None => Ok(DeleteResponses::NotFound),
    }
}
