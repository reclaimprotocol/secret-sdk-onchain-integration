# Reclaim - Secret

## Deployments

| Chain Name | Deployed Address | Explorer Link |
|:-----------|:-----------------|:--------------|
| Secret Mainnet | secret18u22df5dan6cyl6xuyjn9wsa3gauf53567ej90 | https://ping.pub/secret/account/secret18u22df5dan6cyl6xuyjn9wsa3gauf53567ej90|
| Secret Testnet | secret14k7awjkw8ykllsx8uvq0dfc6h57afrzudunhah | https://testnet.ping.pub/secret/account/secret14k7awjkw8ykllsx8uvq0dfc6h57afrzudunhah|

## Environment

Compile client contract:

```
make build
```

In node directory, populate your .env:

```
MNEMONIC= // Your mnemonic
```

In the same directory:

```
npm install
node verify
```
