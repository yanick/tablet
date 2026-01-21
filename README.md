# @yanick/tablet

I play roleplaying game (I know, I know: "nerd!"), and I like to write small
utility scripts to help with character creation, encounter tables, and
whatnots (assessment correction: "humongous nerd!"). This package provides
some tools to access, populate, and use data tables for those games.

The name `tablet` is a nod to my revered DM, who has a looooong-standing
thread on his blog and Mastodon where he posts translations of old
Mesopotamian tablets. 

## Installation 

    pnpm install @yanick/tablet

Or, to make the script `tablet` available globally:

    npm install -g @yanick/tablet
    

## From the CLI

### tablet roll <table_file>

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

* `roll` - what to roll when we want an entry of the table.
* `subtable` - column name determining a sub-table file to roll for. If there is no sub-table value for the row, no further rolling is done. Optional.

### Row data 

If a table is table that can be rolled against, it requires a `roll` column, which either contains a single number or a range (e.g., `10-21`). 
