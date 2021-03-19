const express = require("express");
const LanguageService = require("./language-service");
const { requireAuth } = require("../middleware/jwt-auth");

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
    const nextWord = await LanguageService.getNextWord(
      req.app.get("db"),
      req.language.id
    );

    // returns  a json response object with the information from the server as json response object, the netxt word, total counts, etc
    res.json({
    });
  } catch (error) {
    next(error);
  }
});

languageRouter.post("/guess", async (req, res, next) => {
  // implement me
  res.send("implement me!");
});

module.exports = languageRouter;
