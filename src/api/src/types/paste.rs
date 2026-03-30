// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

use chrono::TimeDelta;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Serialize, Deserialize, ToSchema, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export, export_to = "Paste.ts")]
pub enum PasteFormat {
    Plain,
    Source,
    Markdown,
}

#[derive(Serialize, Deserialize, ToSchema, TS)]
#[ts(export, export_to = "Paste.ts")]
pub enum ExpiryTime {
    #[serde(rename = "5min")]
    FiveMinutes,
    #[serde(rename = "10min")]
    TenMinutes,
    #[serde(rename = "1h")]
    Hour,
    #[serde(rename = "1d")]
    Day,
    #[serde(rename = "1w")]
    Week,
    #[serde(rename = "1m")]
    Month,
    #[serde(rename = "1y")]
    Year,
    #[serde(rename = "never")]
    Never,
}

impl Into<TimeDelta> for ExpiryTime {
    fn into(self) -> TimeDelta {
        match self {
            ExpiryTime::FiveMinutes => TimeDelta::minutes(5),
            ExpiryTime::TenMinutes => TimeDelta::minutes(5),
            ExpiryTime::Hour => TimeDelta::hours(1),
            ExpiryTime::Day => TimeDelta::days(1),
            ExpiryTime::Week => TimeDelta::weeks(1),
            ExpiryTime::Month => TimeDelta::days(31),
            ExpiryTime::Year => TimeDelta::days(365),
            ExpiryTime::Never => TimeDelta::zero(),
        }
    }
}

#[derive(Serialize, Deserialize, ToSchema, TS)]
#[ts(export, export_to = "Paste.ts")]
pub struct AdditionalDataV1 {
    /// Number of iterations for the PBKDF2 key derivation
    #[serde(rename = "PBKDF2_ITERATIONS")]
    pub pbkdf2_iterations: u32,
    /// Type of the paste
    pub format: PasteFormat,
    /// Base64 encoding of the salt used
    pub salt: String,
    /// Base64 encoding of the Initial Vector
    pub iv: String,
    /// Whether to burn the paste after reading it once
    pub burn: bool,
}

#[derive(Serialize, Deserialize, ToSchema, TS)]
#[serde(tag = "type", rename_all = "lowercase")]
#[ts(export, export_to = "Paste.ts")]
pub enum AdditionalData {
    V1(AdditionalDataV1),
}

#[derive(Serialize, Deserialize, ToSchema, TS)]
#[ts(export, export_to = "Paste.ts")]
pub struct CreateData {
    /// Additional data, that will be verified
    pub additional_data: AdditionalData,
    /// The required expiry time
    pub expiry: ExpiryTime,
    /// The encrypted content of the paste
    pub content: String,
}

#[derive(Serialize, Deserialize, ToSchema, TS)]
#[ts(export, export_to = "Paste.ts")]
pub struct DeleteData {
    /// The deletion token
    pub token: String,
}

#[derive(Serialize, Deserialize, ToSchema, TS)]
#[ts(export, export_to = "Paste.ts")]
pub struct BasicInfo {
    /// The id of the paste
    pub id: Uuid,
    /// The deletion token
    pub token: String,
}
