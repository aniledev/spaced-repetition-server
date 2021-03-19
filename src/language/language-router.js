const express = require("express");
const LanguageService = require("./language-service");
const { requireAuth } = require("../middleware/jwt-auth");
const bodyParser = express.json();

const languageRouter = express.Router();

// middleware for the languageRouter
languageRouter
  .use(requireAuth) // jwt middleware authorization
  .use(async (req, res, next) => {
    try {
      // gets the specific language for a user in the database using the LanguageService
      const language = await LanguageService.getUsersLanguage(
        req.app.get("db"),
        req.user.id
      );

      //error handling if there is no language in the database for that user
      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        });

      // the set the req body.language property to a value of the language retrieved from the server
      req.language = language;
      next();
    } catch (error) {
      next(error);
    }
  });

languageRouter.get("/", async (req, res, next) => {
  try {
    // use the LanguageService to get the list of words in the database for that language in the database
    const words = await LanguageService.getLanguageWords(
      req.app.get("db"),
      req.language.id
    );

    // returns  a json response object with the language as a property and the words as another property
    res.json({
      language: req.language,
      words,
    });
    next();
  } catch (error) {
    next(error);
  }
});

// use this endpoint to get the first word in the word table in database, use the getLanguageService, getHead
languageRouter.get("/head", async (req, res, next) => {
  // implement me
  try {
    // use the LanguageService to get the first word in the list
    // create a variable to hold the next word received from the service
    const [nextWord] = await LanguageService.getNextWord(
      req.app.get("db"),
      req.language.id
    );

    // returns  a json response object with the information from the server as json response object, the netxt word, total counts, etc
    res.json({
      nextWord: nextWord.original,
      correctCount: nextWord.correct_count,
      incorrectCount: nextWord.incorrect_count,
      totalScore: req.language.total_score,
    });
    next();
  } catch (error) {
    next(error);
  }
});

// post requests need a json body parser
languageRouter.post("/guess", bodyParser, async (req, res, next) => {
  // implement me
  // destructure the request body to access the guess
  const guess = req.body.guess;

  //validate is guess field is missing/ if so send an error, 400 status code
  if (!guess) {
    res.status(400).json({ error: "Missing guess in request body" });
  }
  // use a try / catch block like th api/language endpoint

  // in order to check the guess we have to get the lists of words from the database

  // then we have to get the start of the words they are practicing

  // we then have to figure out a way to check if the word is correct and send a response, translation === guess

  // this is where the spaced rep, gets implement, use a linked list, if the guess is correct then the move gets moved in the lisk

  // else  if it is incorrect send another response translation !== guess
  //if wrong, the words tested also gets updated by position in the linked list

  res.send("implement me!");
});

module.exports = languageRouter;
