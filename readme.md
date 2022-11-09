<br />
<p align="center">
  <img src="https://i.ibb.co/bXmx6mh/Group-11.png" width="280"/>
</p>
<h2 align="center">ScoutBar</h2>

<p align="center">⌨️ Spotlight for your app</p>

<br />
<br />

[![npm](https://badge.fury.io/js/scoutbar.svg)](https://www.npmjs.com/package/scoutbar)

[![NPM](https://nodei.co/npm/scoutbar.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/scoutbar/)

### [See Demo On Codesandbox](https://codesandbox.io/s/scoutbar-gm9er?file=/src/App.tsx)

### [See Documentation](https://scoutbar.co/docs/home)

## ⚡️Overview

Users enjoy hitting `CMD + K` to search and perform complex actions online on
big projects like Slack, Workspace by Facebook, etc. Users with good knowledge
of what they are looking for have been proven to be able to navigate apps more
effectively by 21%. Introduce Scoutbar, an easy-to-install, portable, and
extensible React component for automating your `command+k` experience.

## 🔧 Installation

You can easily install this package with yarn or npm:

```
$ yarn add scoutbar
```

or

```
$ npm install scoutbar
```

## ✨ Features

- 😎 Easy to install
- 📦 ~400b (gzipped)
- 🙅‍♂️ Support for keyboard navigation
  - Support for keyboard shortcuts for configuring specific actions
- ✂️ Super-flexible API
  - A simple data structure and function helper to help customize your
    experience
- ✅ Fully tested, typed and reliable
- ⚒ CommonJS, ESM & browser standalone support
- 👨🏽‍🔧 Handy and useful helpers
- 👨🏽 Zero Dependencies

## 📖 Usage

One of the best things about it is that it is as simple as integrating one
component. you have scoutbar on your app.

```jsx
import React from 'react';
import { ScoutBar } from 'scoutbar';

export default function App() {
  return (
    <div className="App">
      <ScoutBar
        actions={({ createScoutAction }) => [
          createScoutAction({
            label: 'Get Started',
            description: 'Get started with scoutbar',
            href: '/',
          }),
        ]}
      />
    </div>
  );
}
```

Seeing is believing! There are clear descriptions of each utility, as well as
instructions on how to use them, in the documentation.

## 🍷 Documentation [See All](https://scoutbar.co/docs/home)

### tutorial

#### `Type -> Boolean`

#### `Default -> true`

Allows you the ability to disable / hide scoutbar tutorial hints. i'e the section
that tells users to navigate with the arrows or tabs. e.g

```jsx
  <ScoutBar
    tutorial={false}
    ...
  />
```

### noAnimation

#### `Type -> Boolean`

#### `Default -> false`

Allows you to disable every animation on scoutbar Disables every animations on
scoutbar. this is by default true if scoutbar detects that the user has
requested that the system minimize the amount of non-essential motion it uses.

```jsx
  <ScoutBar
    noAnimation={false}
    ...
  />
```

### theme

#### `Type -> 'light' | 'dark' | 'auto'`

#### `Default -> 'light'`

Allows you to switch the theme of the scoutbar depending on how you want it.
auto switches to the theme of the current system.

```jsx
  <ScoutBar
    theme="light"
    ...
  />
```

### acknowledgement

#### `Type -> Boolean`

#### `Default -> true`

Show the scoutbar acknowledgement logo on the top right of the input bar.

```jsx
  <ScoutBar
   acknowledgement={true}
    ...
  />
```

### brandColor

#### `Type -> String`

#### `Default -> #000`

Allows you to set the official scoutbar brand color. it helps to match the
color grade on your application

```jsx
  <ScoutBar
   brandColor="red"
    ...
  />
```

### placeholder

#### `Type -> String | String[]`

#### `Default -> ['What would you like to do today ?','What do you need?', 'Lets help you navigate'],`

Allows you to switch between different placeholder texts or just a single one.

```jsx
  <ScoutBar
    placeholder={[
      'What products do you need ? ',
      'Whats the name of your phone ?'
    ]}

    or

    placeholder="What do you need ?"
    ...
  />
```

### revealScoutbar

#### `Type -> boolean`

#### `Default -> false`

Reveal the scoutbar with an external action. PS forcefully opens the scoutbar

```jsx
  <ScoutBar
revealScoutbar={// your state hook here }
    ...
  />
```

[See All Documentation](https://scoutbar.co/docs/home)

## 🤔Thought Process

- https://defkey.com/what-means/command-k
- https://www.theverge.com/2017/6/2/15475078/slack-keyboard-shortcuts-how-to-guide#:~:text=%E2%8C%98%20%2B%20K%20%2F%20Ctrl%20%2B%20K,to%20jump%20to%20that%20conversation.

## Contributing

When contributing to this repository, please first discuss the change you wish
to make via an issue. This can be a feature request or a bug report. After a
maintainer has triaged your issue, you are welcome to collaborate on a pull
request. If your change is small or uncomplicated, you are welcome to open an
issue and pull request simultaneously.

Please note we have a code of conduct, please follow it in all your interactions
with the project.

### Running Scoutbar Locally

A local test environment has been setup for developers that wants to develop and
contribute to scoutbar. to start up the dev server do the following

```
$ yarn install
$ yarn run dev // server running on http://localhost:3008
```

### Linking Scoutbar Locally

Run

```
$ npm link
```

This will create a symbolic link in the /usr/local/lib/node_modules/ folder,
that contains the global npm packages in the system, the ones installed using
npm -g.

```
npm link scoutbar
```

Then we run this in the project we want to link scoutbar locally to

[See More on contributing](https://scoutbar.co/docs/contribute)

## 🤝 License

> MIT © [codewonders.dev](https://codewonders.dev) &nbsp;&middot;&nbsp; GitHub
> [@adenekan41 / codewonders](https://github.com/adenekan41)
