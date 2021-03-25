const { LinkedList, listToArray } = require("../linked-list");

const LanguageService = {
  // get the language from the database for a specific user
  getUsersLanguage(db, user_id) {
    return db
      .from("language")
      .select(
        "language.id",
        "language.name",
        "language.user_id",
        "language.head",
        "language.total_score"
      )
      .where("language.user_id", user_id)
      .first();
  },

  // gets the word list for a specific language
  getLanguageWords(db, language_id) {
    return db
      .from("word")
      .select(
        "id",
        "language_id",
        "original",
        "translation",
        "next",
        "memory_value",
        "correct_count",
        "incorrect_count"
      )
      .where({ language_id });
  },

  // get the first word in the list so the user can start learning
  getLanguageHead(db, language_id) {
    return db
      .from("language")
      .join("word", "word.language_id", "=", "language.id")
      .select("head")
      .groupBy("head")
      .where({ language_id });
  },

  // i need a service to get the very next word in the list so it can display on the client
  getNextWord(db, language_id) {
    return db
      .from("word")
      .join("language", "word.id", "=", "language.head")
      .select("original", "language_id", "correct_count", "incorrect_count")
      .where({ language_id });
  },

  // i need a service to check the guess sent to the server against the real translation in the database
  checkTranslation(db, language_id) {
    return db
      .from("word")
      .join("language", "word.id", "=", "language.head")
      .select("*")
      .where({ language_id });
  },

  // a service needs to be created to create a linked list using the words from the database
  createLinkedList(words, head) {
    // create a new linked list using the data structure
    const linkedList = new LinkedList();
    // find the first word in the database words; id === head
    const headWord = words.find((word) => word.id === head);
    // find the index of the first word in the list of database words
    const headIndex = words.indexOf(headWord);
    // declare a variable to hold the spliced list at the head index
    const headNode = words.splice(headIndex, 1);
    // insert a node at the end of a new linked list using the list data structure
    linkedList.insertLast(headNode[0]);

    // the id is the next element in the array we created
    let nextId = headNode[0].next;
    // create a variable to hold the current word, the currentWord is te word in the database where the ids match
    let currentWord = words.find((word) => word.id === nextId);
    // insert currentWord into the last position in the linked list
    linkedList.insertLast(currentWord);
    // reassign the nextWord to to currentWord.next
    nextId = currentWord.next;
    // reassign the current word variable to where id === nextWord in the words database
    currentWord = words.find((word) => word.id === nextId);

    // loop through the linked list until current word is null
    while (currentWord !== null) {
      linkedList.insertLast(currentWord);
      nextWord = currentWord.next;

      if (nextId === null) {
        currentWord = null;
      } else {
        currentWord = words.find((word) => word.id === nextId);
      }
    }
    return list;
  },

  updateWordsDatabase(db, words, language_id, total_score) {
    // create a single transaction to ensure that none of our changes are persisted if there is an error
    return db.transaction(async (trx) => {
      return Promise.all([
        trx("language").where({ id: language_id }).update({
          total_score,
          head: words[0].id,
        }),
        // Map over our words array (which has been updated to match our list), creating a knex transaction to update each word in the array
        ...words.map((word, i) => {
          if (i + 1 >= words.length) {
            word.next = null;
          } else {
            word.next = words[i + 1].id;
          }
          return trx("word")
            .where({ id: word.id })
            .update({
              ...word,
            });
        }),
      ]);
    });
  },
};

module.exports = LanguageService;
