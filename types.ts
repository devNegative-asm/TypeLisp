
//numbers are represented in base-2 using an array of 1s and 0s.
//0 is [], 1 is [1], 2 is [1,0]
//signed numbers don't use 2's complement, but instead use a sign flag.

type Bit = 0|1
type UInt = Bit[]
type Compl<T extends Bit> = T extends 0 ? 1 : 0
type Not<T extends boolean> = T extends true ? false : true
type Xor<T extends boolean, U extends boolean> = T extends true ? Not<U> : U
type And<T extends boolean, U extends boolean> = T extends true ? U : false
type Or<T extends boolean, U extends boolean> = T extends true ? true : U
type StringToUInt<N extends string> = N extends "" ? []
    : N extends `${infer U}0` ? UMul<StringToUInt<U>,Ten>
    : N extends `${infer U}1` ? UAdd<[1],UMul<StringToUInt<U>,Ten>>
    : N extends `${infer U}2` ? UAdd<[1, 0],UMul<StringToUInt<U>,Ten>>
    : N extends `${infer U}3` ? UAdd<[1, 1],UMul<StringToUInt<U>,Ten>>
    : N extends `${infer U}4` ? UAdd<[1, 0, 0],UMul<StringToUInt<U>,Ten>>
    : N extends `${infer U}5` ? UAdd<[1, 0, 1],UMul<StringToUInt<U>,Ten>>
    : N extends `${infer U}6` ? UAdd<[1, 1, 0],UMul<StringToUInt<U>,Ten>>
    : N extends `${infer U}7` ? UAdd<[1, 1, 1],UMul<StringToUInt<U>,Ten>>
    : N extends `${infer U}8` ? UAdd<[1, 0, 0, 0],UMul<StringToUInt<U>,Ten>>
    : N extends `${infer U}9` ? UAdd<[1, 0, 0, 1],UMul<StringToUInt<U>,Ten>>
    : never
type N<N extends number> = StringToUInt<`${N}`>
type LowBit<T extends Array<any>> = T extends [] ? 0 : T extends [any] ? 1 : T extends [any, ...infer Rest extends Array<any>] ? LowBit<Rest> extends 1 ? 0 : 1 : never
type HalfArray<T extends Array<any>> = T extends [] ? [] : T extends [infer B, infer _, ...infer Rest] ? [B, ...HalfArray<Rest>] : never
type Len<T extends Array<any>> = T extends [] ? [] : LowBit<T> extends 0 ? [...Len<HalfArray<T>>, 0] : T extends [any, ...infer rest extends Array<any>] ? [...Len<HalfArray<rest>>, 1] : never
type UInc<T extends UInt> = T extends [] ? [1] : T extends [0] ? [1] : T extends [...infer U, 0] ? [...U, 1] : T extends [...infer U extends UInt, 1] ? [...UInc<U>, 0] : never
type UAdd<A extends UInt,B extends UInt> = A extends [] ? B : B extends [] ? A :
        A extends [...infer UA extends UInt, 0] ? B extends [...infer UB extends UInt, 0] ? [...UAdd<UA,UB>, 0] :
                                                        B extends [...infer UB extends UInt, 1] ? [...UAdd<UA,UB>, 1] : never :
        A extends [...infer UA extends UInt, 1] ? B extends [...infer UB extends UInt, 0] ? [...UAdd<UA,UB>, 1] :
                                                B extends [...infer UB extends UInt, 1] ? [...UInc<UAdd<UA,UB>>, 0] : never : never

type UMul<A extends UInt,B extends UInt> = A extends [] ? [] : B extends [] ? [] :
        A extends [...infer UA extends UInt, 0] ? [...UMul<UA,B>, 0] :
        A extends [...infer UA extends UInt, 1] ? UAdd<B,[...UMul<UA,B>, 0]> : never
type Mul<A extends Int, B extends Int> = INorm<{
    neg: Xor<A["neg"],B["neg"]>,
    mag: UMul<A["mag"],B["mag"]>
}>
type Div<A extends Int, B extends Int> = INorm<{
    neg: Xor<A["neg"],B["neg"]>,
    mag: UDiv<A["mag"],B["mag"]>
}>
type LessThanOrEqual<A extends Int, B extends Int> = false extends Sub<B,A>["neg"] ? true : false
type LessThan<A extends Int, B extends Int> = true extends Sub<A,B>["neg"] ? true : false

