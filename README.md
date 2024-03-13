# Reclaim Secret Client

Compile client contract:

```
make build
```

In node directory, populate your .env:

```
MNEMONIC= // Your mnemonic
OWNER= // Your secret address associated with the above mnemonic
```

In the same directory:

```
npm install
node verify
```
