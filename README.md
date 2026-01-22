# @yanick/tablet

I play role-playing games (neeeerd!), and moreover I like to write scripts and
whatnots (humongous neeeerd!) to create characters, roll events, etc.
Enter `tablet`, which is meant to provide tools to access, populate, and use role-playing game data tables.

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

Incidentally, The name `tablet` is a nod to my revered DM, who has a looooong-standing
thread on his blog and Mastodon where he posts translations of old
Mesopotamian tablets. 

## Installation 

    pnpm install @yanick/tablet

Or, to make the script `tablet` available globally:

    npm install -g @yanick/tablet
    

## From the CLI

### tablet roll <table_file>

Randomly picks an entry of the table, and prints it (in JSON format). If the
rolled value doesn't have a corresponding entry, the user will interactively
be asked to provide the entry's values, which will then be saved in the file.

## Table Format

Tables are kept in Markdown files (more formats upcoming). The files can have
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

### Metadata

* `roll` - what to roll when we want an entry of the table. The package [roll](https://www.npmjs.com/package/roll) is used for the roll syntax.
* `subtable` - column name determining a sub-table file to roll for. If there is no sub-table value for the row, no further rolling is done. Optional.

### Row data 

If a table is table that can be rolled against, it requires a `roll` column, which either contains a single number or a range (e.g., `10-21`). 