type UDec<N extends UInt> = N extends [] ? never : N extends [1] ? [] : N extends [...infer U extends UInt,1] ? [...U, 0] : N extends [...infer U extends UInt, 0] ? [...UDec<U>, 1] : never
type TwoExp<N extends UInt> = N extends [] ? [1] : [...TwoExp<UDec<N>>, 0]
type Equal<A,B> = B extends A ? A extends B ? true : false : false
type NEqual<A,B> = B extends A ? A extends B ? false : true : true
type USub<A extends UInt,B extends UInt> = B extends [] ? A
    : B extends A ? []
    : B extends [...infer HB extends UInt, 0]
        ? A extends [...infer HA extends UInt, infer LA extends Bit] ? [...USub<HA,HB>, LA] : never
    : B extends [...infer HB extends UInt, 1]
        ? A extends [...infer HA extends UInt, 1] ? [...USub<HA, HB>, 0]
        : A extends [...infer HA extends UInt, 0] ? [...USub<UDec<HA>, HB>, 1] : never
    : never
//cut leading zeroes
type UNorm<T extends UInt> = T extends [0, ...infer LT extends UInt] ? UNorm<LT> : T
type ULessThanOrEqual<A extends UInt,B extends UInt> = true extends Equal<A,B> ? true
    : A extends N<0> ? true
    : B extends N<0> ? false
    : A extends N<1> ? true
    : B extends N<1> ? false
    : A extends N<2> ? true
    : B extends N<2> ? false
    : true extends Equal<Len<A>,Len<B>>
        ? A extends [1, ...infer LA extends UInt] ? B extends [1, ...infer LB extends UInt] ? ULessThanOrEqual<UNorm<LA>,UNorm<LB>> : never
        : never
    : ULessThanOrEqual<Len<A>,Len<B>>
type ULessThan<A extends UInt,B extends UInt> = true extends ULessThanOrEqual<A,B> ? false extends Equal<A,B> ? true : false : false
type UDiv<A extends UInt,B extends UInt> = true extends ULessThan<A,B>
    ? []
    : true extends ULessThan<A, [...B, 0]> ? [1]
    : UDiv<A,[...B, 0]> extends infer U extends UInt
        ? true extends ULessThanOrEqual<UMul<[...U, 1], B>, A>
            ? [...U, 1]
            : [...U, 0]
        : never
type UMod<N extends UInt,D extends UInt> = USub<N,UMul<UDiv<N,D>,D>>

type Ten = [1,0,1,0]
type UintToString<Num extends UInt> = Num extends N<0>
    ? "0"
    : Num extends N<1> ? "1"
    : Num extends N<2> ? "2"
    : Num extends N<3> ? "3"
    : Num extends N<4> ? "4"
    : Num extends N<5> ? "5"
    : Num extends N<6> ? "6"
    : Num extends N<7> ? "7"
    : Num extends N<8> ? "8"
    : Num extends N<9> ? "9"
    : UintToString<UDiv<Num,Ten>> extends infer Upper extends string ?
        UintToString<UMod<Num,Ten>> extends infer Lower extends string ? `${Upper}${Lower}` : never
    : never

type Int = {neg: boolean, mag:UInt}
type List<T extends any[]> = {
    items: T
}
type Str<T> = {
    type: "string",
    value: T
}
//Fix signed arithmetic by making -0 into +0
type INorm<I extends Int> = {mag: [], neg: true} extends I ? {mag: [], neg: false} : I
type IntToString<I extends Int> = I extends {neg: infer Sign, mag: infer M extends UInt} ?
    UintToString<M> extends infer Magnitude extends string ?
        Sign extends true ? `-${Magnitude}` : `${Magnitude}`
    : never
    : never
type StringToInt<T extends string> = T extends `-${infer Mag extends string}`
    ? INorm<{mag: StringToUInt<Mag>, neg: true}>
    : StringToUInt<T> extends infer Mag extends UInt ? {mag: Mag, neg: false}
    : never
type I<Num extends string> = StringToInt<`${Num}`>

type UMax<A extends UInt, B extends UInt> = true extends ULessThanOrEqual<A,B> ? B : A
type UMin<A extends UInt, B extends UInt> = true extends ULessThanOrEqual<A,B> ? A : B

type UMaxInd<A extends UInt, B extends UInt> = true extends ULessThanOrEqual<A,B> ? 1 : 0
type UMinInd<A extends UInt, B extends UInt> = true extends ULessThanOrEqual<A,B> ? 0 : 1

