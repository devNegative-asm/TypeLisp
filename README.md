# Hi, this is TypeLisp.

I was looking at typelang, and thought that was cool, but I also thought it needed more turing completeness, so I made typelisp.

## Installation:

Linux & mac:
```
git clone https://github.com/devNegative-asm/TypeLisp.git
cd TypeLisp
npm i
npm run test
```

Windows:
```
git clone https://github.com/devNegative-asm/TypeLisp.git
cd TypeLisp
npm i
open up node_modules/typescript/lib/tsc.js in notepad, and replace line 6444 with `Type_instantiation_is_excessively_deep_and_possibly_infinite:diag(2589,3,\"\",\"Tsc pretends to be too good for this code\"),`
npx tsc
```

The install does mess with the tsc executable a bit, but that's because tsc lies about what it can and can't type check.

## Running typelisp:

create a variable with type `Eval<code>` where code is a compiletime constant string. assign it to something it isn't, and typescript will run the calculation and tell you what it is.

If you're familiar with lisps, you might recognize some of the features.

## Features

1. lists created with `cons` and `[]`.
2. Signed BigInts
3. lambdas
4. currying
5. error handling
6. string operations (`explode` and `implode`) for converting to lists of single-char strings
7. surprisingly robust == and != comparison
8. `<=` `>=` `<` and `>` all work on integers
9. `#` operator converts back and forth between strings and ints
10. recursion
    1. recursion
        1. recursion

## Examples

read types.ts