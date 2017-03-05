# run `chmod 777 build.sh` to make it executable if you get permission error

# change directory to dev script
cd example_page/js

# copy dev script to dist directory
cp BigPicture.js ../../dist

# minify and add to dist directory
uglifyjs BigPicture.js -m -c pure_getters -c collapse_vars > ../../dist/BigPicture.min.js

# make npm index.js script from dev script
sed 's/global.BigPicture/module.exports/' BigPicture.js > ../../index.js
