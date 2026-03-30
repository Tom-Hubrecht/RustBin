// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

use chrono::Utc;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::types::paste::AdditionalData;

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, ToSchema, Serialize, Deserialize)]
#[sea_orm(table_name = "paste")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    /// Encrypted content
    pub content: String,
    /// Additional data
    #[schema(value_type = AdditionalData)]
    pub data: Json,
    /// Expiry date
    pub expires: Option<DateTime>,
    /// Delete token
    #[serde(skip_serializing)]
    pub delete_token: String,
    /// Burn after reading
    #[serde(skip_serializing)]
    pub burn: bool,
}

impl ActiveModelBehavior for ActiveModel {}

pub trait IsExpired {
    fn is_expired(&self) -> bool;
}

impl IsExpired for Model {
    fn is_expired(&self) -> bool {
        match self.expires {
            Some(dt) => Utc::now() > dt.and_utc(),
            None => false,
        }
    }
}