type Add<A extends Int, B extends Int> =
    [A,B] extends [{neg: infer SA extends boolean, mag: infer MA extends UInt}, {neg: infer SB extends boolean, mag: infer MB extends UInt}]
    ? SA extends SB ? INorm<{neg: SA, mag: UAdd<MA,MB>}>
    : INorm<{neg: [A,B][UMaxInd<MA,MB>]["neg"], mag: USub<UMax<MA,MB>, UMin<MA,MB>>}>
    : never

type Neg<T> = T extends {neg: infer Sign extends boolean, mag: infer Mag extends UInt} ? INorm<{neg: Not<Sign>, mag: Mag}> : never
type Sub<A extends Int, B extends Int> = Add<A,Neg<B>>
type Push<Elem, Arr extends Array<any>> = [Elem, ...Arr]

//might use for global variables eventually
type Bindings = {[key:string] : any}[]

type Token<T extends string, U extends String> = {TType: T, value: U}
type TIdent<Name extends string> = Token<"Ident",Name>
type TLitInt<Val extends string> = Token<"LitInt",Val>
type TLambda = Token<"lambda","lambda">
type TEmptyList = Token<"[]","[]">
type TTry = Token<"try","try">
type TIf = Token<"if","if">
type TTrue = Token<"true","true">
type TFalse = Token<"false","false">
type TOpenParen = Token<"(","(">
type TCloseParen = Token<")",")">
type TPlus = Token<"+","+">
type TMinus = Token<"-","-">
type TTimes = Token<"*","*">
type TDiv = Token<"/","/">
type TLTE = Token<"<=","<=">
type TLT = Token<"<","<">
type TGTE = Token<">=",">=">
type TGT = Token<">",">">
type TEQ = Token<"==","==">
type TNE = Token<"!=","!=">
type TNot = Token<"~","~">
type TCond = Token<"cond","cond">
type TCons = Token<"cons","cons">
type THead = Token<"head","head">
type TTail = Token<"tail","tail">
type TApply = Token<"apply","apply">
type TNum = Token<"#","#">
type TLen = Token<"len","len">
type TExplode = Token<"explode","explode">
type TImplode = Token<"implode","implode">
type TStringLit<Val extends string> = Token<"string",Val>
type TCurry = Token<"curry","curry">
type TInvalid = Token<"Invalid","">

type TokenizeString<T extends string, Run extends string> = T extends `"${infer rest extends string}` ? [TStringLit<Run>, ...Tokenize<rest>]
    //escape sequences
    : T extends `\\"${infer rest extends string}` ? TokenizeString<rest, `${Run}${'"'}`>
    : T extends `\\n${infer rest extends string}` ? TokenizeString<rest, `${Run}${'\n'}`>
    : T extends `\\r${infer rest extends string}` ? TokenizeString<rest, `${Run}${'\r'}`>
    : T extends `\\t${infer rest extends string}` ? TokenizeString<rest, `${Run}${'\t'}`>
    : T extends `${infer char extends string}${infer rest extends string}` ? TokenizeString<rest, `${Run}${char}`>
    : [TInvalid]

