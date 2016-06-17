# n-to-n full-bit functions

An n-to-n full-bit function takes n full bits of information as input, and produces n full bits of information as output.
A full bit is a Boolean variable that is true for exactly half the valuations of the other bits. This means that, for
n-to-n full-bit functions:

* the number of Boolean inputs is `n`.
* the amount of input information is a full `n` bits.
* the number of Boolean outputs is `n`.
* the amount of output information is a full `n` bits.

Consequently, the list of `n`-bit outputs is a permutation of the list of possible `n`-bit inputs. Because:

* for any function, each `n`-bit input must have exactly one corresponding `n`-bit output, otherwise the function wouldn't be deterministic.
* if two different `n`-bit inputs would correspond to the same `n`-bit output, information would be lost, and the `n` output bits would not
contain a full `n` bits of information.

This means it's easy to enumerate all `n`-to-`n` full-bit functions for a given `n`: they are the `(2^n)!` possible functions where the list of
full outputs is a permutations of the list of full inputs.

For `n=1`, there are `(2^1)!=2`: `f(A) = A`, and `f(A) = NOT(A)`.

For `n=2`, there are `(2^2)!=24`:

* `f(A, B) = (A, B)`
* `f(A, B) = (A, NOT(B))`
* `f(A, B) = (NOT(A), B)`
* `f(A, B) = (NOT(A), NOT(B))`

* `f(A, B) = (B, A)`
* `f(A, B) = (B, NOT(A))`
* `f(A, B) = (NOT(B), A)`
* `f(A, B) = (NOT(B), NOT(A))`

* `f(A, B) = (A XOR B, B)`
* `f(A, B) = (A XOR B, NOT(B))`
* `f(A, B) = (NOT(A XOR B), B)`
* `f(A, B) = (NOT(A XOR B), NOT(B))`

* `f(A, B) = (A XOR B, A)`
* `f(A, B) = (A XOR B, NOT(A))`
* `f(A, B) = (NOT(A XOR B), A)`
* `f(A, B) = (NOT(A XOR B), NOT(A))`

* `f(A, B) = (A, A XOR B)`
* `f(A, B) = (A, NOT(A XOR B))`
* `f(A, B) = (NOT(A), A XOR B)`
* `f(A, B) = (NOT(A), NOT(A XOR B))`

* `f(A, B) = (B, A XOR B)`
* `f(A, B) = (B, NOT(A XOR B))`
* `f(A, B) = (NOT(B), A XOR B)`
* `f(A, B) = (NOT(B), NOT(A XOR B))`

Since each function `F` can be interpreted as a permutation, it has a dual `D`, such that `D(F(A))=A`. Some functions are their own dual.
Also, there is also a cycle length `c` such that applying `F` for `c` times in a row will be equivalent to the identity operation. For functions
that are their own dual, `c=1`, and for functions that are their dual's dual, `c=2`. This corresponds to the cycle-type of the permutation to which
the function is equivalent. For `n=1` variables, both functions have `c=1`. For `n=2`, there are 10 with `c=1` and 14 with `c=2`.

We can also look at the number of input variables each output variable depends on. For instance, the output `NOT(A)` depends on only one input
variable, but the output `A XOR B` depends on two. For 2-to-2 full-bit functions, there are 8 where each output variable depends on only one
input variable, and 16 where one of the output variables contains exactly the information from one input bit, and the other one contains a mix
of both.

This touches on an interesting point about information theory. If you view information as if it were coloured sand, you could imagine the
information contained in the two inputs `A` and `B` as one kilo of red sand, and one kilo of blue sand, respectively. An output bit that depends
entirely on one input bit would contain exactly one kilo of sand again, either red or blue. An output that depends on both could be imagined as
half a kilo of red sand, and half a kilo of blue sand (or maybe one kilo of mixed up, purple sand). But this analogy is incorrect, since a function
like `f(A, B) = (A, A XOR B)` is information-preserving (two full bits of information are contained in the input as well as in the output), but
a function that converts one kilo of red and one kilo of blue sand into 1.5 kilos of red and 0.5 kilos of blue sand, would have redundancy in the
output representation of the red sand, and would lose half the blue sand.

