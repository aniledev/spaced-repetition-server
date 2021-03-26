const express = require("express");
const LanguageService = require("./language-service");
const { requireAuth } = require("../middleware/jwt-auth");
const bodyParser = express.json();
const { listToArray, _Node } = require("../linked-list");

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

    // returns a json response object with the information from the server as json response object, the netxt word, total counts, etc
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
  const { guess } = req.body;
  // console.log(guess);
  //validate is guess field is missing/ if so send an error, 400 status code
  if (!guess) {
    res.status(400).json({ error: "Missing guess in request body" });
  }
  // use a try / catch block like the api/language endpoint
  try {
    // in order to check the guess we have to get the lists of words from the database
    // use the LanguageService to get the list of words in the database for that language in the database
    const words = await LanguageService.getLanguageWords(
      req.app.get("db"),
      req.language.id
    );

    // then we have to get the start of the words they are practicing
    // use the get head service and pass in necessary parameters
    const [{ head }] = await LanguageService.getLanguageHead(
      req.app.get("db"),
      req.language.id
    );

    // we then have to figure out a way to check if the word is correct and send a response, translation === guess
    // use the checkTranslation to create a new object and check against the database values
    const [checkWord] = await LanguageService.checkTranslation(
      req.app.get("db"),
      req.language.id
    );

    // create a linked list using the service using words from the database
    const list = LanguageService.createLinkedList(words, head);
    if (checkWord.translation === guess) {
      /* if the answer was correct, then double M, the memory value, and reassign*/
      const newMemVal = list.head.value.memory_value * 2;
      list.head.value.memory_value = newMemVal;
      list.head.value.correct_count++;

      let curr = list.head;
      let countDown = newMemVal;
      while (countDown > 0 && curr.next !== null) {
        curr = curr.next;
        countDown--;
      }
      const temp = new _Node(list.head.value);

      /*

      // if we're at the end of the list, next would be empty/null
      if (curr.next === null) {
        temp.next = curr.next;
        curr.next = temp;
        list.head = list.head.next;
        curr.value.next = temp.value.id;
        temp.value.next = null;
      } else {
        temp.next = curr.next;
        curr.next = temp;
        list.head = list.head.next;
        curr.value.next = temp.value.id;
        temp.value.next = temp.next.value.id;
      }
      req.language.total_score++;
      await LanguageService.updateWordsDatabase(
        req.app.get("db"),
        listToArray(list),
        req.language.id,
        req.language.total_score
      );
      */
      res
        .json({
          // nextWord: list.head.value.original,
          // totalScore: req.language.total_score,
          // correctCount: list.head.value.correct_count,
          // incorrectCount: list.head.value.incorrect_count,
          // answer: temp.value.translation,
          isCorrect: true,
        })
        .end();
    } else {
      /* if the answer was wrong, reset M, the memory value to 1 and reassign*/
      // else  if it is incorrect send another response translation !== guess
      // if wrong, the words tested also gets updated by position in the linked list
      /*
      
      list.head.value.memory_value = 1;
      list.head.value.incorrect_count++;

      let curr = list.head;
      let countDown = 1;
      while (countDown > 0) {
        curr = curr.next;
        countDown--;
      }

      const temp = new _Node(list.head.value);
      temp.next = curr.next;
      curr.next = temp;
      list.head = list.head.next;
      curr.value.next = temp.value.id;
      temp.value.next = temp.next.value.id;

      // create a method in the service to update the database
      await LanguageService.updateWordsDatabase(
        // once the linked list has changed on the server end, the data has to be sent back to the database to persist
        req.app.get("db"),
        listToArray(list),
        req.language.id,
        req.language.total_score
      );

      */
      // send back the response data to be used on the front end
      res
        .json({
          // nextWord: list.head.value.original,
          // totalScore: req.language.total_score,
          // correctCount: list.head.value.correct_count,
          // incorrectCount: list.head.value.incorrect_count,
          // answer: temp.value.translation,
          isCorrect: false,
        })
        .end();
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = languageRouter;
