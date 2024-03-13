use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
mod claims;
use claims::Proof;

#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub contract: String,
    pub code_hash: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    VerifyProof(ProofMsg),
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct ProofMsg {
    pub proof: Proof,
}
