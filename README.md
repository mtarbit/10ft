10ft
====

A ten foot UI for your HTPC in HTML + JS.

## Deprecated in favour of Ten Foot

This project is no longer under active development. See my [Ten Foot](https://github.com/mtarbit/ten-foot) 
repo for a reboot of this idea as a Ruby on Rails app using <video> and the VLC browser plugin,
rather than an external VLC app instance.

Alternatively, if you're stuck on the combination of Node + VLC see [Vulcan](https://github.com/bboyle/Vulcan)
for a similar project which seems to be still under development.

## Installation

Install base dependencies:

  * [Node JS](http://www.nodejs.org/)
  * [VLC](http://www.videolan.org/vlc/)

Install node package dependencies:

    $ npm install

Configure the app:

    $ cp config.json.example config.json
    $ vi config.json

Start the server:

    $ node app

