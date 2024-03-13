use cosmwasm_std::{
    entry_point, to_binary, DepsMut, Env, MessageInfo, Response, StdResult, WasmMsg,
};

use crate::msg::{ExecuteMsg, InstantiateMsg, ProofMsg};
use crate::state::{config, config_read, State};

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    let state = State {
        contract: msg.contract,
        code_hash: msg.code_hash,
    };

    deps.api
        .debug(format!("Contract was initialized by {}", info.sender).as_str());
    config(deps.storage).save(&state)?;

    Ok(Response::default())
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    _info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    let config = config_read(deps.storage).load()?;

    match msg {
        ExecuteMsg::VerifyProof(msg) => {
            verify_proof(deps, env, config.contract, config.code_hash, msg)
        }
    }
}

pub fn verify_proof(
    _deps: DepsMut,
    _env: Env,
    contract: String,
    code_hash: String,
    msg: ProofMsg,
) -> StdResult<Response> {
    let exec_msg = ExecuteMsg::VerifyProof(msg);

    let cosmos_msg = WasmMsg::Execute {
        contract_addr: contract,
        code_hash: code_hash,
        msg: to_binary(&exec_msg)?,
        funds: vec![],
    };

    Ok(Response::new()
        .add_message(cosmos_msg)
        .add_attribute("action", "verify"))
}