type Tokenize<T extends string> = T extends "lambda"
    ? [TLambda]
    : T extends "" ? []
    : T extends "~" ? [TNot]
    : T extends "try" ? [TTry]
    : T extends "len" ? [TLen]
    : T extends "curry" ? [TCurry]
    : T extends "apply" ? [TApply]
    : T extends "explode" ? [TExplode]
    : T extends "implode" ? [TImplode]
    : T extends "cond" ? [TCond]
    : T extends "cons" ? [TCons]
    : T extends "head" ? [THead]
    : T extends "tail" ? [TTail]
    : T extends "if" ? [TIf]
    : T extends "true" ? [TTrue]
    : T extends "false" ? [TFalse]
    : T extends "[]" ? [TEmptyList]
    : T extends "#" ? [TNum]
    : T extends "*" ? [TTimes]
    : T extends "/" ? [TDiv]
    : T extends "+" ? [TPlus]
    : T extends "-" ? [TMinus]
    : T extends "<" ? [TLT]
    : T extends "<=" ? [TLTE]
    : T extends ">" ? [TGT]
    : T extends ">=" ? [TGTE]
    : T extends "==" ? [TEQ]
    : T extends "!=" ? [TNE]
    : T extends `"${infer data extends string}` ? [...TokenizeString<data, "">]
    : T extends `(${infer rest extends string}` ? [TOpenParen, ...Tokenize<rest>]
    : T extends `)${infer rest extends string}` ? [TCloseParen, ...Tokenize<rest>]
    : T extends `${infer pk extends string})${infer rest extends string}` ? [...Tokenize<pk>, TCloseParen, ...Tokenize<rest>]
    : T extends `${infer t1 extends string} ${infer rest extends string}` ? [...Tokenize<t1>, ...Tokenize<rest>]
    : T extends `-${infer _}` ? [TLitInt<T>]
    : T extends `0${infer _}` ? [TLitInt<T>]
    : T extends `1${infer _}` ? [TLitInt<T>]
    : T extends `2${infer _}` ? [TLitInt<T>]
    : T extends `3${infer _}` ? [TLitInt<T>]
    : T extends `4${infer _}` ? [TLitInt<T>]
    : T extends `5${infer _}` ? [TLitInt<T>]
    : T extends `6${infer _}` ? [TLitInt<T>]
    : T extends `7${infer _}` ? [TLitInt<T>]
    : T extends `8${infer _}` ? [TLitInt<T>]
    : T extends `9${infer _}` ? [TLitInt<T>]
    : [TIdent<T>]

type SubSelect<T extends Token<any,any>[], Depth extends UInt> =
    Depth extends N<0> ? [[],T]
    : [Depth, T] extends [N<1>, [TCloseParen, ...infer rest extends Token<any,any>[]]] ? [[], rest]
    : T extends [TOpenParen, ...infer rest extends Token<any,any>[]] ? SubSelect<rest,UInc<Depth>> extends infer SubSq extends [Token<any,any>[], Token<any,any>[]] ? [[TOpenParen, ...SubSq[0]], SubSq[1]] : never
    : T extends [TCloseParen, ...infer rest extends Token<any,any>[]] ? SubSelect<rest,UDec<Depth>> extends infer SubSq extends [Token<any,any>[], Token<any,any>[]] ? [[TCloseParen, ...SubSq[0]], SubSq[1]] : never
    : T extends [infer First extends Token<any,any>, ...infer rest extends Token<any,any>[]] ? [[First, ...SubSelect<rest,Depth>[0]], SubSelect<rest,Depth>[1]]
    : never

type Value = true|false|Int|Lambda<any,any>|Str<any>|List<any>|{error: any, errorType: any}
type SyntaxTree = Value|Token<any,any>|((SyntaxTree|Token<any,any>)[])
type Parse<T extends Token<any,any>[]> =
    T extends [TOpenParen, ...infer rest extends Token<any,any>[]] ?
        SubSelect<rest, N<1>> extends infer sub extends [Token<any,any>[],Token<any,any>[]] ? [Parse<sub[0]>, ...Parse<sub[1]>]
        : never
    : T extends [infer F extends Token<any,any>, ...infer rest extends Token<any,any>[]] ? [F, ...Parse<rest>]
    : T extends [] ? []
    : never

type EvalCond<Trees extends SyntaxTree[]> =
    Trees extends [] ? undefined
    : Trees extends [[infer Condition extends SyntaxTree, infer Value extends SyntaxTree], ...infer rest extends [SyntaxTree, SyntaxTree][]] ?
        true extends EvalTree<Condition> ? EvalTree<Value>
        : EvalCond<rest>
    : {errorType: "cond", error: Trees}

type Lambda<Head,Body> = {head: Head, body:Body}

//zips together one array of keys, and one array of values, stopping when one runs out
type Zip<Keys extends string[], Values extends any[], acc={}> =
    [Keys, Values] extends [[infer FKey extends string, ...infer rKeys extends string[]], [infer FVal, ...infer rVals extends any[]]] ?
        Zip<rKeys, rVals, acc & {[key in FKey]:FVal}>
    : acc

//attempts to zip keys and values, but instead of returning the dict, return the leftovers that weren't included
type UnZip<Keys extends any[], Values extends any[]> =
    [Keys, Values] extends [[any, ...infer rKeys extends any[]], [any, ...infer rVals extends any[]]] ?
        UnZip<rKeys, rVals>
    : [Keys, Values]

