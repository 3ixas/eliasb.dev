export const integrationConfig = {
  github: {
    username: "3ixas",
    profileUrl: "https://github.com/3ixas",
  },
  letterboxd: {
    username: "3lxas",
    profileUrl: "https://letterboxd.com/3lxas/",
    feedUrl: "https://letterboxd.com/3lxas/rss/",
  },
  goodreads: {
    userId: "171686303",
    profileUrl: "https://www.goodreads.com/user/show/171686303-elias-bennett",
    // Goodreads' public shelf widget: the RSS feed needs a private key, this needs none.
    currentlyReadingWidgetUrl:
      "https://www.goodreads.com/review/custom_widget/171686303.currently-reading?num_books=1&order=d&shelf=currently-reading&show_author=1&show_cover=1&show_title=1&sort=date_added",
  },
} as const;
