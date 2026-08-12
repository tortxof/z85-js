import assert from "node:assert/strict";
import test from "node:test";
import { Decode, Encode } from "./z85.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

test("encodes known values and partial chunks", () => {
  assert.equal(
    Encode(Uint8Array.of(0x86, 0x4f, 0xd2, 0x6f, 0xb5, 0x59, 0xf7, 0x5b)),
    "HelloWorld",
  );
  assert.equal(Encode(encoder.encode("Hello world!!")), "nm=QNzY<mxA+]nfaP");
  assert.equal(Encode(Uint8Array.of(0x42)), "li");
  assert.equal(Encode(Uint8Array.of(0x42).buffer), "li");
  assert.equal(
    Encode(new DataView(Uint8Array.of(0, 0x42, 0).buffer, 1, 1)),
    "li",
  );
});

test("decodes known values and partial chunks", () => {
  assert.deepEqual(
    Decode("HelloWorld"),
    Uint8Array.of(0x86, 0x4f, 0xd2, 0x6f, 0xb5, 0x59, 0xf7, 0x5b),
  );
  assert.equal(decoder.decode(Decode("nm=QNzY<mxA+]nfaP")), "Hello world!!");
  assert.deepEqual(Decode("li"), Uint8Array.of(0x42));
});

test("maps invalid characters to zero", () => {
  for (const invalid of ["~", "\u0100"]) {
    assert.deepEqual(Decode(`Hell${invalid}`), Decode("Hell0"));
  }
});

test("encodes and decodes two- and three-byte partial chunks", () => {
  assert.equal(Encode(Uint8Array.of(1, 2)), "0rJ");
  assert.equal(Encode(Uint8Array.of(1, 2, 3)), "0rJu");
  assert.deepEqual(Decode("0rJ"), Uint8Array.of(1, 2));
  assert.deepEqual(Decode("0rJu"), Uint8Array.of(1, 2, 3));
});

test("round trips every partial-chunk length", () => {
  for (let length = 0; length < 32; length++) {
    const input = Uint8Array.from(
      { length },
      (_, index) => (index * 31 + length) & 0xff,
    );
    assert.deepEqual(Decode(Encode(input)), input);
  }
});
