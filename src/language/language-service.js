const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
  // i need a service to get the very next word in the list so it can display on the client
  getNextWord(db, language_id) {
    return db
      .from("word")
      .join("language", "word.id", "=", "language.head")
      .select("original", "language_id", "correct_count", "incorrect_count")
      .where({ language_id });
  },

  },
}

module.exports = LanguageService
