# Adult Video

This is a collection of classes that are shared across multiple of my applications. This repository is intended to be used as a git submodule and does not do anything stand-alone.

The classes have dependencies which are not managed by this repository. They have to be installed by the application that is using them as a submodule.

## Backend

All `.js` files in the `/backend/` path are written for the `main` process of an `electron`  application and export a single class as an unnamed export. All classes are written to `ES5` standard as the `main` process of `electron` does not support `ES6` out of the box.

### actionManager

Is used to attach an object that contains functions named by a key. The functions can then be executed by calling the `action()` function on the instance. I use this class mostly for cleaner code.

### fsManager

Is used to handle the backend logic of writing a `json` object to disk, opening and saving files. It is not completely clean as the function `setKeyToValue()`  and `overwrite()` are public and can modify the file.

### menuManager

Is used to construct menus for `electron` from a custom shortform object structure.

### windowManager

Is used to handle `BrowserWindow` objects, pass data to them through `ipc` and handle any frontend applications that make use of `BrowserWindow` such as displaying alerts or file dialogues.

## Frontend

All `.js` files in the `/frontend/` path are written to be used in classes for the `renderer` process. All files export a single class that is written to `ES6` standard (so the `script` that is using the class has to have `type="module"`).

### fsWrapper

Is used to handle interactions with the `electron-json-storage` and works in tandem with `fsManager`

### guiWrapper

Offers very crude functions that somewhat replace a more complex and bloated usage of  `react`. Automatically attaches event handlers to nodes from an `actions` object passed to the constructor. Sets the `innerText` for nodes passed in an `display` object to values passed in a nested object.

### ioWrapper

Handles interactions with `webMidi` and other interfaces. Exposes information of all available interfaces. Can handle transport, clocking, data input and output for various interfaces through a unified data structure based on the data structure of `webMidi`.