# z85-js

Dependency-free Z85 encoding and decoding for JavaScript.

## Install directly from Git

Once this project is hosted on GitHub, install it without publishing to npm:

```sh
npm install git+ssh://git@github.com/tortxof/z85-js.git
npm install git+ssh://git@github.com/tortxof/z85-js.git#v0.1.0
# GitHub shorthand:
npm install github:tortxof/z85-js#v0.1.0
```

Prefer a tag or commit in applications for reproducible installs. No remote repository is created by this local project setup.

A dependency can also be declared directly:

```json
{
  "dependencies": {
    "z85-js": "git+ssh://git@github.com/tortxof/z85-js.git#v0.1.0"
  }
}
```

## Usage

```js
import { Decode, Encode } from "z85-js";

const encoded = Encode(new TextEncoder().encode("Hello world!!"));
const decoded = Decode(encoded);
```

`Encode` accepts an `ArrayBuffer` or any `ArrayBufferView`, including `Uint8Array`, `DataView`, and Node.js `Buffer`. `Decode` returns a `Uint8Array`, which WebAuthn accepts as a `BufferSource`:

```js
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: Decode(encodedChallenge),
    rp: { name: "Example" },
    user: {
      id: Decode(encodedUserId),
      name: "user@example.com",
      displayName: "Example User",
    },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }],
  },
});

const credentialId = Encode(credential.rawId);
```

Final partial chunks are padded automatically. During decoding, invalid characters and overflowing chunks throw errors, matching Python's `base64.z85decode` behavior.

## License

[The Unlicense](LICENSE)
