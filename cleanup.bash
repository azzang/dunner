#!/usr/bin/env bash

cp starter-recipes.json ../heroku
cp -r api ../heroku
cp -r models ../heroku
cp -r src/sounds ../heroku/public
# cp -r bower_components/bootstrap/dist/fonts ../heroku/public
cp -r src/images ../heroku/public
rm ../heroku/public/main.js ../heroku/public/main.css
