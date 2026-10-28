import { bookFromGoodreads } from "./signal-mappers.ts";
import type { Book } from "./types";

function entities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** The cover as Goodreads' widget sizes it (a 75 px one) at the size the site draws it, which its image host serves for any width. */
const largerCover = (src: string) => src.replace(/\._S[XY]\d+_\./, "._SX300_.");

/**
 * The book on a Goodreads "custom widget" shelf (`review/custom_widget/<user>.<name>?shelf=currently-reading&num_books=1`).
 * The widget is public and needs no key: it is a script that assigns the shelf's HTML to `widget_code`. Returns null for an empty
 * shelf, and throws for anything that is not the widget, so a cached good result is kept over a broken one.
 */
export function bookFromGoodreadsWidget(script: string): Book | null {
  // The shelf is one single-quoted JavaScript string; its end is the first quote that is not escaped.
  const literal = script.match(/widget_code = '((?:[^'\\]|\\.)*)'/)?.[1];
  if (literal === undefined) throw new Error("Goodreads returned something other than its widget");
  let html: string;
  try {
    html = JSON.parse(`"${literal.replace(/\\'/g, "'")}"`) as string;
  } catch {
    throw new Error("Goodreads returned a widget that could not be read");
  }
  if (!html.includes("gr_custom_container_")) throw new Error("Goodreads returned something other than its widget");
  if (!html.includes("gr_custom_each_container_")) return null;

  const title = html.match(/class="gr_custom_title_\d*">\s*<a[^>]*>([^<]*)<\/a>/)?.[1];
  const author = html.match(/class="gr_custom_author_\d*">\s*by\s*<a[^>]*>([^<]*)<\/a>/)?.[1];
  const cover = html.match(/class="gr_custom_book_container_\d*">[\s\S]*?<img[^>]+src="([^"]+)"/)?.[1];
  const book = bookFromGoodreads({
    title: title && entities(title),
    author: author && entities(author),
    coverUrl: cover && largerCover(entities(cover)),
  });
  if (!book) throw new Error("Goodreads listed a book without a title or author");
  return book;
}