// map TIdent<x>[] -> x[]
type GetNames<Names extends TIdent<string>[], acc extends string[]=[]> =
    Names extends [] ? acc
    : Names extends [TIdent<infer N extends string>, ...infer rest extends TIdent<string>[]] ? GetNames<rest,[...acc, N]>
    : never

type UnionOf<T extends any[]> = T extends [] ? never : T extends [infer A, ...infer rest extends any[]] ? A|UnionOf<rest> : never

type ReplaceIdents<Body extends SyntaxTree, LookupMap extends {[key:string]:any}> = Body extends TIdent<infer G extends string> ? G extends keyof LookupMap ? LookupMap[G] : Body
    : Body extends [] ? []
    : Body extends Value ? Body
    : Body extends Token<any,any> ? Body
    : Body extends [TLambda, infer TArgs extends TIdent<string>[], infer SubBody extends SyntaxTree] ?
        GetNames<TArgs> extends infer Names extends string[] ? [TLambda, TArgs, ReplaceIdents<SubBody, Omit<LookupMap, UnionOf<Names>>>] : never
    : Body extends [infer Tok extends SyntaxTree, ...infer RTree extends SyntaxTree[]] ? [ReplaceIdents<Tok,LookupMap>,...ReplaceIdents<RTree,LookupMap>]
    : never

type Explode<S extends string, Barr extends Str<any>[]=[]> = S extends "" ? Barr
    : S extends `${infer C1 extends string}${infer C2 extends string}` ? Explode<C2, [...Barr, Str<C1>]>
    : never

type Implode<S extends Str<any>[], Barr extends string=""> = S extends [] ? Barr
    : S extends [Str<infer A extends string>, ...infer Rest extends Str<any>[]] ? Implode<Rest, `${Barr}${A}`>
    : never

type EvalTreesZipNames<Trees extends SyntaxTree[], Names extends string[], Completed extends {}={}> =
    [Trees, Names] extends [[infer T1 extends SyntaxTree, ...infer Tres extends SyntaxTree[]], [infer S1 extends string, ...infer Strs extends string[]]] ? EvalTreesZipNames<Tres,Strs,Completed&{[key in S1]: EvalTree<T1>}>
    : Completed

