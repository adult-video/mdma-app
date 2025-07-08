# ACID
This is a stand-alone module that contains the core functionalities of my livecoding language ACID (which is short for **A**lgorithms **C**reate **I**mage **D**ata). For the packaged software please refer to [this]() repository.

This repository acts as a submodule for my various applications. At the same time it can be run as a standalone web demo. For this the `index.html` file and the `script.js` file is used. All files used for the submodule are contained within the `/js/` folder.

## Concept

ACID developed out of TRAM, which is a programming language for MIDI inspired by abstract poetry. When I saw Viznuts project I knew that the same could be done for visuals. After learning WebGL for improving the performance of my then UI based videosynthesizer software I started rewriting ACID to use the same single character interface that TRAM already utilized.

This language has no syntax and every command is exactly one character long. This means there are no runtime errors possible and *every* input creates an output. Not necessarily a beautiful one. But this allows the language to be exlored rather then learned.

I develop these languages to make programming seem less intimidating and more immedeate and fun.

## How ACID works

A text input is split into lines and each line is split into single characters. Some characters act as mathematical operations (A adds two values together, D divides them instead), some characters are directly mapped to floating point values (X and Y are mapped to the fragCoords for instance), others to dynamic values (C is mapped to the current time, R is mapped to a random value), others refer to simple functions (L will return the lower of two values, S will return the value parsed through a sine function) while some characters refer to more complex functions (W will generate a water looking shader, N will generate Perlin noise).

Characters in one line will be treated as parameters for the functions that were opened before them until all open functions have recieved all the parameters they require. Empty parameters are set to default values.

Every line represents one color channel, 1 is alpha, 2 is red, 3 is green, 4 is blue, 5 is alpha again and so on. With every 4 lines the generated shader is multiplied by a factor that becomes progressively smaller so that higher line numbers have less influence on the generated visual.

## How to take ACID

```
A Add -> adds two values together
B Bitmap(n) -> returns a value array of all characters in the line
C Clock(divider) -> returns a linear clock function
D Divide -> divides two values
E Expand(v) -> makes lower values larger
F Frame(divider) -> returns the frame number
G Greater(a,b) -> returns the greater of two values
H cursorX -> returns the value of the x position of the cursor
I Invert(v) -> inverts a value
J cursorY -> returns the value of the y position of the cursor
K Compress(v) -> makes larger values smaller
L Lower(a,b) -> returns the lower of two values
M Minus -> substracts two values from each other
N Noise(p) -> steps through simplex noise
O Perlin(p) -> steps through perlin noise
P Plasma(p) -> steps through plasma
Q Square(v) -> returns a square wave
R Random -> returns a random value
S Sine(v) -> returns a sine wave
T Times -> multiplies two values
U Uncertainty -> returns a random value that changes every bar
V Triangle(v) -> returns a triangular function
W Water(p) -> steps through a water shader
X X -> returns x position on grid
Y Y -> returns y position on grid
Z Keypress -> returns boolean of space key pressed
```

The number `0-9` act as floating point values ranging from `0.0` to `1.0`.

Unmapped characters are simply ignored.

Using a whitespace characters (such as a tab or regular space produced by the spacebar) will close all open functions and can be used to not pass a certain character as function argument (`WC` will step through the water shader based on the clock, while `W C`  will generate a static water texture that is then added to a solid value based on the clock). This does not work when using characters which are arithmetic (`2DC` and `2D C` produce the same output).

Writing a `!` character infront of a line will treat the line as a comment. When using ACID within a dedicated application the character for comments can be changed. When using the application you can also change the seed, toggle between a global `bitmap` function and one that only takes the characters in the same line and additional characters that are to be treated as functions (this allows the remapping of already mapped characters as well as the usage of special characters as well as characters from other alphabets like `Ö` or `Ш` ).

Support for lowercase characters is built-in. They are then being treated as floating point values with a higher resolution then the regular arabic numerals.

## Planned features

- A four colour gradient shader
- A fractal shader
- A fire/lava shader
- Optional flag that allows more arguments per function (currently most shader functions use a maximum of one argument while they could take 3 or more)
- Exposing color values of pixels as floating point values to be used as midi control changes or similiar
- Passing midi control change values to shader functions as arguments
- Post-processing that includes curve based colorgrading as well as indexed color modes to force certain asthetics and transformations on the canvas
- Implementation of images, videos and real-time webcam video

## Acknowledgement

This project is inspired by [IBNIZ](http://viznut.fi/ibniz/) by Viznut, [ORCA](https://100r.co/site/orca.html) by Hundred Rabbits and [in:verse](https://inverse.website/) by noisyneuron.
