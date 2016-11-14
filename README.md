Install Node 6.5 or higher.

Install Gulp.

Run `npm install.`

Download the Kaggle dataset from this page https://www.kaggle.com/usfundamentals/us-stocks-fundamentals and place it inthe data folder.

Make sure the permissions of the data folder is set to 777 or is writable from gulp.

Run `gulp data` to extract and normalize the data.

Run `gulp` to enter development mode.

Run `gulp prod` to package the app into a Mac App.