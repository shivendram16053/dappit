/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/dappit.json`.
 */
export type Dappit = {
  "address": "3PowFT1sQGcwNM1MtAkVaWRgpHru5xKeQezYTPBrDCPk",
  "metadata": {
    "name": "dappit",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createPost",
      "discriminator": [
        123,
        92,
        184,
        29,
        231,
        24,
        15,
        202
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "userPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "postPda",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "ipfsHash",
          "type": "string"
        }
      ]
    },
    {
      "name": "userProfile",
      "discriminator": [
        152,
        20,
        153,
        167,
        238,
        97,
        192,
        226
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "userVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        }
      ]
    },
    {
      "name": "voteOnPostHandler",
      "discriminator": [
        170,
        248,
        55,
        108,
        136,
        54,
        24,
        109
      ],
      "accounts": [
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator",
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "postPda",
          "writable": true
        },
        {
          "name": "userPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "ipfsHash",
          "type": "string"
        },
        {
          "name": "vote",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "post",
      "discriminator": [
        8,
        147,
        90,
        186,
        185,
        56,
        192,
        150
      ]
    },
    {
      "name": "userProfile",
      "discriminator": [
        32,
        37,
        119,
        205,
        179,
        180,
        13,
        194
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "insufficientLamports",
      "msg": "You don't have enough sol to deposit"
    },
    {
      "code": 6001,
      "name": "invalidPostId",
      "msg": "Invalid post ID derived from hash."
    },
    {
      "code": 6002,
      "name": "invalidHash",
      "msg": "Invalid IPFS hash format."
    },
    {
      "code": 6003,
      "name": "selfVotingNotAllowed",
      "msg": "Self voting is not allowed."
    },
    {
      "code": 6004,
      "name": "invalidVoteType",
      "msg": "Vote type not valid"
    }
  ],
  "types": [
    {
      "name": "post",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "ipfsHash",
            "type": "string"
          },
          {
            "name": "upvote",
            "type": "u64"
          },
          {
            "name": "downvote",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "username",
            "type": "string"
          },
          {
            "name": "karma",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "totalPosts",
            "type": "u64"
          },
          {
            "name": "totalUpvotes",
            "type": "u64"
          },
          {
            "name": "totalDownvotes",
            "type": "u64"
          },
          {
            "name": "userVault",
            "type": "pubkey"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "voteBitmap",
            "type": "bytes"
          }
        ]
      }
    }
  ]
};
