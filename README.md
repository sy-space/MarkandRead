# Mark and Read

A small personal Obsidian plugin.

It highlights English words or phrases that you once marked as unfamiliar.


---

## Features

You mark a word once.

After that:

- it is stored in a Canvas file
- it is highlighted everywhere in your notes
- unfamiliar cards appear in a sidebar with definition
- phrase and word highlights use different colors

Optional:

- AI definition generation (Zhipu AI only)

---

## Card Format

Each card is a Canvas text node:

```
word or phrase

(optional definition)

#word or #phrase
#unfamiliar or #familiar
```

The Canvas file is the source of truth.  
Editing tags directly in Canvas updates highlights automatically.

---

## Usage

Select a word → right click → **Add to Reading Canvas**

That’s it.

If a word becomes familiar:

Edit the Canvas card and change:

```
#unfamiliar → #familiar
```

The highlight disappears automatically.

---
## To BE DONE

- [ ] Click sidebar entry → jump to first occurrence in document
- [ ] Hover highlighted word → show inline definition 
- [ ] Support PDF highlighting
- [ ] Card UI color system based on mastery level
- [ ] More AI providers
- [ ] Offline fallback dictionary
 
