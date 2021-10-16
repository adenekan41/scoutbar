<br />
<p align="center">
  <img src="https://i.ibb.co/48t7SBX/Group-11.png" width="280"/>
</p>
<h2 align="center">Scoutbar</h2>

<p align="center">⌨️ Spolight for your app</p>

<br />
<br />

[![npm](https://badge.fury.io/js/scoutbar.svg)](https://www.npmjs.com/package/scoutbar)

[![NPM](https://nodei.co/npm/scoutbar.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/scoutbar/)

### [See Demo On Codesandbox](https://codesandbox.io/s/jolly-gould-6s6yl?file=/src/App.js)

## ⚡️Overview

Users enjoy hitting `CMD + K` to search and perform complex actions online on
big projects like Slack, Workspace by Facebook, etc. Users with good knowledge
of what they are looking for have been proven to be able to navigate apps more
effectively by 22%. Introduce Scourbar, an easy-to-install, portable, and
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

## 🍷 Documentation

Coming soon ...

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

## 🤝 License

> MIT © [codewonders.dev](https://codewonders.dev) &nbsp;&middot;&nbsp; GitHub
> [@adenekan41 / codewonders](https://github.com/adenekan41)
