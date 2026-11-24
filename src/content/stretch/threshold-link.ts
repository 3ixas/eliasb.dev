/*
 * Threshold's link (#462): the three choices the case study's working figure offers, and the link Threshold itself
 * writes for them. The cities, districts and places are Threshold's own, read from `3ixas/threshold` on its `main`
 * (`src/data/{london,basel,zurich}.ts`, `src/lib/types.ts`), in its order; the format is its `src/lib/url-state.ts`:
 * `/{city}?district={id}&type={place}`. Threshold reads every other field as its default when it is absent, so the
 * link opens the live calculator on exactly these three choices.
 */

/** The figure's words (docs/content/redesign-copy.md, "Threshold"). */
export const thresholdLinkCopy = {
  city: "City",
  district: "District",
  place: "Place",
  copy: "Copy link",
  copied: "Copied",
  caption: "Change a choice and the link changes with it. Copy it to open Threshold as you left it.",
} as const;

export const THRESHOLD_ORIGIN = "https://threshold-beta.vercel.app";

/** Each city's districts as `[id, name]`, in Threshold's order (London by zone). */
const districts = {
  london: [
    ["city-of-london", "City of London"],
    ["camden", "Camden"],
    ["hackney", "Hackney"],
    ["islington", "Islington"],
    ["kensington-chelsea", "Kensington & Chelsea"],
    ["lambeth", "Lambeth"],
    ["southwark", "Southwark"],
    ["tower-hamlets", "Tower Hamlets"],
    ["wandsworth", "Wandsworth"],
    ["westminster", "Westminster"],
    ["brent", "Brent"],
    ["ealing", "Ealing"],
    ["greenwich", "Greenwich"],
    ["hammersmith-fulham", "Hammersmith & Fulham"],
    ["hounslow", "Hounslow"],
    ["lewisham", "Lewisham"],
    ["newham", "Newham"],
    ["barnet", "Barnet"],
    ["bromley", "Bromley"],
    ["croydon", "Croydon"],
    ["haringey", "Haringey"],
    ["merton", "Merton"],
    ["richmond-thames", "Richmond upon Thames"],
    ["waltham-forest", "Waltham Forest"],
    ["barking-dagenham", "Barking & Dagenham"],
    ["bexley", "Bexley"],
    ["enfield", "Enfield"],
    ["kingston-thames", "Kingston upon Thames"],
    ["redbridge", "Redbridge"],
    ["sutton", "Sutton"],
    ["harrow", "Harrow"],
    ["hillingdon", "Hillingdon"],
    ["havering", "Havering"],
  ],
  basel: [
    ["altstadt", "Altstadt & Vorstädte"],
    ["gundeldingen", "Gundeldingen & St. Alban"],
    ["bachletten", "Bachletten & Gotthelf"],
    ["iselin", "Iselin & St. Johann"],
    ["bruderholz", "Bruderholz"],
    ["kleinbasel-nord", "Kleinbasel Nord"],
    ["kleinbasel-sued", "Kleinbasel Süd"],
  ],
  zurich: [
    ["kreis-1", "Kreis 1"],
    ["kreis-2", "Kreis 2"],
    ["kreis-3", "Kreis 3"],
    ["kreis-4", "Kreis 4"],
    ["kreis-5", "Kreis 5"],
    ["kreis-6", "Kreis 6"],
    ["kreis-7", "Kreis 7"],
    ["kreis-8", "Kreis 8"],
    ["kreis-9", "Kreis 9"],
    ["kreis-10", "Kreis 10"],
    ["kreis-11", "Kreis 11"],
    ["kreis-12", "Kreis 12"],
  ],
} as const satisfies Record<string, readonly (readonly [string, string])[]>;

export type ThresholdCity = keyof typeof districts;

export const thresholdCities: readonly { id: ThresholdCity; name: string; districts: readonly (readonly [string, string])[] }[] = [
  { id: "london", name: "London", districts: districts.london },
  { id: "basel", name: "Basel", districts: districts.basel },
  { id: "zurich", name: "Zurich", districts: districts.zurich },
];

export const thresholdPlaces = [
  ["room", "Room"],
  ["studio", "Studio"],
  ["1bed", "1-bed"],
  ["2bed", "2-bed"],
  ["3bed", "3-bed"],
] as const;

export type ThresholdChoice = { city: ThresholdCity; district: string; place: (typeof thresholdPlaces)[number][0] };

/** Where the figure starts: Hackney, a room, as the issue's checked link. */
export const thresholdStart: ThresholdChoice = { city: "london", district: "hackney", place: "room" };

/** The working link: Threshold opens on these three choices. */
export const thresholdLink = ({ city, district, place }: ThresholdChoice) =>
  `${THRESHOLD_ORIGIN}/${city}?${new URLSearchParams({ district, type: place })}`;

/** A city's first district is Threshold's own default, so a new city starts there. */
export const firstDistrict = (city: ThresholdCity) => thresholdCities.find(({ id }) => id === city)!.districts[0][0];

/** Canonical preview choice for a city on the homepage switcher: London keeps `thresholdStart` (Hackney, room); other cities open on their first district. */
export const thresholdCityChoice = (city: ThresholdCity): ThresholdChoice =>
  city === thresholdStart.city ? thresholdStart : { city, district: firstDistrict(city), place: thresholdStart.place };

/** The canonical Threshold URL without its scheme, as shown in URL previews. */
export const thresholdDisplayLink = (choice: ThresholdChoice) => thresholdLink(choice).replace(/^https?:\/\//, "");
