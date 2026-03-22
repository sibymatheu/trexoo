/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/lottery.json`.
 */
export type Lottery = {
  "address": "A9C45R9BG3UAsa5SdKXPTzAZad3ZKt5Yt1NEwn79ra6D",
  "metadata": {
    "name": "lottery",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyTicket",
      "docs": [
        "Buy a ticket for the current round",
        "If this is the last ticket, automatically draws winners and creates next round"
      ],
      "discriminator": [
        11,
        24,
        17,
        193,
        168,
        116,
        164,
        169
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "account",
                "path": "round.round_number",
                "account": "round"
              }
            ]
          }
        },
        {
          "name": "roundVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100,
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
                "path": "config"
              },
              {
                "kind": "account",
                "path": "round.round_number",
                "account": "round"
              }
            ]
          }
        },
        {
          "name": "ticket",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  99,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "round"
              },
              {
                "kind": "account",
                "path": "buyer"
              }
            ]
          }
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "feeWallet",
          "writable": true
        },
        {
          "name": "newRound",
          "writable": true
        },
        {
          "name": "newRoundVault",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "claimPrize",
      "docs": [
        "Claim winnings from a settled round"
      ],
      "discriminator": [
        157,
        233,
        139,
        121,
        246,
        62,
        234,
        235
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "account",
                "path": "round.round_number",
                "account": "round"
              }
            ]
          }
        },
        {
          "name": "roundVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100,
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
                "path": "config"
              },
              {
                "kind": "account",
                "path": "round.round_number",
                "account": "round"
              }
            ]
          }
        },
        {
          "name": "claimRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  97,
                  105,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "round"
              },
              {
                "kind": "account",
                "path": "claimer"
              }
            ]
          }
        },
        {
          "name": "claimer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createRound",
      "docs": [
        "Create a new lottery round"
      ],
      "discriminator": [
        229,
        218,
        236,
        169,
        231,
        80,
        134,
        112
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "writable": true
        },
        {
          "name": "roundVault",
          "writable": true
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "drawWinners",
      "docs": [
        "Draw winners and settle the round (called when round is full)",
        "Uses slot hash as randomness source"
      ],
      "discriminator": [
        43,
        87,
        86,
        4,
        32,
        104,
        203,
        209
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "account",
                "path": "round.round_number",
                "account": "round"
              }
            ]
          }
        },
        {
          "name": "roundVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100,
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
                "path": "config"
              },
              {
                "kind": "account",
                "path": "round.round_number",
                "account": "round"
              }
            ]
          }
        },
        {
          "name": "feeWallet",
          "writable": true
        },
        {
          "name": "admin",
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeConfig",
      "docs": [
        "Initialize the lottery configuration (called once by operator)"
      ],
      "discriminator": [
        208,
        127,
        21,
        1,
        194,
        190,
        196,
        70
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "feeWallet"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "slots",
          "type": "u8"
        },
        {
          "name": "ticketPrice",
          "type": "u64"
        },
        {
          "name": "feeRateBps",
          "type": "u16"
        },
        {
          "name": "firstShareBps",
          "type": "u16"
        },
        {
          "name": "secondShareBps",
          "type": "u16"
        },
        {
          "name": "thirdShareBps",
          "type": "u16"
        },
        {
          "name": "secondN",
          "type": "u8"
        },
        {
          "name": "thirdN",
          "type": "u8"
        },
        {
          "name": "operator",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "updateConfig",
      "docs": [
        "Update lottery configuration (only between rounds)"
      ],
      "discriminator": [
        29,
        158,
        252,
        191,
        10,
        83,
        219,
        99
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "slots",
          "type": "u8"
        },
        {
          "name": "ticketPrice",
          "type": "u64"
        },
        {
          "name": "feeRateBps",
          "type": "u16"
        },
        {
          "name": "firstShareBps",
          "type": "u16"
        },
        {
          "name": "secondShareBps",
          "type": "u16"
        },
        {
          "name": "thirdShareBps",
          "type": "u16"
        },
        {
          "name": "secondN",
          "type": "u8"
        },
        {
          "name": "thirdN",
          "type": "u8"
        }
      ]
    },
    {
      "name": "withdraw",
      "docs": [
        "Withdraw from user balance (for accumulated winnings)"
      ],
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "userBalance",
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
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
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
          "name": "userBalanceVault",
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
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
                  101,
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
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "claimRecord",
      "discriminator": [
        57,
        229,
        0,
        9,
        65,
        62,
        96,
        7
      ]
    },
    {
      "name": "lotteryConfig",
      "discriminator": [
        174,
        54,
        184,
        175,
        81,
        20,
        237,
        24
      ]
    },
    {
      "name": "round",
      "discriminator": [
        87,
        127,
        165,
        51,
        73,
        78,
        116,
        174
      ]
    },
    {
      "name": "ticket",
      "discriminator": [
        41,
        228,
        24,
        165,
        78,
        90,
        235,
        200
      ]
    },
    {
      "name": "userBalance",
      "discriminator": [
        187,
        237,
        208,
        146,
        86,
        132,
        29,
        191
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidSlots",
      "msg": "Invalid number of slots"
    },
    {
      "code": 6001,
      "name": "invalidTicketPrice",
      "msg": "Invalid ticket price"
    },
    {
      "code": 6002,
      "name": "invalidFeeRate",
      "msg": "Invalid fee rate"
    },
    {
      "code": 6003,
      "name": "invalidPrizeShares",
      "msg": "Prize shares must sum to 100%"
    },
    {
      "code": 6004,
      "name": "tooManyWinners",
      "msg": "Too many winners for the number of slots"
    },
    {
      "code": 6005,
      "name": "invalidWinnerCount",
      "msg": "Invalid winner count"
    },
    {
      "code": 6006,
      "name": "roundNotOpen",
      "msg": "Round is not open for purchases"
    },
    {
      "code": 6007,
      "name": "roundFull",
      "msg": "Round is full"
    },
    {
      "code": 6008,
      "name": "alreadyPurchased",
      "msg": "You have already purchased a ticket for this round"
    },
    {
      "code": 6009,
      "name": "roundNotFull",
      "msg": "Round is not full yet"
    },
    {
      "code": 6010,
      "name": "roundNotSettled",
      "msg": "Round has not been settled"
    },
    {
      "code": 6011,
      "name": "notAWinner",
      "msg": "You are not a winner in this round"
    },
    {
      "code": 6012,
      "name": "alreadyClaimed",
      "msg": "Prize already claimed"
    },
    {
      "code": 6013,
      "name": "invalidWithdrawAmount",
      "msg": "Invalid withdrawal amount"
    },
    {
      "code": 6014,
      "name": "insufficientBalance",
      "msg": "Insufficient balance"
    },
    {
      "code": 6015,
      "name": "unauthorized",
      "msg": "Unauthorized: must be authority or operator"
    },
    {
      "code": 6016,
      "name": "invalidFeeWallet",
      "msg": "Invalid fee wallet"
    },
    {
      "code": 6017,
      "name": "invalidNewRoundPda",
      "msg": "Invalid new round PDA"
    },
    {
      "code": 6018,
      "name": "invalidNewRoundVaultPda",
      "msg": "Invalid new round vault PDA"
    }
  ],
  "types": [
    {
      "name": "claimRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "round",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "claimed",
            "type": "bool"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "claimedAt",
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
      "name": "lotteryConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "operator",
            "type": "pubkey"
          },
          {
            "name": "feeWallet",
            "type": "pubkey"
          },
          {
            "name": "slots",
            "type": "u8"
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          },
          {
            "name": "feeRateBps",
            "type": "u16"
          },
          {
            "name": "firstShareBps",
            "type": "u16"
          },
          {
            "name": "secondShareBps",
            "type": "u16"
          },
          {
            "name": "thirdShareBps",
            "type": "u16"
          },
          {
            "name": "secondN",
            "type": "u8"
          },
          {
            "name": "thirdN",
            "type": "u8"
          },
          {
            "name": "currentRound",
            "type": "u64"
          },
          {
            "name": "totalFeesCollected",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "round",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundNumber",
            "type": "u64"
          },
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "slots",
            "type": "u8"
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          },
          {
            "name": "feeRateBps",
            "type": "u16"
          },
          {
            "name": "firstShareBps",
            "type": "u16"
          },
          {
            "name": "secondShareBps",
            "type": "u16"
          },
          {
            "name": "thirdShareBps",
            "type": "u16"
          },
          {
            "name": "secondN",
            "type": "u8"
          },
          {
            "name": "thirdN",
            "type": "u8"
          },
          {
            "name": "slotsFilled",
            "type": "u8"
          },
          {
            "name": "pool",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "roundStatus"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "participants",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "winningParticipants",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "firstWinnerIdx",
            "type": "u8"
          },
          {
            "name": "secondWinnersStartIdx",
            "type": "u8"
          },
          {
            "name": "thirdWinnersStartIdx",
            "type": "u8"
          },
          {
            "name": "fee",
            "type": "u64"
          },
          {
            "name": "firstPrize",
            "type": "u64"
          },
          {
            "name": "secondPrizeEach",
            "type": "u64"
          },
          {
            "name": "thirdPrizeEach",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "roundStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "open"
          },
          {
            "name": "full"
          },
          {
            "name": "settled"
          }
        ]
      }
    },
    {
      "name": "ticket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "round",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "slotIndex",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userBalance",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "totalWon",
            "type": "u64"
          },
          {
            "name": "totalWithdrawn",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