type EvalTree<Tree extends SyntaxTree> =
    Tree extends TTrue ? true
    : Tree extends TFalse ? false
    : Tree extends Value ? Tree
    : Tree extends TEmptyList ? List<[]>
    : Tree extends TStringLit<infer value> ? Str<value>
    : Tree extends TLitInt<infer num extends string> ? StringToInt<num>
    : Tree extends [TPlus, infer A extends SyntaxTree, infer B extends SyntaxTree] ?
        [EvalTree<A>, EvalTree<B>] extends infer Pair ?
            Pair extends Int[] ? Add<Pair[0], Pair[1]>
            : Pair extends [Str<infer S1 extends string>, Str<infer S2 extends string>] ? Str<`${S1}${S2}`>
            : {errorType: "+", error: Pair}
        : {errorType: "+", error: Tree}
    : Tree extends [TMinus, infer A extends SyntaxTree, infer B extends SyntaxTree] ?
        [EvalTree<A>, EvalTree<B>] extends infer Pair extends Int[] ? Sub<Pair[0], Pair[1]>
        : {errorType: "-", error: Tree}
    : Tree extends [TMinus, infer A extends SyntaxTree] ?
        EvalTree<A> extends infer Num extends Int ? Neg<Num>
        : {errorType: "unary -", error: Tree}
    : Tree extends [TLen, infer A extends SyntaxTree] ?
        EvalTree<A> extends List<infer Ls extends any[]> ? {neg: false, mag: Len<Ls>}
        : {errorType: "len", error: Tree}
    : Tree extends [TNum, infer Num extends SyntaxTree] ?
        EvalTree<Num> extends infer Val ?
            Val extends Int ? Str<IntToString<Val>>
            : Val extends Str<infer Content extends string> ? StringToInt<Content>
            : {errorType: "#", error: Val}
        : {errorType: "#", error: Tree}
    : Tree extends [TTimes, infer A extends SyntaxTree, infer B extends SyntaxTree] ?
        [EvalTree<A>, EvalTree<B>] extends infer Pair extends Int[] ? Mul<Pair[0], Pair[1]>
        : {errorType: "*", error: Tree}
    : Tree extends [TDiv, infer A extends SyntaxTree, infer B extends SyntaxTree] ?
        [EvalTree<A>, EvalTree<B>] extends infer Pair extends Int[] ? Div<Pair[0], Pair[1]>
        : {errorType: "/", error: Tree}
    : Tree extends [TIf, infer Cond extends SyntaxTree, infer TB extends SyntaxTree, infer FB extends SyntaxTree] ?
        EvalTree<Cond> extends true ? EvalTree<TB> : EvalTree<Cond> extends false ? EvalTree<FB> : {errorType: "if", tree: Tree}
    : Tree extends [TLTE, infer A extends SyntaxTree, infer B extends SyntaxTree] ?
        [EvalTree<A>, EvalTree<B>] extends infer Pair extends Int[] ? LessThanOrEqual<Pair[0], Pair[1]>
        : {errorType: "<=", error: Tree}
    : Tree extends [TGTE, infer A extends SyntaxTree, infer B extends SyntaxTree] ?
        [EvalTree<A>, EvalTree<B>] extends infer Pair extends Int[] ? LessThanOrEqual<Pair[1], Pair[0]>
        : {errorType: ">=", error: Tree}
    : Tree extends [TLT, infer A extends SyntaxTree, infer B extends SyntaxTree] ?
        [EvalTree<A>, EvalTree<B>] extends infer Pair extends Int[] ? LessThan<Pair[0], Pair[1]>
        : {errorType: "<", error: Tree}
    : Tree extends [TGT, infer A extends SyntaxTree, infer B extends SyntaxTree] ?
        [EvalTree<A>, EvalTree<B>] extends infer Pair extends Int[] ? LessThan<Pair[1], Pair[0]>
        : {errorType: ">", error: Tree}
    : Tree extends [TEQ, infer A extends SyntaxTree, infer B extends SyntaxTree] ?
        [EvalTree<A>, EvalTree<B>] extends infer Pair extends [any,any]? Equal<Pair[0], Pair[1]>
        : {errorType: "==", error: Tree}
    : Tree extends [TNE, infer A extends SyntaxTree, infer B extends SyntaxTree] ?
        [EvalTree<A>, EvalTree<B>] extends infer Pair extends [any,any]? NEqual<Pair[0], Pair[1]>
        : {errorType: "!=", error: Tree}
    : Tree extends [TExplode, infer A extends SyntaxTree] ?
        EvalTree<A> extends Str<infer value extends string> ? List<Explode<value>>
        : {errorType: "explode", error: Tree}
    : Tree extends [TImplode, infer A extends SyntaxTree] ?
        EvalTree<A> extends List<infer Arr extends Str<any>[]> ? Str<Implode<Arr>>
        : {errorType: "implode", error: Tree}
    : Tree extends [TNot, infer A extends SyntaxTree] ?
        EvalTree<A> extends infer Bool extends boolean? Not<Bool>
        : {errorType: "~", error: Tree}
    : Tree extends [TTry, infer ExBlock extends SyntaxTree, infer ErrBlock extends SyntaxTree] ?
        EvalTree<ExBlock> extends infer Res ?
        Res extends {error: any, errorType: any} ? EvalTree<ErrBlock> : Res
        : {errorType: "try", error: ExBlock}
    : Tree extends [THead, infer Ls extends SyntaxTree] ? EvalTree<Ls> extends List<[infer Head extends Value, ...Value[]]> ? Head : {errorType: "head", error: Tree}
    : Tree extends [TTail, infer Ls extends SyntaxTree] ? EvalTree<Ls> extends List<[Value, ...infer Tail extends Value[]]> ? List<Tail> : {errorType: "tail", error: Tree}
    : Tree extends [TCons, infer V extends SyntaxTree, infer Ls extends SyntaxTree] ? EvalTree<Ls> extends List<[...infer Elems extends Value[]]> ? List<[EvalTree<V>, ...Elems]> : {errorType: "cons", error: Tree}
    : Tree extends [TCond, ...infer CondList extends SyntaxTree[]] ? EvalCond<CondList>
    : Tree extends [TCurry, infer Lamb extends SyntaxTree, ...infer Vals extends SyntaxTree[]] ?
        EvalTree<Lamb> extends Lambda<infer Args extends TIdent<string>[], infer Body extends SyntaxTree> ?
            Lambda<UnZip<Args,Vals>[0], ReplaceIdents<Body, EvalTreesZipNames<Vals,GetNames<Args>>>>
            : {errorType: "curry", error:EvalTree<Lamb>}
    : Tree extends [TApply, infer Lamb extends SyntaxTree, infer ls extends SyntaxTree] ?
        [EvalTree<Lamb>, EvalTree<ls>] extends [infer Lmb extends Lambda<any,any>, List<infer Arguments extends Value[]>] ?
            EvalTree<[Lmb, ...Arguments]>
        : {errorType: "apply", error: Tree}
    : Tree extends [TLambda, infer Argnames extends TIdent<string>[], infer Body extends SyntaxTree] ? Lambda<Argnames,Body>
    : Tree extends [Lambda<infer Argnames extends TIdent<string>[], infer Body extends SyntaxTree>, ...infer Args extends SyntaxTree[]] ?
        EvalTree<ReplaceIdents<Body, EvalTreesZipNames<Args,GetNames<Argnames>>>>
    : Tree extends [infer Lamb extends SyntaxTree, ...infer Arguments extends SyntaxTree[]] ? EvalTree<Lamb> extends infer L extends Lambda<any,any> ? EvalTree<[L, ...Arguments]> : {errorType: "function call", error: Tree}
    : {errorType: "ukn", error: Tree}