It's easy to understand the information-preserving quality of `f(A, B) = (A, A XOR B)` in another way though: from `(A, A XOR B)` you can go back
by first noting that `A` is preserved entirely, and *given `A`*, you can derive `B` from `A XOR B`. So although the second output does not contain
all of `B`, in combination with (or relative to) the first output `A`, it does contain the full bit of information about `B`.

There are no 2-to-2 full-bit functions where each output depends on each input; in other words, `XOR` cannot appear in the expression for both output bits. Some of them switch the position of the information from the output bits, for instance `f(A, B) = (B, A)` does this. If a function XORs one of the input bits and also switches the bits around, its dual will need to do the same. If it leaves on variable in place (possibly inverting it) and XORs the other, then its dual also shouldn't switch the bits around. Therefore, the number of inputs each output bit depends on, related to the same measure for the function's dual, looks as follows:

* 6 functions XOR nothing and are their own dual (notation: '11-*')
* 2 function (namely `(NOT(B), A)` and `(B, NOT(A)`) XOR nothing, and are each other's dual (notation: '11-11')
* 2 functions use XOR in the first output bit, and are each other's dual (notation:  '21-21')
* 2 functions use XOR in the second output bit, and are each other's dual (notation:  '12-12')
* 2 functions use XOR in the first output bit, and are their own dual (notation: '21-*')
* 2 functions use XOR in the second output bit, and are their own dual (notation: '12-*')
* 4 functions use XOR in the second output bit, yet their 4 duals do so in the first output bit (notation: '12-21')
* 4 functions are the duals of those (notation '21-12')

The faculty of an exponential function grows quickly: although there are just two 1-to-1 full-bit functions and 24 2-to-2 ones, for `n=3`, there are
over 40,000. So I won't enumerate them. :)

