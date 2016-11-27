# **_Dunner._**
Dunner is a tool I built to help me schedule and time recipes. Before Dunner, if I wanted a recipe done by a certain time, I would have to do the arithmetic manually. Dealing with several recipes this way could get pretty hairy, especially if I wanted them staggered. By hairy, I mean literally having to draw out Gantt charts to keep track of everything. [Other recipe timing solutions] exist, but I could never find anything that really met my needs, until Dunner!
## Installation
Dunner is built on the MEAN stack, so if you don't have [Node] and [MongoDB] installed, do that first. Then clone this repository. Use Bower and npm to install dependencies.
```
$ git clone git@github.com:azzang/dunner.git
$ cd dunner
$ bower install
$ npm install
```
## Usage
Dunner relies on [SendGrid], so you'll have to point the API key environment variable (api/user.js) to your own credential if you want the email feature to work. Start Dunner with gulp.
```
$ export SENDGRID_API_KEY=your_api_key
$ gulp
```
## To Do
- Tests for angular code (src/js)
- Better about page - link to demo video instead of twinkies?
- Break Directions Panel (Create / Edit partial) into Prep and Cook Steps?
- Prettier emails. Templates?

[Other recipe timing solutions]: http://www.americaninnovative.com/products/quadtimer.php
[Node]: https://nodejs.org/en/
[MongoDB]: https://docs.mongodb.com/
[SendGrid]: https://sendgrid.com/
