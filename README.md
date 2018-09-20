# ava-tap-json-parser

Simple tap to json converter, which is specifically targeted towards ava.js test output. It also includes stack trace info.

As of now it publishes the report to console.

## Installation

npm i -g ava-tap-json-parser

npm i --save-dev ava-tap-json-parser


## Usage

ava $test-file --tap | ava-tap-json-parser