I did however look at the number of input bits each output bit depends on for each of these functions, and their duals:

    '111-*': 20, '111-111': 28,
    '112-*': 8, '112-112': 24, '112-121': 32, '112-211': 32,
    '113-*': 24, '113-113': 56, '113-131': 80, '113-311': 80,
    '121-*': 8, '121-112': 32, '121-121': 24, '121-211': 32,
    '122-*': 8, '122-122': 8, '122-123': 16, '122-132': 16, '122-212': 16, '122-213': 16, '122-221': 16, '122-231': 16, '122-312': 16, '122-321': 16,
    '123-*': 8, '123-122': 16, '123-123': 24, '123-132': 32, '123-133': 32, '123-212': 16, '123-213': 32, '123-221': 16, '123-231': 32, '123-312': 32, '123-313': 32, '123-321': 32, '123-331': 32,
    '131-*': 24, '131-113': 80, '131-131': 56, '131-311': 80,
    '132-*': 8, '132-122': 16, '132-123': 32, '132-132': 24, '132-133': 32, '132-212': 16, '132-213': 32, '132-221': 16, '132-231': 32, '132-312': 32, '132-313': 32, '132-321': 32, '132-331': 32,
    '133-*': 48, '133-123': 32, '133-132': 32, '133-133': 528, '133-213': 32, '133-231': 32, '133-312': 32, '133-313': 576, '133-321': 32, '133-331': 576,
    '211-*': 8, '211-112': 32, '211-121': 32, '211-211': 24,
    '212-*': 8, '212-122': 16, '212-123': 16, '212-132': 16, '212-212': 8, '212-213': 16, '212-221': 16, '212-231': 16, '212-312': 16, '212-321': 16,
    '213-*': 8, '213-122': 16, '213-123': 32, '213-132': 32, '213-133': 32, '213-212': 16, '213-213': 24, '213-221': 16, '213-231': 32, '213-312': 32, '213-313': 32, '213-321': 32, '213-331': 32,
    '221-*': 8, '221-122': 16, '221-123': 16, '221-132': 16, '221-212': 16, '221-213': 16, '221-221': 8, '221-231': 16, '221-312': 16, '221-321': 16,
    '223-223': 16, '223-232': 16, '223-322': 16, '223-333': 192,
    '231-*': 8, '231-122': 16, '231-123': 32, '231-132': 32, '231-133': 32, '231-212': 16, '231-213': 32, '231-221': 16, '231-231': 24, '231-312': 32, '231-313': 32, '231-321': 32, '231-331': 32,
    '232-223': 16, '232-232': 16, '232-322': 16, '232-333': 192,
    '233-*': 8, '233-233': 152, '233-323': 160, '233-332': 160, '233-333': 1440,
    '311-*': 24, '311-113': 80, '311-131': 80, '311-311': 56,
    '312-*': 8, '312-122': 16, '312-123': 32, '312-132': 32, '312-133': 32, '312-212': 16, '312-213': 32, '312-221': 16, '312-231': 32, '312-312': 24, '312-313': 32, '312-321': 32, '312-331': 32,
    '313-*': 48, '313-123': 32, '313-132': 32, '313-133': 576, '313-213': 32, '313-231': 32, '313-312': 32, '313-313': 528, '313-321': 32, '313-331': 576,
    '321-*': 8, '321-122': 16, '321-123': 32, '321-132': 32, '321-133': 32, '321-212': 16, '321-213': 32, '321-221': 16, '321-231': 32, '321-312': 32, '321-313': 32, '321-321': 24, '321-331': 32,
    '322-223': 16, '322-232': 16, '322-322': 16, '322-333': 192,
    '323-*': 8, '323-233': 160, '323-323': 152, '323-332': 160, '323-333': 1440,
    '331-*': 48, '331-123': 32, '331-132': 32, '331-133': 576, '331-213': 32, '331-231': 32, '331-312': 32, '331-313': 576, '331-321': 32, '331-331': 528,
    '332-*': 8, '332-233': 160, '332-323': 160, '332-332': 152, '332-333': 1440,
    '333-*': 408, '333-223': 192, '333-232': 192, '333-233': 1440, '333-322': 192, '333-323': 1440, '333-332': 1440, '333-333': 19272,

What calls the attention is that in almost half of 3-to-3 full-bit functions (19,272 out of 40,320), all three output bits depend on all three input bits. This may seem counter-intuitive again, even after seeing that `f(A, B) = (A, A XOR B)` is lossless (loses no information), but to understand how this is possible, consider for instance `f(A, B, C) = (A XOR B, B XOR C, A XOR C)`. Its truthtable is as follows, and we can easily see that the output values are a permutation of the input values:

    A B C | (A ? B : C)  (A ? B : C) (A XOR B XOR C)
    0 0 0 |      0            0             0
    0 0 1 |      1            0             1
    0 1 0 |      0            1             1
    0 1 1 |      1            1             0
    1 0 0 |      0            0             1
    1 0 1 |      0            1             0
    1 1 0 |      1            0             0
    1 1 1 |      1            1             1

Its dual is:

     A B C | (A? NOT(B XOR C) : B XOR C) (C ? B : A) (C ? A : B)
     0 0 0 |            0                     0           0
     0 0 1 |            1                     0           0
     0 1 0 |            1                     0           1
     0 1 1 |            0                     1           0
     1 0 0 |            1                     1           0
     1 0 1 |            0                     0           1
     1 1 0 |            0                     1           1
     1 1 1 |            1                     1           1


The last interesting observation I wanted to point out here is that apart from the many '333-333' functions, there are also some for which the
amount of mix-up is different for the function and its dual. For instance, there are 1440 functions of type '333-332'. This might be an
interesting pointer towards understanding irreversibility.
