# @yanick/tablet

I play role-playing games -- great fun! And -- funnier still -- I like to write scripts and
whatnots to create characters, roll events, etc.
Enter `tablet`, which is meant to provide tools to access, populate, and use role-playing game data tables.

## Installation 

    pnpm install @yanick/tablet

Or, to make the script `tablet` available globally:

    npm install -g @yanick/tablet
    

## Tablet's killer feature

Now, while it's indubitably handy to have your games' tables in files, it's
also incredibly boring to sit down and copy them wholesale from the original books. 
Which is where one key feature of `tablet` enter the picture. Let's say you
have the file `monster_encounters.md`:

``` 
---
roll: 1d20
---

| roll | monster | notes                                   |
| ---  | ---     | ---                                     |
| 1-5  | Troll   | Only if there is a bridge nearby        |
| 6-8  | Orcs    | Roll 1d6 for number of orcs in the band |
```

To roll for a random encounter from the cli, you would do:

```
$ tablet roll ./monster_encounters.md
```

`tablet` will roll a `d20` for you. If, say, it rolls a 12, which is not in
the table, it will interactively ask you for the values of the new entry, and
save it to the file. That way one can initially create minimal tables, and
populate them incrementally. 


## From the CLI

### tablet roll <table_file>

Randomly picks an entry of the table, and prints it (in Markdown format). If the
rolled value doesn't have a corresponding entry, the user will interactively
be asked to provide the entry's values, which will then be saved in the file.

The output format can be set via the `--output` option, and defaults to the 
format of the table file.

### tablet print <table_file>

Prints the table to stdout.

The output format can be set via the `--output` option, and defaults to the 
format of the table file.

## Table Format

### Markdown

The file can have
an optional frontmatter for metadata, and the table itself is using the GFM
table syntax.

For example:

``` 
---
roll: 1d100
subtable: sub-table
---

| roll  | species | sub-table           | 
| ----  | ---     | ---                 |
| 1-10  | Human   |                     |
| 11-20 | Monster | species/monsters.md |
```

### YAML

The file can have one or two YAML documents. If there is one, it's assumed to
be the entries, if there are two, they are assumed to be the metadata and the
entries, respectively.

For example:

```
---
roll: 1d100
---
- roll: 1-20
  species: Human
- roll: 21-30
  species: Kobold
- roll: 87
  species: Troll
- roll: 51
  species: Widget
- roll: 65
  species: Bump
```

### JSON

The JSON document is expected to have the key `entries`, and optionally
`metadata`.

For example:

```
{
  "entries": [
    {
      "roll": "1-20",
      "species": "Human"
    },
    {
      "roll": "21-30",
      "species": "Kobold"
    }
  ],
  "metadata": {
    "roll": "1d100"
  }
}
```

### CSV

A regular CSV file. You can add metadata as commented out lines, which will 
be interpreted as a YAML document.

For example:

```
# roll: 1d100
1-20, Human
21-30, Kobold
```

### Metadata

* `roll` - what to roll when we want an entry of the table. The package [roll](https://www.npmjs.com/package/roll) is used for the roll syntax.
* `subtable` - column name determining a sub-table file to roll for. If there is no sub-table value for the row, no further rolling is done. Optional.

### Row data 

If a table is table that can be rolled against, it requires a `roll` column, which either contains a single number or a range (e.g., `10-21`). 

## Etymology

Incidentally, The name `tablet` is a nod to Gizmo Mathboy, dear friend and dreaded DM, who has a looooong-standing
thread of translated Mesopotamian tablets on his
[blog](https://www.gizmomathboy.com/blog/page/my_cuneiform_tablets/day1889.html) and Mastodon. 