type Displays<T extends any[]> = T extends [] ? []
    : T extends [infer A, ...infer B extends any[]] ? [Display<A>, ...Displays<B>]
    : [{errorType: "display error"}]

type Display<T> = T extends Int ? IntToString<T> extends `${infer N extends number}` ? N : {errorType: "parse int", error:T}
    : T extends Str<infer R extends string> ? R
    : T extends Lambda<infer args extends TIdent<any>[], infer Body> ? [Display<args>, "->", Display<Body>]
    : T extends [...infer stuff extends any[]] ? Displays<stuff>
    : T extends List<[...infer Elems]> ? Displays<Elems>
    : T extends TIdent<infer str extends string> ? `var{${str}}`
    : T extends Token<any, infer Val extends string> ? `op{${Val}}`
    : T

type Eval<T extends string> = Parse<Tokenize<T>> extends infer T ?
    T extends {errorType: "parse error"} ? T : T extends [infer Tree extends SyntaxTree] ? Display<EvalTree<Tree>> : T : T

//examples:
const mixedLists: Eval<"((lambda (a b c d) (cons a (cons b (cons c (cons d []))))) 1 \"5\" 9 [] )"> = [1, "5", 9, []]
const reverse: Eval<'(implode ((lambda (self arg) (self self arg [])) (lambda (self ls acc)  (if (== ls []) acc (self self (tail ls) (cons (head ls) acc))) ) (explode "hello, world")))'> = "dlrow ,olleh"


const tryCatch2: Eval<'(try (+ "4" 4) "error")'> = "error"
const binaryTree: Eval<'((lambda (self arg) (self self arg)) (lambda (self depth) (if (== depth 0) [] (cons (self self (- depth 1)) (cons (self self (- depth 1)) [])))) 3)'> = [[[[],[]],[[],[]]],[[[],[]],[[],[]]]]
const cond1: Eval<'(cond ((> 1 0) "case 1") ((== 3 4) "case 2") (true "default"))'> = "case 1"
const condDefault: Eval<'(cond ((< 1 0) "case 1") ((== 3 4) "case 2") (true "default"))'> = "default"
const lambda: Eval<'((lambda (a) (+ "hello, " a)) "world!")'> = "hello, world!"
const apply: Eval<'(apply (lambda (a b c) (* (+ a b) c)) (cons 1 (cons 2 (cons 3 []))))'> = 9
const curry: Eval<'((curry (lambda (a b) (+ a b)) 1) 4)'> = 5
const tryCatch: Eval<'(try (+ (# "4") 4) "error")'> = 8
const recursion: Eval<"((lambda (self arg) (self self arg)) (lambda (self arg) (if (== 0 arg) 1 (* arg (self self (- arg 1))))) 6)"> = 720
const lists: Eval<"((lambda (self arg) (self self arg))  (lambda (self arg) (if (== arg -1) [] (cons arg (self self (- arg 1))))) 10)"> = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
const deepCompare: Eval<'(== (cons "blah" (cons 4 [])) (cons "blah" (cons 4 [])))'> = true
const listLength: Eval<'(len (cons 3 (cons true (cons [] []))))'> = 3
const lambdaDebug: Eval<'(curry (lambda (a b) (* a b)) 2)'> = [["var{b}"], "->", ["op{*}", 2, "var{b}"]]