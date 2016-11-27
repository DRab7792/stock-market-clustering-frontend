# Stock Market Clustering Frontend

This is the front end electron app that patners with the Stock Market Clustering WordPress backend. The purpose of this repo is to display interactive visualizations as well as the proposal and paper written for this project in the form of a desktop web app. 

## Installation

1. Install Node 6.5 or higher.

2. Install Gulp.

3. Run `npm install`

4. Download the Kaggle dataset from this page https://www.kaggle.com/usfundamentals/us-stocks-fundamentals and place it inthe data folder.

5. Make sure the permissions of the data folder is set to 777 or is writable from gulp.

6. Run `gulp data` to extract and normalize the data.

7. Run `gulp` to enter development mode.

8. Run `gulp prod` to package the app into a Mac App.

## Usage

This program is meant to be installed and ran as is or forked from the framework tag in order to use the electron template in other ways.

## Overview

### Data Mining and Normalization

The data mining and normalization occurs as a gulp task called data. The majority of the code written for the data mining in this project is stored in the /dsl folder. The data is stored in the /data folder and copied into the app build.

### Data Manipulation

The data manipulation occurs in app in a few locations in the app itself. The main location is in the data controller (/app/src/js/controllers/data.js). The data controller orchestrates all computations and passes the necessary data down to the components and visualizations.

BackboneJS is used as a MVC framework to help the data controller. The models are stored in the /app/src/js/models folder and include abstractions for a company and a price in the stock market. Collections of these models are stored in /app/src/js/collections and handle computation as well as some of the normalization tasks.

### Components

Currently the web development community has embraced ReactJS - at least this week. As a result all of the components for the app are written as React components and stored in /app/src/components. Most of these components are entire pages but some are reusable components seen on multiple pages.

### Visualizations

The visualizations are written in D3JS and stored in /app/src/js/components/visuals. These are all carefully instantiated from the paper.jsx component and are independant of the React VirtualDOM, therefore they are fairly independant of the rest of the app. They call the data controller to get what they need and are all contained inside an svg tag.

## License

See LICENSE.txt
=======
### Data Manipulation

### Components

### Visualizations

## License

See LICENSE.txt
